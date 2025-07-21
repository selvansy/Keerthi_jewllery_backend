import customerModel from "../infrastructure/models/chit/customerModel.js";
import countryModel from "../infrastructure/models/chit/countryModel.js";
import cityModel from "../infrastructure/models/chit/cityModel.js";
import stateModel from "../infrastructure/models/chit/stateModel.js";
import schemeAccountModel from "../infrastructure/models/chit/schemeAccountModel.js";
import schemeModel from "../infrastructure/models/chit/schemeModel.js";
import schemeClassificationModel from "../infrastructure/models/chit/schemeClassificationModel.js";
import branchModel from "../infrastructure/models/chit/branchModel.js";
import schemeStatusModel from "../infrastructure/models/chit/schemeStatusModel.js";



const handleCustomerUpload = async (data) => {
    try {
      const normalizeString = (str) =>
        str?.toString().toLowerCase().replace(/\s+/g, "").trim() || "";
  
      console.time("Fetching reference data");
  
      const [countries, states, cities] = await Promise.all([
        countryModel.find({}, { country_name: 1 }),
        stateModel.find({}, { state_name: 1 }),
        cityModel.find({}, { city_name: 1 }),
      ]);
  
      console.timeEnd("Fetching reference data");
  
      const countryMap = new Map(countries.map((c) => [normalizeString(c.country_name), c._id]));
      const stateMap = new Map(states.map((s) => [normalizeString(s.state_name), s._id]));
      const cityMap = new Map(cities.map((c) => [normalizeString(c.city_name), c._id]));
  
      const processedData = [];
      const skipped = [];
  
      console.time("Validation time");
  
      for (let index = 0; index < data.length; index++) {
        const customer = data[index];
  
        const rawCountry = customer.id_country;
        const rawState = customer.id_state;
        const rawCity = customer.id_city;
  
        const normalizedCountry = normalizeString(rawCountry);
        const normalizedState = normalizeString(rawState);
        const normalizedCity = normalizeString(rawCity);
  
        const countryId = countryMap.get(normalizedCountry);
        const stateId = stateMap.get(normalizedState);
        const cityId = cityMap.get(normalizedCity);
  
        if (!countryId || !stateId || !cityId) {
          skipped.push({
            line: index + 2,
            originalData: customer,
            missingFields: {
              country: !countryId ? rawCountry : undefined,
              state: !stateId ? rawState : undefined,
              city: !cityId ? rawCity : undefined,
            },
          });
          continue;
        }
  
        processedData.push({
          ...customer,
          id_country: countryId,
          id_state: stateId,
          id_city: cityId,
        });
      }
  
      console.timeEnd("Validation time");
  
      if (skipped.length > 0) {
        console.warn(`❌ Upload skipped. ${skipped.length} invalid row(s) found.`);
        return {
          insertedCount: 0,
          skippedCount: skipped.length,
          skippedRecords: skipped,
          message: "Upload aborted. Some records have missing references.",
        };
      }
  
      console.time("Insert time");
  
      const inserted = await customerModel.insertMany(processedData, { ordered: false });
  
      console.timeEnd("Insert time");
  
      return {
        insertedCount: inserted.length,
        skippedCount: 0,
        skippedRecords: [],
        message: "All records inserted successfully.",
      };
    } catch (error) {
      console.error("Fatal error during customer upload:", error);
      throw error;
    }
  };
  
// const handleSchemeUpload = async (data) => {
//   // await schemeModel.insertMany(data);
// };

const BATCH_SIZE = 1000; // Chunk size for insert

