import express from "express";
import XLSX from "xlsx";
import { parse } from "csv-parse/sync";
import multer from "multer";
import processUploadedData from "../../../../../services/importLogics.js";

const router = express.Router();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only xlsx, xls, or csv files are allowed"));
};

const upload = multer({ storage: multer.memoryStorage(), fileFilter });

// Helper function to create error Excel file
const createErrorExcelFile = (skippedRecords, originalHeaders = []) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare error data
    const errorData = skippedRecords.map(record => {
      const errorRow = {
        'Line Number': record.line,
        'Original Data': JSON.stringify(record.originalData),
        'Error Field': record.errors[0]?.field || 'Unknown',
        'Error Value': record.errors[0]?.value || 'N/A',
        'Error Message': record.errors[0]?.message || 'Unknown error',
        'All Errors': record.errors.map(err => 
          `${err.field || 'General'}: ${err.message}`
        ).join('; ')
      };
      
      // Add original data fields if available
      if (record.originalData && typeof record.originalData === 'object') {
        Object.keys(record.originalData).forEach(key => {
          errorRow[`Original_${key}`] = record.originalData[key];
        });
      }
      
      return errorRow;
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(errorData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Records');
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });
    
    return excelBuffer;
  } catch (error) {
    console.error('Error creating Excel file:', error);
    throw new Error('Failed to create error report');
  }
};

// Helper function to get original headers from data
const getHeadersFromData = (data) => {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
};

router.post("/", upload.single("file"), async (req, res) => {
  let originalData = [];
  let originalHeaders = [];

  try {
    const { field } = req.body;
    if (!field) return res.status(400).json({ success: false, message: "Missing field type." });

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    let data = [];

    try {
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
        const sheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json(sheet, { raw: true });
        data = rawData.map((row) => {
          const newRow = { ...row };

          for (const key in newRow) {
            const value = newRow[key];

            if (typeof value === "number" && value > 10000 && value < 60000) {
              const parsedDate = XLSX.SSF.parse_date_code(value);
              if (parsedDate) {
                const jsDate = new Date(Date.UTC(parsedDate.y, parsedDate.m - 1, parsedDate.d));
                newRow[key] = jsDate.toISOString().split("T")[0];
              }
            }
          }

          return newRow;
        });
      } else {
        return res.status(400).json({ success: false, message: "Unsupported file format." });
      }
    } catch (parseError) {
      console.error("File parsing error:", parseError);
      return res.status(400).json({ 
        success: false, 
        message: "Failed to parse the uploaded file",
        error: parseError.message 
      });
    }

    // Store original data and headers for error reporting
    originalData = data;
    originalHeaders = getHeadersFromData(data);

    const result = await processUploadedData(data, field);
    
    if (result.success) {
      const response = {
        success: true,
        message: result.message,
        insertedCount: result.insertedCount,
        skippedCount: result.skippedCount || 0
      };

      if (field.toLowerCase() === "customers" && result.skippedMobiles) {
        response.skippedMobiles = result.skippedMobiles;
      }

      if (result.skippedRecords && result.skippedRecords.length > 0) {
        response.skippedRecords = result.skippedRecords;
        
        // Generate and send error Excel file if there are skipped records
        const errorExcelBuffer = createErrorExcelFile(result.skippedRecords, originalHeaders);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="import_errors_${Date.now()}.xlsx"`);
        res.setHeader('Content-Length', errorExcelBuffer.length);
        
        return res.status(207).send(errorExcelBuffer);
      }

      return res.status(200).json(response);
    } else {
      if (result.skippedRecords && result.skippedRecords.length > 0) {
        // Generate and send error Excel file
        const errorExcelBuffer = createErrorExcelFile(result.skippedRecords, originalHeaders);
        
        // Set headers for file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="import_errors_${Date.now()}.xlsx"`);
        res.setHeader('Content-Length', errorExcelBuffer.length);
        
        return res.status(207).send(errorExcelBuffer);
      } else {
        return res.status(400).json({
          success: false,
          message: result.message,
          details: result.details || {}
        });
      }
    }
  } catch (err) {
    console.error("Import error:", err);
    
    if (err.name === 'UploadError') {
      const statusCode = err.details?.skippedCount ? 207 : 400;
      
      // If there are skipped records in error details, generate Excel file
      if (err.details?.skippedRecords && err.details.skippedRecords.length > 0) {
        const errorExcelBuffer = createErrorExcelFile(err.details.skippedRecords, originalHeaders);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="import_errors_${Date.now()}.xlsx"`);
        res.setHeader('Content-Length', errorExcelBuffer.length);
        
        return res.status(statusCode).send(errorExcelBuffer);
      }

      const errorResponse = {
        success: false,
        message: err.message,
        ...err.details
      };

      if (req.body.field?.toLowerCase() === "customers" && err.details?.skippedMobiles) {
        errorResponse.skippedMobiles = err.details.skippedMobiles;
      }

      return res.status(statusCode).json(errorResponse);
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        success: false,
        message: "File size too large" 
      });
    } else if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false,
        message: "File upload error",
        error: err.message 
      });
    } else {
      return res.status(500).json({ 
        success: false,
        message: "Import failed",
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
      });
    }
  }
});

router.post("/finish", async (req, res) => {
  try {
    const paymentSums = await Payment.aggregate([
      { $group: { _id: "$schemeAccountId", totalAmount: { $sum: "$amount" } } }
    ]);

    const bulkOps = paymentSums.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { amount: p.totalAmount } }
      }
    }));

    if (bulkOps.length > 0) {
      await SchemeAccount.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      success: true,
      message: "Scheme accounts updated successfully",
      updatedAccounts: bulkOps.length,
    });
  } catch (err) {
    console.error("Finish API Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to finish updating scheme accounts",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

export default router;