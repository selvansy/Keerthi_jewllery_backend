//!This controller is only for importing data to db from old db sql to new mongo, only accepts xlsx,xls,csv
import express from "express";
import XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import multer from "multer";
import processUploadedData from "../../../../../services/importLogics.js";

const router = express.Router();

// Accept only xlsx, xls, csv
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "text/csv", // .csv
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only xlsx, xls, or csv files are allowed"));
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter });

router.post("/", upload.single("file"), async (req, res) => {
  try {
    const { field } = req.body;
    if (!field) return res.status(400).json({ message: "Missing field type." });

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded." });

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    let data = [];

    if (fileName.endsWith(".csv")) {
      const content = fileBuffer.toString("utf-8");
      data = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({ message: "Unsupported file format." });
    }

    const output = await processUploadedData(data, field);
    if (output.skippedCount == 0) {
      return res.status(200).json({ message: output.message });
    } else {
      const [key, value] =
        Object.entries(output.skippedRecords[0].missingFields).find(
          ([_, v]) => v !== undefined
        ) || [];

      return res.status(400).json({
        message: output.message,
        error: key && value ? { [key]: value } : "Missing field data not found",
        errorLine:output.skippedRecords[0].line
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Import failed", error: err.message});
  }
});

export default router;
