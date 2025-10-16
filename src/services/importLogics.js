import customerModel from "../infrastructure/models/chit/customerModel.js";
import countryModel from "../infrastructure/models/chit/countryModel.js";
import cityModel from "../infrastructure/models/chit/cityModel.js";
import stateModel from "../infrastructure/models/chit/stateModel.js";
import schemeAccountModel from "../infrastructure/models/chit/schemeAccountModel.js";
import schemeModel from "../infrastructure/models/chit/schemeModel.js";
import schemeClassificationModel from "../infrastructure/models/chit/schemeClassificationModel.js";
import branchModel from "../infrastructure/models/chit/branchModel.js";
import paymentModeModel from "../infrastructure/models/chit/paymentModeModel.js";
import paymentModel from "../infrastructure/models/chit/paymentModel.js";
import crypto from "crypto";

const BATCH_SIZE = 1000;

class UploadError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "UploadError";
    this.details = details;
    this.isOperational = true;
  }

  toResponse() {
    return {
      success: false,
      message: this.message,
      ...this.details,
    };
  }
}

const randomInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function convertToISOString(dateStr) {
  if (!dateStr) return null;

  try {
    if (typeof dateStr === "number") {
      const date = new Date((dateStr - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date.toISOString();
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return new Date(dateStr + "T00:00:00Z").toISOString();
    }

    const [day, month, year] = dateStr.replace(/[-]/g, "/").split("/");
    if (!day || !month || !year) {
      throw new Error("Invalid date format");
    }

    return new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
  } catch (error) {
    throw new UploadError("Invalid date format", {
      field: "date",
      value: dateStr,
    });
  }
}

// function parseCustomDate(dateStr) {
//   if (!dateStr) return null;

//   if (dateStr instanceof Date) return dateStr;
//   if (typeof dateStr === "string" && !isNaN(new Date(dateStr).getTime())) {
//     return new Date(dateStr);
//   }

//   if (!isNaN(dateStr)) {
//     const excelDate = excelDateToJSDate(dateStr);
//     if (excelDate && !isNaN(excelDate.getTime())) return excelDate;
//   }

//   if (typeof dateStr === "string") {
//     const ddMmYyMatch = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{2}|\d{4})$/);
//     if (ddMmYyMatch) {
//       const [_, day, month, year] = ddMmYyMatch;
//       const fullYear =
//         year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);

//       const date = new Date(
//         fullYear,
//         parseInt(month, 10) - 1,
//         parseInt(day, 10)
//       );

//       if (!isNaN(date.getTime())) return date;
//     }
//   }

//   return null;
// }
function parseCustomDate(dateStr) {
  if (!dateStr) return null;

  if (dateStr instanceof Date) return dateStr;
  if (typeof dateStr === "string" && !isNaN(new Date(dateStr).getTime())) {
    return new Date(dateStr);
  }

  if (!isNaN(dateStr)) {
    const excelDate = excelDateToJSDate(dateStr);
    if (excelDate && !isNaN(excelDate.getTime())) return excelDate;
  }

  if (typeof dateStr === "string") {
    // Updated regex to handle both dots and slashes
    const ddMmYyMatch = dateStr.match(/^(\d{2})[\.\/](\d{2})[\.\/](\d{2}|\d{4})$/);
    if (ddMmYyMatch) {
      const [_, day, month, year] = ddMmYyMatch;
      const fullYear =
        year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);

      const date = new Date(
        fullYear,
        parseInt(month, 10) - 1,
        parseInt(day, 10)
      );

      if (!isNaN(date.getTime())) return date;
    }
  }

  return null;
}


const excelDateToJSDate = (excelDate) => {
  if (!excelDate) return null;
  if (typeof excelDate === "number") {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }
  return new Date(excelDate);
};

const handleCustomerUpload = async (data) => {
  try {
    console.log(data, "data");
    const normalizeString = (str) =>
      str?.toString().toLowerCase().replace(/\s+/g, "").trim() || "";
    const normalizeMobile = (mobile) =>
      mobile?.toString().replace(/\D/g, "").trim() || "";
    const normalizeBranchName = (str) => {
      if (!str) return "";
      return str
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z]/g, "")
        .replace(/jewel(?:l?)ery/g, "jewellery")
        .trim();
    };

    console.time("Check for duplicate mobiles in upload data");
    const seenMobiles = new Set();
    const duplicateMobilesInUpload = new Set();

    const uniqueUploadData = [];
    const skipped = [];

    data.forEach((customer, index) => {
      const mobile = normalizeMobile(customer.mobile);
      if (mobile) {
        if (seenMobiles.has(mobile)) {
          duplicateMobilesInUpload.add(mobile);
          skipped.push({
            line: index + 2,
            originalData: customer,
            errors: [{ field: "mobile", message: "Duplicate mobile in file" }],
          });
        } else {
          seenMobiles.add(mobile);
          uniqueUploadData.push(customer);
        }
      } else {
        skipped.push({
          line: index + 2,
          originalData: customer,
          errors: [{ field: "mobile", message: "Missing or invalid mobile" }],
        });
      }
    });
    console.timeEnd("Check for duplicate mobiles in upload data");

    console.time("Check for existing mobiles in database");
    const uploadMobiles = uniqueUploadData
      .map((c) => normalizeMobile(c.mobile))
      .filter((m) => m);

    const existingCustomers = await customerModel
      .find({ mobile: { $in: uploadMobiles } }, { mobile: 1 })
      .lean();

    const existingMobiles = new Set(
      existingCustomers.map((c) => normalizeMobile(c.mobile))
    );

    const filteredUploadData = uniqueUploadData.filter((customer, index) => {
      const mobile = normalizeMobile(customer.mobile);
      if (existingMobiles.has(mobile)) {
        skipped.push({
          line: index + 2,
          originalData: customer,
          errors: [{ field: "mobile", message: "Mobile already exists in DB" }],
        });
        return false;
      }
      return true;
    });
    console.timeEnd("Check for existing mobiles in database");

    console.time("Fetching reference data");
    const [countries, states, cities, branch] = await Promise.all([
      countryModel.find({}, { country_name: 1 }),
      stateModel.find({}, { state_name: 1 }),
      cityModel.find({}, { city_name: 1 }),
      branchModel.find({}, { branch_name: 1 }),
    ]);
    console.timeEnd("Fetching reference data");

    const countryMap = new Map(
      countries.map((c) => [normalizeString(c.country_name), c._id])
    );
    const stateMap = new Map(
      states.map((s) => [normalizeString(s.state_name), s._id])
    );
    const cityMap = new Map(
      cities.map((c) => [normalizeString(c.city_name), c._id])
    );
    const branchMap = new Map(
      branch.map((c) => [normalizeBranchName(c.branch_name), c._id])
    );

    const processedData = [];

    console.time("Validation time");
    for (let index = 0; index < filteredUploadData.length; index++) {
      const customer = filteredUploadData[index];
      const errors = [];

      try {
        const rawCountry = customer.id_country;
        const rawState = customer.id_state;
        const rawCity = customer.id_city;
        const branch = customer.id_branch;

        if (!rawCountry || !rawState || !rawCity) {
          errors.push({
            field: "location",
            message: "Country, state, and city are required",
            values: { country: rawCountry, state: rawState, city: rawCity },
          });
          throw new Error("Missing location data");
        }

        const normalizedCountry = normalizeString(rawCountry);
        const normalizedState = normalizeString(rawState);
        const normalizedCity = normalizeString(rawCity);
        const normalizedBranch = normalizeBranchName(branch);

        const countryId = countryMap.get(normalizedCountry);
        const stateId = stateMap.get(normalizedState);
        const cityId = cityMap.get(normalizedCity);
        const branchId = branchMap.get(normalizedBranch);

        if (!countryId || !stateId || !cityId) {
          errors.push({
            field: "location_reference",
            message: "Invalid location reference",
            values: {
              country: !countryId ? rawCountry : undefined,
              state: !stateId ? rawState : undefined,
              city: !cityId ? rawCity : undefined,
            },
          });
          throw new Error("Invalid location reference");
        }

        let gender = 0;
        if (/^male$/i.test(customer.gender)) gender = 1;
        else if (/^female$/i.test(customer.gender)) gender = 2;
        else gender = 3;

        processedData.push({
          ...customer,
          gender,
          id_branch: branchId,
          id_country: countryId,
          id_state: stateId,
          id_city: cityId,
        });
      } catch (error) {
        skipped.push({
          line: index + 2,
          originalData: customer,
          errors: errors.length ? errors : [{ message: error.message }],
        });
      }
    }
    console.timeEnd("Validation time");

    let inserted = [];
    if (processedData.length > 0) {
      console.time("Insert time");
      inserted = await customerModel.insertMany(processedData, {
        ordered: false,
      });
      console.timeEnd("Insert time");
    }

    return {
      success: true,
      insertedCount: inserted.length,
      skippedCount: skipped.length,
      skippedRecords: skipped,
      message:
        skipped.length > 0
          ? `Upload completed with ${skipped.length} skipped record(s).`
          : "All records inserted successfully.",
    };
  } catch (error) {
    console.error("Error in customer upload:", error);
    if (error instanceof UploadError) throw error;
    throw new UploadError("Failed to process customer upload", {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// function formatDate(dateStr) {
//   const regex = /^(\d{2})\.(\d{2})\.(\d{2})$/;
//   if (!regex.test(dateStr)) {
//     throw new Error("Invalid date format, expected dd.mm.yy");
//   }
//   return dateStr.replace(/\./g, "-");
// }
function formatDate(dateStr) {
  console.log(dateStr)
  const regex = /^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{2,4})$/;
  if (!regex.test(dateStr)) {
    throw new Error("Invalid date format, expected dd.mm.yy, dd/mm/yy, d.m.yy, or d/m/yyyy");
  }
  return dateStr.replace(/[\/\.]/g, "-");
}


const handleSchemeAccountUpload = async (data) => {
  try {
    console.log(data,"kdata")
    const normalizeString = (str) => str?.toString().toLowerCase().trim() || "";
    const normalizeScheme = normalizeString;
    const normalizeCustomer = (str) =>
      str?.toString().replace(/\D/g, "").trim() || "";
    const normalizeBranch = normalizeString;
    const normalizeClassification = (str) => {
      const normalized = normalizeString(str);
      if (/flexi.*fixed|fixed.*flexi/i.test(normalized)) return "flexi-fixed";
      if (/flexi/i.test(normalized)) return "flexi";
      if (/fixed/i.test(normalized)) return "fixed";
      return normalized;
    };

    console.time("Reference data preparation");
    const [schemes, customers, branches, classifications] = await Promise.all([
      schemeModel.find({}, { scheme_name: 1, code: 1 }).lean(),
      customerModel.find({}, { mobile: 1 }).lean(),
      branchModel.find({}, { branch_name: 1 }).lean(),
      schemeClassificationModel.find({}, { name: 1 }).lean(),
    ]);

    const validationResults = {
      validDocuments: [],
      skippedDocuments: [],
      errors: [],
    };

    const filteredData = data.filter((account, index) => {
      const customerMobile = normalizeCustomer(account.id_customer);
      if (customerMobile === "-") {
        validationResults.skippedDocuments.push({
          line: index + 2,
          customer: account.id_customer,
          message: `Skipped record - customer mobile is '-'`,
        });
        return false;
      }
      return true;
    });

    const missingCustomers = [];
    filteredData.forEach((account, index) => {
      const customerMobile = normalizeCustomer(account.id_customer);
      const customerExists = customers.some(
        (c) => normalizeCustomer(c.mobile) === customerMobile
      );
      if (!customerExists) {
        missingCustomers.push({
          line: index + 2,
          customer: account.id_customer,
          message: `Customer with mobile ${account.id_customer} not found`,
        });
      }
    });

    if (missingCustomers.length > 0) {
      throw new UploadError(
        `Cannot proceed with scheme account upload. ${missingCustomers.length} customer(s) not found.`,
        {
          missingCustomers,
          totalRecords: data.length,
        }
      );
    }

    const referenceMaps = {
      scheme: new Map(
        schemes.map((s) => [
          normalizeScheme(s.scheme_name),
          { id: s._id, code: s.code },
        ])
      ),
      customer: new Map(
        customers.map((c) => [normalizeCustomer(c.mobile), c._id])
      ),
      branch: new Map(
        branches.map((b) => [normalizeBranch(b.branch_name), b._id])
      ),
      classification: new Map(
        classifications.map((c) => [normalizeClassification(c.name), c._id])
      ),
    };
    console.timeEnd("Reference data preparation");

    console.time("Existing scheme counts lookup");
    const existingCounts = await schemeAccountModel.aggregate([
      {
        $group: {
          _id: { id_customer: "$id_customer", id_scheme: "$id_scheme" },
          maxSchemeCount: { $max: "$scheme_count_number" },
        },
      },
    ]);

    const schemeCountMap = new Map(
      existingCounts.map((acc) => [
        `${acc._id.id_customer}_${acc._id.id_scheme}`,
        acc.maxSchemeCount || 0,
      ])
    );
    console.timeEnd("Existing scheme counts lookup");

    console.time("Data validation and processing");
    const batchCounts = new Map();
    const generatedAccountNumbers = new Set();

    for (let index = 0; index < filteredData.length; index++) {
      const account = filteredData[index];
      const validationErrors = [];

      try {
        const references = {
          scheme: {
            value: account.id_scheme,
            normalized: normalizeScheme(account.id_scheme),
          },
          customer: {
            value: account.id_customer,
            normalized: normalizeCustomer(account.id_customer),
          },
          branch: {
            value: account["id_branch"],
            normalized: normalizeBranch(account["id_branch"]),
          },
          classification: {
            value: account.id_classification,
            normalized: normalizeClassification(account.id_classification),
          },
        };

        Object.entries(references).forEach(([key, ref]) => {
          const refData = referenceMaps[key].get(ref.normalized);
          if (!refData) {
            validationErrors.push({
              field: key,
              value: ref.value,
              message: `Reference not found for ${key}: ${ref.value}`,
            });
            return;
          }

          if (key === "scheme") {
            ref.id = refData.id;
            ref.code = refData.code;
          } else {
            ref.id = refData;
          }
        });

        if (validationErrors.length > 0) {
          throw new Error("Invalid references");
        }

        const customerSchemeKey = `${references.customer.id}_${references.scheme.id}`;
        const existingCount = schemeCountMap.get(customerSchemeKey) || 0;
        const currentBatchCount = batchCounts.get(customerSchemeKey) || 0;
        const nextSchemeCount = existingCount + currentBatchCount + 1;
        batchCounts.set(customerSchemeKey, currentBatchCount + 1);

        const schemeCode = references.scheme.code;
        let schemeAccNumber;
        let attempts = 0;
        const MAX_ATTEMPTS = 10;

        while (attempts++ < MAX_ATTEMPTS) {
          const randomDigits = randomInteger(1000, 9999);
          schemeAccNumber = `${schemeCode}${randomDigits}`;

          if (!generatedAccountNumbers.has(schemeAccNumber)) {
            const existingAccount = await schemeAccountModel
              .findOne({ scheme_acc_number: schemeAccNumber }, { _id: 1 })
              .lean();

            if (!existingAccount) {
              generatedAccountNumbers.add(schemeAccNumber);
              break;
            }
          }

          if (attempts >= MAX_ATTEMPTS) {
            validationErrors.push({
              field: "scheme_acc_number",
              value: schemeAccNumber,
              message: "Failed to generate unique account number",
            });
            throw new Error("Account number generation failed");
          }
        }

        // const startDate = excelDateToJSDate(account.start_date) || new Date();
        // if (!startDate || isNaN(startDate.getTime())) {
        //   validationErrors.push({
        //     field: 'start_date',
        //     value: account.start_date,
        //     message: 'Invalid date format'
        //   });
        //   throw new Error('Invalid date');
        // }
        const startDate = parseCustomDate(account.start_date);
        const maturityDate = parseCustomDate(account.maturity_date);
        const lastPaidDate = parseCustomDate(account.last_paid_date);

        if (!startDate || isNaN(startDate.getTime())) {
          validationErrors.push({
            field: "start_date",
            value: account.start_date,
            message:
              "Invalid date format. Expected DD.MM.YY, YYYY-MM-DD, or Excel date number",
          });
          throw new Error("Invalid date");
        }

        const document = {
          ...account,
          id_scheme: references.scheme.id,
          id_customer: references.customer.id,
          id_branch: references.branch.id,
          id_classification: references.classification.id,
          scheme_acc_number: schemeAccNumber,
          scheme_count_number: nextSchemeCount,
          // start_date: convertToISOString(account.start_date),
          maturity_date: account?.maturity_date !== "-" ? formatDate(account.maturity_date) :  null,
          // last_paid_date: excelDateToJSDate(account.last_paid_date),
          start_date: startDate.toISOString(),
          // maturity_date: maturityDate ? maturityDate.toISOString() : null,
          last_paid_date: lastPaidDate ? lastPaidDate.toISOString() : null,
          active: String(account.active ?? true),
          is_deleted: String(account.is_deleted ?? false),
          date_add: parseCustomDate(account.start_date)?.toISOString(),
          date_upd: new Date(),
          createdAt: parseCustomDate(account.start_date)?.toISOString(),
          updatedAt: new Date(),
        };

        // Clean up any unwanted properties
        delete document["id_branch/$oid"];
        validationResults.validDocuments.push(document);
      } catch (error) {
        validationResults.skippedDocuments.push({
          line: index + 2,
          originalData: account,
          errors: validationErrors.length
            ? validationErrors
            : [{ message: error.message }],
        });
      }
    }
    console.timeEnd("Data validation and processing");

    if (validationResults.skippedDocuments.length > 0) {
      throw new UploadError(
        `Upload partially failed. ${validationResults.skippedDocuments.length} invalid row(s) found.`,
        {
          skippedCount: validationResults.skippedDocuments.length,
          skippedRecords: validationResults.skippedDocuments,
          validCount: validationResults.validDocuments.length,
        }
      );
    }

    if (validationResults.validDocuments.length === 0) {
      throw new UploadError("No valid documents to insert", {
        validationResults,
      });
    }

    console.time("Database insertion");
    const insertionResults = {
      insertedCount: 0,
      batchesProcessed: 0,
      errors: [],
    };
return console.log(validationResults)
    for (
      let i = 0;
      i < validationResults.validDocuments.length;
      i += BATCH_SIZE
    ) {
      const batch = validationResults.validDocuments.slice(i, i + BATCH_SIZE);
      try {
        const result = await schemeAccountModel.insertMany(batch, {
          ordered: false,
        });
        insertionResults.insertedCount += result.length;
        insertionResults.batchesProcessed++;
      } catch (error) {
        insertionResults.errors.push({
          batchIndex: i,
          error: error.message,
          affectedDocuments:
            error.writeErrors?.map((e) => e.index) || "unknown",
        });
      }
    }
    console.timeEnd("Database insertion");

    if (insertionResults.errors.length > 0) {
      throw new UploadError("Partial insertion failed", {
        insertedCount: insertionResults.insertedCount,
        errorCount: insertionResults.errors.length,
        errors: insertionResults.errors,
      });
    }

    return {
      success: true,
      insertedCount: insertionResults.insertedCount,
      message: `Process completed. Inserted: ${insertionResults.insertedCount} records`,
    };
  } catch (error) {
    console.error("Error in scheme account upload:", error);
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError("Failed to process scheme account upload", {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const handlePaymentUpload = async (data) => {
  try {
    const normalizeString = (str) => str?.toString().toLowerCase().trim() || "";
    const normalizeScheme = normalizeString;
    const normalizeCustomer = (str) => str?.toString().trim() || "";
    const normalizeBranch = normalizeString;
    const normalizePaymentMode = normalizeString;

    console.time("Reference data preparation");
    const [
      schemes,
      customers,
      branches,
      schemeAccounts,
      paymentModes,
      lastReceipt,
    ] = await Promise.all([
      schemeModel.find({}, { scheme_name: 1 }).lean(),
      customerModel.find({}, { mobile: 1 }).lean(),
      branchModel.find({}, { branch_name: 1 }).lean(),
      schemeAccountModel
        .find(
          {},
          {
            scheme_acc_number: 1,
            scheme_count_number: 1,
            id_customer: 1,
            id_scheme: 1,
          }
        )
        .lean(),
      paymentModeModel
        .find({},{ mode_name: 1, _id: 1 })
        .lean(),
      paymentModel.findOne({}, { payment_receipt: 1 }).sort({ _id: -1 }),
    ]);

    const validationResults = {
      validDocuments: [],
      skippedDocuments: [],
      errors: [],
    };

    // Filter out records with "-" as mobile number first
    const validData = data.filter((payment, index) => {
      const customerMobile = normalizeCustomer(payment.id_customer);
      if (customerMobile === "-") {
        validationResults.skippedDocuments.push({
          line: index + 2,
          originalData: payment,
          errors: [{ message: "Skipped: Customer mobile number is '-'" }],
        });
        return false;
      }
      return true;
    });

    // Check for missing customers only on valid data
    const missingCustomers = [];
    validData.forEach((payment, index) => {
      const customerMobile = normalizeCustomer(payment.id_customer);
      const customerExists = customers.some(
        (c) => normalizeCustomer(c.mobile) === customerMobile
      );

      if (!customerExists) {
        missingCustomers.push({
          line: index + 2,
          customer: payment.id_customer,
          message: `Customer with mobile ${payment.id_customer} not found`,
        });
      }
    });

    if (missingCustomers.length > 0) {
      throw new UploadError(
        `Cannot proceed with payment upload. ${missingCustomers.length} customer(s) not found.`,
        {
          missingCustomers,
          totalRecords: data.length,
        }
      );
    }

    // Then check if all scheme accounts exist for valid data
    const missingSchemeAccounts = [];
    validData.forEach((payment, index) => {
      const customerMobile = normalizeCustomer(payment.id_customer);
      const schemeName = normalizeScheme(payment.id_scheme);

      const customer = customers.find(
        (c) => normalizeCustomer(c.mobile) === customerMobile
      );
      const scheme = schemes.find(
        (s) => normalizeScheme(s.scheme_name) === schemeName
      );

      if (customer && scheme) {
        const schemeAccountExists = schemeAccounts.some(
          (acc) =>
            acc.id_customer.toString() === customer._id.toString() &&
            acc.id_scheme.toString() === scheme._id.toString() &&
            acc.scheme_count_number === Number(payment.scheme_count_number || 1)
        );

        if (!schemeAccountExists) {
          missingSchemeAccounts.push({
            line: index + 2,
            customer: payment.id_customer,
            scheme: payment.id_scheme,
            scheme_count: payment.scheme_count_number || 1,
            message: `Scheme account not found for customer ${
              payment.id_customer
            }, scheme ${payment.id_scheme}, count ${
              payment.scheme_count_number || 1
            }`,
          });
        }
      }
    });

    if (missingSchemeAccounts.length > 0) {
      throw new UploadError(
        `Cannot proceed with payment upload. ${missingSchemeAccounts.length} scheme account(s) not found.`,
        {
          missingSchemeAccounts,
          totalRecords: data.length,
        }
      );
    }

    const referenceMaps = {
      scheme: new Map(
        schemes.map((s) => [normalizeScheme(s.scheme_name), s._id])
      ),
      customer: new Map(
        customers.map((c) => [normalizeCustomer(c.mobile), c._id])
      ),
      branch: new Map(
        branches.map((b) => [normalizeBranch(b.branch_name), b._id])
      ),
      schemeAccount: new Map(
        schemeAccounts.map((acc) => [
          `${acc.id_customer}_${acc.id_scheme}_${acc.scheme_count_number}`,
          { id: acc._id, scheme_count_number: acc.scheme_count_number },
        ])
      ),
      paymentMode: new Map(
        paymentModes.map((p) => [normalizePaymentMode(p.mode_name), p._id])
      ),
    };
    console.timeEnd("Reference data preparation");

    console.time("Data validation and processing");

    // Process only valid data (excluding records with "-" mobile)
    for (let index = 0; index < validData.length; index++) {
      const payment = validData[index];
      const validationErrors = [];

      try {
        const references = {
          scheme: {
            value: payment.id_scheme,
            normalized: normalizeScheme(payment.id_scheme),
          },
          customer: {
            value: payment.id_customer,
            normalized: normalizeCustomer(payment.id_customer),
          },
          branch: {
            value: payment.id_branch,
            normalized: normalizeBranch(payment.id_branch),
          },
          paymentMode: {
            value: payment.payment_mode,
            normalized: normalizePaymentMode(payment.payment_mode),
          },
        };

        Object.entries(references).forEach(([key, ref]) => {
          if (key === "paymentMode") {
            ref.id = referenceMaps.paymentMode.get(ref.normalized);
            if (!ref.id) {
              validationErrors.push({
                field: key,
                value: ref.value,
                message: `Payment mode not found: ${ref.value}`,
              });
            }
            return;
          }

          ref.id = referenceMaps[key].get(ref.normalized);
          if (!ref.id) {
            validationErrors.push({
              field: key,
              value: ref.value,
              message: `Reference not found for ${key}: ${ref.value}`,
            });
          }
        });

        if (validationErrors.length > 0) {
          throw new Error("Invalid references");
        }

        const customerSchemeKey = `${references.customer.id}_${
          references.scheme.id
        }_${payment.scheme_count_number || 1}`;
        const schemeAccount =
          referenceMaps.schemeAccount.get(customerSchemeKey);

        if (!schemeAccount) {
          validationErrors.push({
            field: "scheme_account",
            value: customerSchemeKey,
            message: `No scheme account found for customer ${
              references.customer.value
            }, scheme ${references.scheme.value}, count ${
              payment.scheme_count_number || 1
            }`,
          });
          throw new Error("Invalid scheme account");
        }

        let paymentDate = payment.createdAt ? parseCustomDate(payment.createdAt) : new Date()

        if (!paymentDate) {
          validationErrors.push({
            field: "payment_date",
            value: payment.createdAt,
            message: "Invalid date format",
          });
          throw new Error("Invalid date");
        }

        // Fixed variable name and calculation
        const metalRate = Number(payment.metal_rate) || 1;
        const paymentAmount = Number(payment.payment_amount) || 0;
        const metalWeight = paymentAmount / metalRate;

        const receiptNumber = generateReceiptNumber(
          schemeAccount.id.toString(),
          "REC",
          lastReceipt?.payment_receipt || "a1",
          true
        );
        const transactionId = crypto
          .createHash("sha256")
          .update(`${references.customer.id}${Date.now()}`)
          .digest("hex")
          .slice(0, 15);

        const document = {
          payment_receipt: receiptNumber,
          id_transaction: payment?.id_transaction || transactionId,
          id_scheme_account: schemeAccount.id,
          id_scheme: references.scheme.id,
          id_customer: references.customer.id,
          id_branch: references.branch.id,
          payment_mode: references.paymentMode.id,
          paymentModeName: references.paymentMode.normalized.toUpperCase(),
          payment_date: paymentDate,
          amount: Number(payment.amount) || 0,
          total_amount: Number(payment.total_amount) || 0,
          receipt_number: payment.receipt_number || "",
          remarks: payment.remarks || "",
          created_at: new Date(),
          updated_at: new Date(),
          creditedBonus: 0,
          digiBonus: 0,
          date_add: new Date(),
          payment_status: 1,
          metal_weight: payment?.metal_weight || metalWeight,
          metal_rate: metalRate,
          total_amt: 0,
          payment_amount: paymentAmount,
          cash_amount: 0,
          card_amount: 0,
          gpay_amount: 0,
          phone_pay: 0,
          payment_type: 1,
          paid_installments: payment?.paid_installments ? payment?.paid_installments : 1,
          date_payment: new Date(),
          createdAt:payment?.createdAt ? parseCustomDate(payment?.createdAt) : new Date()
        };

        validationResults.validDocuments.push(document);
      } catch (error) {
        validationResults.skippedDocuments.push({
          line: index + 2,
          originalData: payment,
          errors: validationErrors.length
            ? validationErrors
            : [{ message: error.message }],
        });
      }
    }
    console.timeEnd("Data validation and processing");

    // Rest of the code remains the same...
    if (validationResults.skippedDocuments.length > 0) {
      throw new UploadError(
        `Upload partially failed. ${validationResults.skippedDocuments.length} invalid row(s) found.`,
        {
          skippedCount: validationResults.skippedDocuments.length,
          skippedRecords: validationResults.skippedDocuments,
          validCount: validationResults.validDocuments.length,
        }
      );
    }

    if (validationResults.validDocuments.length === 0) {
      throw new UploadError("No valid documents to insert", {
        validationResults,
      });
    }

    console.time("Database insertion");
    const insertionResults = {
      insertedCount: 0,
      batchesProcessed: 0,
      errors: [],
    };

    for (
      let i = 0;
      i < validationResults.validDocuments.length;
      i += BATCH_SIZE
    ) {
      const batch = validationResults.validDocuments.slice(i, i + BATCH_SIZE);
      try {
        const result = await paymentModel.insertMany(batch, { ordered: false });
        insertionResults.insertedCount += result.length;
        insertionResults.batchesProcessed++;
      } catch (error) {
        insertionResults.errors.push({
          batchIndex: i,
          error: error.message,
          affectedDocuments:
            error.writeErrors?.map((e) => e.index) || "unknown",
        });
      }
    }
    console.timeEnd("Database insertion");

    if (insertionResults.errors.length > 0) {
      throw new UploadError("Partial insertion failed", {
        insertedCount: insertionResults.insertedCount,
        errorCount: insertionResults.errors.length,
        errors: insertionResults.errors,
      });
    }

    return {
      success: true,
      insertedCount: insertionResults.insertedCount,
      skippedCount: validationResults.skippedDocuments.length,
      message: `Process completed. Inserted: ${insertionResults.insertedCount} records, Skipped: ${validationResults.skippedDocuments.length} records`,
    };
  } catch (error) {
    console.error("Error in payment upload:", error);
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError("Failed to process payment upload", {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

let lastReceiptNumber = null;
let lastObj = null;

function generateReceiptNumber(objid, start = "REC", end = "a1", payment = false) {
  if (payment && lastReceiptNumber && objid === lastObj) {
    const parts = lastReceiptNumber.split("/");
    let suffix = parts[2];
    let [, letter, num] = suffix.match(/([a-z])(\d+)/);

    let nextLetter = letter;
    let nextNum = parseInt(num) + 1;

    if (nextNum > 99) {
      nextNum = 1;
      nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
    }

    const newSuffix = `${nextLetter}${nextNum}`;
    lastReceiptNumber = `${parts[0]}/${parts[1]}/${newSuffix}`;
    return lastReceiptNumber;
  }

  const last4 = objid.slice(-4);
  const [, currentLetter, currentNum] = end.match(/([a-z])(\d+)/) || ["", "a", "1"];
  let nextLetter = currentLetter;
  let nextNum = parseInt(currentNum) + 1;

  if (nextNum > 99) {
    nextNum = 1;
    nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
  }

  const newEnd = `${nextLetter}${nextNum}`;
  lastReceiptNumber = `${start}/${last4}/${newEnd}`;
  lastObj = objid;
  return lastReceiptNumber;
}



const processUploadedData = async (parsedData, field) => {
  try {
    const normalizedField = field.toLowerCase();

    switch (normalizedField) {
      case "customers":
        return await handleCustomerUpload(parsedData);
      case "schemeaccounts":
        return await handleSchemeAccountUpload(parsedData);
      case "payments":
        return await handlePaymentUpload(parsedData);
      default:
        throw new UploadError(`Unsupported upload field: ${field}`);
    }
  } catch (error) {
    console.error(`Error processing ${field} upload:`, error);
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(`Failed to process ${field} upload`, {
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export default processUploadedData;