const handleSchemeAccountUpload = async (data) => {
  try {
    const normalizeString = (str) =>
      str?.toString().toLowerCase().replace(/\s+/g, "").trim() || "";

    console.time("Fetching reference data");

    // Fetch all reference data in parallel
    const [schemes, customers, branches, classifications, statuses] = await Promise.all([
      schemeModel.find({}, { scheme_name: 1 }),
      customerModel.find({}, { mobile: 1 }),
      branchModel.find({}, { branch_name: 1 }),
      schemeClassificationModel.find({}, { name: 1 }),
      schemeStatusModel.find({}, { status_name: 1 })
    ]);

    console.timeEnd("Fetching reference data");

    // Create lookup maps
    const schemeMap = new Map(schemes.map(s => [normalizeString(s.scheme_name), s._id]));
    const customerMap = new Map(customers.map(c => [normalizeString(c.mobile), c._id]));
    const branchMap = new Map(branches.map(b => [normalizeString(b.branch_name), b._id]));
    const classificationMap = new Map(classifications.map(c => [normalizeString(c.name), c._id]));
    const statusMap = new Map(statuses.map(s => [normalizeString(s.status_name), s._id]));
    
    const processedData = [];
    const skipped = [];
    
    console.time("Validation time");

    for (let index = 0; index < data.length; index++) {
      const account = data[index];

      const normalizedScheme = normalizeString(account.id_scheme);
    //   const normalizedCustomer = normalizeString(account.id_customer);
    //   const normalizedBranch = normalizeString(account.id_branch);
    //   const normalizedClassification = normalizeString(account.id_classification);
    //   const normalizedStatus = normalizeString(account.status);


      const schemeId = schemeMap.get(normalizedScheme);
    //   const customerId = customerMap.get(normalizedCustomer);
    //   const branchId = branchMap.get(normalizedBranch);
    //   const classificationId = classificationMap.get(normalizedClassification);
    //   const statusId = statusMap.get(normalizedStatus);

    //   if (!schemeId || !customerId || !branchId || !classificationId || !statusId) {
    //     skipped.push({
    //       line: index + 2,
    //       originalData: account,
    //       missingFields: {
    //         scheme: !schemeId ? account.id_scheme : undefined,
    //         customer: !customerId ? account.id_customer : undefined,
    //         branch: !branchId ? account.id_branch : undefined,
    //         classification: !classificationId ? account.id_classification : undefined,
    //         status: !statusId ? account.status : undefined,
    //       }
    //     });
    //     continue;
    //   }

      processedData.push({
        ...account,
        id_scheme: schemeId,
        id_customer: customerId,
        id_branch: branchId,
        id_classification: classificationId,
        status: statusId
      });
    }

    console.timeEnd("Validation time");

    if (processedData.length === 0) {
      return {
        insertedCount: 0,
        skippedCount: skipped.length,
        skippedRecords: skipped,
        message: "No valid records to insert.",
      };
    }

    console.time("Insert time");

    // Batch insert to avoid overloading MongoDB
    let totalInserted = 0;
    for (let i = 0; i < processedData.length; i += BATCH_SIZE) {
      const chunk = processedData.slice(i, i + BATCH_SIZE);
      const inserted = await schemeAccountModel.insertMany(chunk, {
        ordered: false,
        lean: true, // skip document hydration
        rawResult: false,
      });
      totalInserted += inserted.length;
    }

    console.timeEnd("Insert time");

    return {
      insertedCount: totalInserted,
      skippedCount: skipped.length,
      skippedRecords: skipped,
      message: `✅ ${totalInserted} records inserted. ❌ ${skipped.length} skipped.`,
    };
  } catch (error) {
    console.error("❌ Fatal error during scheme account upload:", error);
    throw error;
  }
};


const handlePaymentUpload = async (data) => {
  // await paymentModel.insertMany(data);
};

const processUploadedData = async (parsedData, field) => {
    try {

      const normalizedField = field.toLowerCase();
      
      switch (normalizedField) {
        case "customers":
          return await handleCustomerUpload(parsedData);
        
        // case "scheme":
        //   await handleSchemeUpload(parsedData);
        //   return { success: true, count: parsedData.length };
        
        case "schemeaccounts":
          await handleSchemeAccountUpload(parsedData);
          return { success: true, count: parsedData.length };
        
        case "payments":
          await handlePaymentUpload(parsedData);
          return { success: true, count: parsedData.length };
        
        default:
          throw new Error(`Unsupported upload field: ${field}`);
      }
    } catch (error) {
      console.error(`Error processing ${field} upload:`, error);
      throw error;
    }
  };

export default processUploadedData;
