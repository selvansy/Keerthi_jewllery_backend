import { isValidObjectId, Types } from "mongoose";
import mongoose from "mongoose";
import moment from "moment-timezone";
class ReportUseCase {
  constructor(reportRepo, branchRepo) {
    this.reportRepo = reportRepo;
    this.branchRepo = branchRepo;
  }

  addOneDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }

  async overAllReport(query) {
    const {
      page,
      limit,
      from_date,
      to_date,
      id_branch,
      id_scheme,
      search,
      id_classification,
      sort,
    } = query;

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * pageSize;
    const filter = { is_deleted: false,active:true};

    let dateFilter = {};
  
    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      dateFilter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      dateFilter.createdAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ category_name: { $regex: searchRegex } }];
    }

    if (isValidObjectId(id_branch)) {
      filter.id_branch = new Types.ObjectId(id_branch) ;
    }

  // Convert string IDs to ObjectId
    if (id_branch && isValidObjectId(id_branch)) {
      filter.id_branch =  new Types.ObjectId(id_branch);
    }

    if (id_scheme && isValidObjectId(id_scheme)) {
      filter._id =  new Types.ObjectId(id_scheme);
    }
    
    if (id_classification && isValidObjectId(id_classification)) {
      filter.id_classification =  new Types.ObjectId(id_classification);
    }
    // Fetch category with filters
    const { data, totalDocs, totalPages } = await this.reportRepo.overAllReport(
      filter,
      skip,
      pageSize,
      sort ?? {},
      dateFilter
    );
    return { data, totalDocs, totalPages };
  }

  async overduesummary(filterdata) {
    try {
      const {
        page,
        limit,
        from_date,
        to_date,
        id_scheme,
        id_branch,
        search,
        sort,
      } = filterdata;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      let query = { status: 0 };

      if (id_branch) {
        if (!isValidObjectId(id_branch))
          return { success: false, message: "Provide a valid Branch Id" };
        query.id_branch = new mongoose.Types.ObjectId(id_branch);
      }
      if (id_scheme) {
        if (!isValidObjectId(id_scheme))
          return { success: false, message: "Provide a valid id_scheme" };

        query._id = new mongoose.Types.ObjectId(id_scheme);
      }

      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }

        const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
        const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();
  
        query.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      } else {
        const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();
  
        query.createdAt = {
          $gte: startOfToday,
          $lte: endOfToday,
        };
      }

      const dueData = await this.reportRepo.pendingDuePayment(
        pageNum,
        pageSize,
        query,
        sort ?? ""
      );

      if (!dueData || !dueData || dueData.length === 0) {
        return { message: "No pending due records found", data: [] };
      }
      return {
        message: "Pending due data fetched successfully",
        data: dueData
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting Pending due data",
      };
    }
  }

  async countSummaryReportController({
    page = 1,
    limit = 10,
    id_scheme,
    id_classification,
    id_branch,
    from_date,
    to_date,
    search,
  }) {
    const query = { active: true };

    if (id_branch) {
      if (!isValidObjectId(id_branch))
        return { success: false, message: "Provide a valid Branch Id" };
      query.id_branch = new mongoose.Types.ObjectId(id_branch);
    }
    if (id_scheme) {
      if (!isValidObjectId(id_scheme))
        return { success: false, message: "Provide a valid id_scheme" };

      query._id = new mongoose.Types.ObjectId(id_scheme);
    }

    if (id_classification) {
      if (!isValidObjectId(id_classification))
        return { success: false, message: "Provide a valid id_classification" };
      query.id_classification = new mongoose.Types.ObjectId(id_classification);
    }

    let fromDate;
    let toDate;

    if (from_date && to_date) {
      fromDate = new Date(from_date);
      toDate = new Date(to_date);

      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        throw new Error("Invalid date format.");
      }
    } else {
      const currentDate = new Date();
      fromDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
      toDate = new Date(currentDate.setHours(0, 0, 0, 0));
    }

    query.start_date = { $gte: this.addOneDay(fromDate), $lte: toDate };

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const schemes = await this.reportRepo.accountSummary(
      query,
      search,
      skip,
      limit
    );
    return {
      data: schemes.data,
      totalDocuments: schemes.totalDocuments,
      totalPages: Math.ceil(schemes.totalDocuments / pageSize),
      currentPage: pageNum,
    };
  }

  async getPaymentSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_branch,
    payment_mode,
    from_date,
    to_date,
    search,
  }) {
    try {
      const query = { active: true, is_deleted: false,payment_status:1};
  
      // Date range handling with timezone adjustment
      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }
  
        // Convert to UTC with timezone adjustment (Asia/Kolkata - UTC+5:30)
        const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
        const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();
  
        query.date_payment = {
          $gte: startDate,
          $lte: endDate,
        };
      } else {
        // Default to today's date in local timezone
        const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();
  
        query.date_payment = {
          $gte: startOfToday,
          $lte: endOfToday,
        };
      }
  
      // Branch filter
      if (id_branch) {
        if (!isValidObjectId(id_branch)) {
          return { success: false, message: "Provide a valid Branch Id" };
        }
        query.id_branch = new mongoose.Types.ObjectId(id_branch);
      }
  
      // Scheme filter
      if (id_scheme) {
        if (!isValidObjectId(id_scheme)) {
          return { success: false, message: "Provide a valid id_scheme" };
        }
        query.id_scheme = new mongoose.Types.ObjectId(id_scheme);
      }
  
      // Payment mode filter
      if (payment_mode) {
        if (!isValidObjectId(payment_mode)) {
          return { success: false, message: "Provide a valid payment_mode" };
        }
        query.payment_mode = new mongoose.Types.ObjectId(payment_mode);
      }
  
      // Search functionality
      if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
          { id_transaction: { $regex: searchRegex } },
          { remark: { $regex: searchRegex } },
          { itr_utr: { $regex: searchRegex } },
          { account_name: { $regex: searchTerm, $options: "i" } },
          { scheme_acc_number: { $regex: searchTerm, $options: "i" } },
        ];
      }
  
      // Pagination
      const pageNum = parseInt(page) || 1;
      const perPage = parseInt(limit) || 10;
      const skip = (pageNum - 1) * perPage;
  
      // Get data from repository
      const { totalDocuments, totalPages, data } = await this.reportRepo.getPaymentReport(
        query,
        skip,
        perPage
      );

      console.log(data,"data")
  
      return {
        success: true,
        message: "Payment data retrieved successfully",
        totalDocuments,
        totalPages,
        currentPage: pageNum,
        data,
      };
    } catch (error) {
      console.error("Error in getPaymentSummary:", error);
      return {
        success: false,
        message: error.message || "Failed to retrieve payment data",
      };
    }
  }

  async accountCompleted({
    page = 1,
    limit = 10,
    id_scheme,
    id_branch,
    payment_mode,
    from_date,
    to_date,
    search,
  }) {
    const query = { active: true };

    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    if (id_branch) {
      if (!isValidObjectId(id_branch))
        return { success: false, message: "Provide a valid Branch Id" };
      query.id_branch = new mongoose.Types.ObjectId(id_branch);
    }
    if (id_scheme) {
      if (!isValidObjectId(id_scheme))
        return { success: false, message: "Provide a valid id_scheme" };

      query._id = new mongoose.Types.ObjectId(id_scheme);
    }

    if (payment_mode) {
      if (!isValidObjectId(payment_mode))
        return { success: false, message: "Provide a valid payment_mode" };
      query.payment_mode = new mongoose.Types.ObjectId(payment_mode);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;

    const skip = (pageNum - 1) * perPage;

    const { totalDocuments, totalPages, data } =
      await this.reportRepo.getCompletedAccount(skip, perPage, query);

    return {
      message: "Completed Account Data Retrived Successfuly",
      totalDocuments,
      totalPages,
      currentPage: pageNum,
      data,
    };
  }

  async getPreCloseSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_branch,
    search,
    from_date,
    to_date,
    sort = {},
  }) {
    const query = { active: true };

    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      // Convert to UTC with timezone adjustment (Asia/Kolkata - UTC+5:30)
      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      // Default to today's date in local timezone
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }
    

    if (id_branch) {
      if (!isValidObjectId(id_branch))
        return { success: false, message: "Provide a valid Branch Id" };
      query.id_branch = new mongoose.Types.ObjectId(id_branch);
    }
    if (id_scheme) {
      if (!isValidObjectId(id_scheme))
        return { success: false, message: "Provide a valid id_scheme" };

      query._id = new mongoose.Types.ObjectId(id_scheme);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;

    const skip = (pageNum - 1) * perPage;
    const { totalDocuments, totalPages, data } =
      await this.reportRepo.getPreCloseReport(query, skip, limit, sort);

    return {
      message: "Completed Account Data Retrived Successfuly",
      totalDocuments,
      totalPages,
      currentPage: pageNum,
      data,
    };
  }

  async getCloseSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_branch,
    search,
    from_date,
    to_date,
    sort = {},
  }) {
    const query = { active: true,status:1};

    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    if (id_branch) {
      if (!isValidObjectId(id_branch))
        return { success: false, message: "Provide a valid Branch Id" };
      query.id_branch = new mongoose.Types.ObjectId(id_branch);
    }
    if (id_scheme) {
      if (!isValidObjectId(id_scheme))
        return { success: false, message: "Provide a valid id_scheme" };

      query._id = new mongoose.Types.ObjectId(id_scheme);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;

    const skip = (pageNum - 1) * perPage;
    console.log(query)
    const { totalDocuments, totalPages, data } = await this.reportRepo.getCloseReport(query, skip, limit, sort);

    return {
      message: "Completed Account Data Retrived Successfuly",
      totalDocuments,
      totalPages,
      currentPage: pageNum,
      data,
    };
  }

  async getRefendSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_branch,
    search,
    from_date,
    to_date,
    sort = {},
  }) {
    const query = { active: true };

    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.updatedAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    if (id_branch) {
      if (!isValidObjectId(id_branch))
        return { success: false, message: "Provide a valid Branch Id" };
      query.id_branch = new mongoose.Types.ObjectId(id_branch);
    }
    if (id_scheme) {
      if (!isValidObjectId(id_scheme))
        return { success: false, message: "Provide a valid id_scheme" };

      query._id = new mongoose.Types.ObjectId(id_scheme);
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;

    const skip = (pageNum - 1) * perPage;
    console.log(query)
    const { totalDocuments, totalPages, data } = await this.reportRepo.getRefendSummary(query, skip, limit, sort);

    return {
      message: "Completed Account Data Retrived Successfuly",
      totalDocuments,
      totalPages,
      currentPage: pageNum,
      data,
    };
  }

  async giftReport(filterdata) {
    try {
      const { page, limit, id_branch, search = "" } = filterdata;


      if (!id_branch) {
        return { success: false, message: "No branchId found" };
      }
      if (!mongoose.Types.ObjectId.isValid(id_branch)) {
        return { success: false, message: "Invalid branchId format" };
      }

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const searchTerm = search || "";

      // const searchCriteria = searchTerm
      //   ? { $or: [{ gift_name: { $regex: searchTerm, $options: "i" } }] }
      //   : {};


      const searchCriteria = {};

      if (searchTerm) {
        searchCriteria.$or = [
          { gift_name: { $regex: searchTerm, $options: "i" } },
          { gift_code: { $regex: searchTerm, $options: "i" } },
        ];
      }

      const query = {
        active: true,
        is_deleted:false,
        id_branch,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.reportRepo.getGiftReport({ query, documentskip, documentlimit });

      if (!Data || !Data.result || Data.result.length === 0) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "GiftStock retrieved successfully",
        data: Data.result,
        totalCount: Data.documents || 0,
        totalPages: Math.ceil((Data.documents || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in giftReport:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getAmountPayable(bodyData) {
    try {
      const { page, limit, from_date, to_date, type } = bodyData;
  
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const query = {
        active: true,
        is_deleted: false,
      };
      
      if (to_date) {
        const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();
        query.createdAt = {
          $lte: endDate,
        };
        if (from_date) {
          if (new Date(to_date) < new Date(from_date)) {
            throw new Error("End date cannot be before start date");
          }
          const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
          query.createdAt.$gte = startDate;
        }
      } else if (from_date) {
        const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
        query.createdAt = {
          $gte: startDate,
        };
      } else {
        const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();
  
        query.createdAt = {
          $gte: startOfToday,
          $lte: endOfToday,
        };
      }
  
      const documentSkip = (pageNum - 1) * pageSize;
      const documentLimit = pageSize;
  
      const Data = await this.reportRepo.getAmountPayable(
        query, 
        documentSkip, 
        documentLimit,
        type
      );

      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }
  
      return {
        success: true,
        message: "Scheme based details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: error.message || "Error while getting data" };
    }
  }

  async getEmployeeRefferal(bodyData) {
    try {
      const { page, limit, from_date, to_date,type} = bodyData;
  
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
  
      const query = {
        active: true,
        is_deleted: false,
      };
  
      if (from_date && to_date) {
        query.createdAt = {
          $gte: new Date(from_date),
          $lte: new Date(to_date), 
        };
      } else if (from_date) {
        query.createdAt = { $gte: new Date(from_date) };
      } else if (to_date) {
        query.createdAt = { $lte: new Date(to_date) }; 
      }
  
      const documentSkip = (pageNum - 1) * pageSize;
      const documentLimit = pageSize;
  
      const Data = await this.reportRepo.getEmployeeRefferal(
        query, 
        documentSkip, 
        documentLimit,
        type
      );

      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }
  
      return {
        success: true,
        message: "Employee referral details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getPaymentLedger(query) {
    try {
        const { page, limit, from_date, to_date, id_payment } = query;
        
        const pageNum = Math.max(1, parseInt(page) || 1);
        const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const skip = (pageNum - 1) * pageSize;

        const filter = { is_deleted: false };
        
        let startDate, endDate;
        
        if (from_date && to_date) {
            startDate = new Date(from_date);
            endDate = new Date(to_date);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error("Invalid date format. Use ISO format (YYYY-MM-DD)");
            }
        } else {
            startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }
        
        filter.createdAt = {
            $gte: startDate,
            $lte: endDate
        };

        const sanitizedFilter = Object.keys(filter).reduce((acc, key) => {
            if (filter[key] !== undefined && filter[key] !== null) {
                acc[key] = filter[key];
            }
            return acc;
        }, {});

        if(id_payment){
          sanitizedFilter.payment_mode = new mongoose.Types.ObjectId(id_payment)
        }

        console.log(sanitizedFilter,"pay")

        return await this.reportRepo.getPaymentLedger(sanitizedFilter, skip, pageSize);

    } catch (error) {
        console.error("Payment report error:", error);
        throw new Error(error.message || "Failed to generate payment report");
    }
}

async getCustomerRefferal(bodyData) {
  try {
    const { page, limit, from_date, to_date,type} = bodyData;

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const query = {
      active: true,
      is_deleted: false,
    };

    if (from_date && to_date) {
      query.createdAt = {
        $gte: new Date(from_date),
        $lte: new Date(to_date), 
      };
    } else if (from_date) {
      query.createdAt = { $gte: new Date(from_date) };
    } else if (to_date) {
      query.createdAt = { $lte: new Date(to_date) }; 
    }

    const documentSkip = (pageNum - 1) * pageSize;
    const documentLimit = pageSize;

    const Data = await this.reportRepo.getCustomerRefferal(
      query, 
      documentSkip, 
      documentLimit,
      type
    );

    if (!Data) {
      return { success: true, message: "No data found", data: [] };
    }

    return {
      success: true,
      message: "Employee referral details fetched successfully",
      data: Data.data,
      totalCount: Data.totalCount || 0,
      totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
      currentPage: pageNum,
    };
  } catch (error) {
    console.error("Error in data:", error);
    return { success: false, message: "Error while getting data" };
  }
}

  
  //!drill down api section 
  async getSchemeDetailedView(bodyData) {
    try {
      const {schemeid,page,limit,search,from_date,to_date} = bodyData;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const searchTerm = search || "";

      const searchCriteria = {};

      if (searchTerm) {
        searchCriteria.$or = [
          { gift_name: { $regex: searchTerm, $options: "i" } },
          { gift_code: { $regex: searchTerm, $options: "i" } },
        ];
      }

      const query = {
        active: true,
        is_deleted:false,
        ...searchCriteria,
      };

      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }
  
        // Convert to UTC with timezone adjustment (Asia/Kolkata - UTC+5:30)
        const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
        const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();
  
        query.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      } else {
        // Default to today's date in local timezone
        const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
        const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();
  
        query.createdAt = {
          $gte: startOfToday,
          $lte: endOfToday,
        };
      }

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.reportRepo.getSchemeDetailedView(query, documentskip, documentlimit,schemeid);
   
      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "Scheme based details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getAmountDetailedView(bodyData) {
    try {
      const { page, limit, from_date, to_date,id,type} = bodyData;
  
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
  
      const query = {
        active: true,
        is_deleted: false,
        paid_installments: { $gte: 1 },
      };

      let startDate= "";
      let endDate= "";
      let startOfToday="";
      let endOfToday="";
      
      if (from_date && to_date) {
        if (new Date(to_date) < new Date(from_date)) {
          throw new Error("End date cannot be before start date");
        }
         startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
         endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();
      }
      //  else {
      //    startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      //    endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();
  
      //   // query.createdAt = {
      //   //   $gte: startOfToday,
      //   //   $lte: endOfToday,
      //   // };
      // }
  
      const documentSkip = (pageNum - 1) * pageSize;
      const documentLimit = pageSize;

      const Data = await this.reportRepo.getAmountDetailedView(
        query, 
        documentSkip, 
        documentLimit,
        id,
        type,
        startDate,
        endDate
      );

      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "Scheme based details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getActiveAccounts(bodyData) {
    try {
      const { page, limit, from_date, to_date, id_customer } = bodyData;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 4;

      const query = {
        status:0,
        active:true
      };

      if (from_date && to_date) {
        query.createdAt = {
          $gte: new Date(from_date),
          $lte: new Date(to_date), 
        };
      } else if (from_date) {
        query.createdAt = { $gte: new Date(from_date) };
      } else if (to_date) {
        query.createdAt = { $lte: new Date(to_date) }; 
      }

      if (id_customer && isValidObjectId(id_customer)) {
        query.id_customer = new Types.ObjectId(id_customer);
      }

      const documentSkip = (pageNum - 1) * pageSize;
      const documentLimit = pageSize;


      const Data = await this.reportRepo.getActiveAccounts(
        query, 
        documentSkip, 
        documentLimit
      );

      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "Scheme based details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getRedeemedAccounts(bodyData) {
    try {
      const { page, limit, from_date, to_date, id_customer } = bodyData;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 4;

      const query = {
        status:1
      };

      if (from_date && to_date) {
        query.createdAt = {
          $gte: new Date(from_date),
          $lte: new Date(to_date), 
        };
      } else if (from_date) {
        query.createdAt = { $gte: new Date(from_date) };
      } else if (to_date) {
        query.createdAt = { $lte: new Date(to_date) }; 
      }

      if (id_customer && isValidObjectId(id_customer)) {
        query.id_customer = new Types.ObjectId(id_customer);
      }

      const documentSkip = (pageNum - 1) * pageSize;
      const documentLimit = pageSize;

      const Data = await this.reportRepo.getRedeemedAccounts(
        query, 
        documentSkip, 
        documentLimit
      );

      if (!Data) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "Scheme based details fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount || 0,
        totalPages: Math.ceil((Data.totalCount || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in data:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getAmountPayble(query) {
    const { page, limit, from_date, to_date, id_branch, id_purity, id_scheme } =
      query;

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * perPage;

    const filter = { is_deleted: false };

    // if (from_date && to_date) {
    //   const startDate = new Date(from_date);
    //   const endDate = new Date(to_date);

    //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    //     throw new Error("Invalid date format.");
    //   }

    //   filter.createdAt = {
    //     $gte: startDate,
    //     $lte: endDate,
    //   };
    // } else {
    //   const today = new Date();
    //   const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    //   const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    //   filter.createdAt = {
    //     $gte: startOfDay,
    //     $lte: endOfDay,
    //   };
    // }
    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      // Convert to UTC with timezone adjustment (Asia/Kolkata - UTC+5:30)
      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      // Default to today's date in local timezone
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.createdAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    if (id_branch) {
      if (!isValidObjectId(id_branch)) {
        return "Provide valid branch id";
      }

      const findBranch = await this.branchRepo.findById(id_branch);
      if (!findBranch) {
        return "Branch not found";
      }

      filter.id_branch = new mongoose.Types.ObjectId(id_branch);
    }

    if (id_purity) {
      if (!isValidObjectId(id_purity)) {
        return "Provide valid id_purity id";
      }

      filter.id_purity = new mongoose.Types.ObjectId(id_purity);
    }

    if (id_scheme) {
      if (!isValidObjectId(id_scheme)) {
        return "Provide valid id_scheme id";
      }

      filter.id_scheme = new mongoose.Types.ObjectId(id_scheme);
    }
console.log("first")
    const data = await this.reportRepo.getAmountPayble(filter, skip, limit);
    return data;
  }
  async getWeightPayble(query) {
    const { page, limit, from_date, to_date, id_branch, id_purity, id_scheme } =
      query;

    const pageNum = page ? parseInt(page) : 1;
    const perPage = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * perPage;

    const filter = { is_deleted: false };

    // if (from_date && to_date) {
    //   const startDate = new Date(from_date);
    //   const endDate = new Date(to_date);

    //   if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    //     throw new Error("Invalid date format.");
    //   }

    //   filter.createdAt = {
    //     $gte: startDate,
    //     $lte: endDate,
    //   };
    // } else {
    //   const today = new Date();
    //   const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    //   const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    //   filter.createdAt = {
    //     $gte: startOfDay,
    //     $lte: endOfDay,
    //   };
    // }
    if (from_date && to_date) {
      if (new Date(to_date) < new Date(from_date)) {
        throw new Error("End date cannot be before start date");
      }

      // Convert to UTC with timezone adjustment (Asia/Kolkata - UTC+5:30)
      const startDate = moment.tz(from_date, 'Asia/Kolkata').startOf('day').toDate();
      const endDate = moment.tz(to_date, 'Asia/Kolkata').endOf('day').toDate();

      query.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    } else {
      // Default to today's date in local timezone
      const startOfToday = moment.tz('Asia/Kolkata').startOf('day').toDate();
      const endOfToday = moment.tz('Asia/Kolkata').endOf('day').toDate();

      query.createdAt = {
        $gte: startOfToday,
        $lte: endOfToday,
      };
    }

    if (id_branch) {
      if (!isValidObjectId(id_branch)) {
        return "Provide valid branch id";
      }

      const findBranch = await this.branchRepo.findById(id_branch);
      if (!findBranch) {
        return "Branch not found";
      }

      filter.id_branch = new mongoose.Types.ObjectId(id_branch);
    }

    if (id_purity) {
      if (!isValidObjectId(id_purity)) {
        return "Provide valid id_purity id";
      }

      filter.id_purity = new mongoose.Types.ObjectId(id_purity);
    }

    if (id_scheme) {
      if (!isValidObjectId(id_scheme)) {
        return "Provide valid id_scheme id";
      }

      filter.id_scheme = new mongoose.Types.ObjectId(id_scheme);
    }

    const data = await this.reportRepo.getWeightPayble(filter, skip, limit);
    return data;
  }
  async giftReport(filterdata) {
    try {
      const { page, limit, id_branch, search = "" } = filterdata;

      if (!id_branch) {
        return { success: false, message: "No branchId found" };
      }
      if (!mongoose.Types.ObjectId.isValid(id_branch)) {
        return { success: false, message: "Invalid branchId format" };
      }

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const searchTerm = search || "";

      // const searchCriteria = searchTerm
      //   ? { $or: [{ gift_name: { $regex: searchTerm, $options: "i" } }] }
      //   : {};

      const searchCriteria = {};

      if (searchTerm) {
        searchCriteria.$or = [
          { gift_name: { $regex: searchTerm, $options: "i" } },
          { gift_code: { $regex: searchTerm, $options: "i" } },
        ];
      }

      const query = {
        active: true,
        id_branch,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.reportRepo.getGiftReport({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || !Data.result || Data.result.length === 0) {
        return { success: true, message: "No data found", data: [] };
      }

      return {
        success: true,
        message: "GiftStock retrieved successfully",
        data: Data.result,
        totalCount: Data.documents || 0,
        totalPages: Math.ceil((Data.documents || 1) / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in giftReport:", error);
      return { success: false, message: "Error while getting data" };
    }
  }

  async getEmployeeRefferal(query) {
    try {
      const { page, limit, from_date, to_date, id_branch } = query;

      const pageNum = page ? parseInt(page) : 1;
      const perPage = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * perPage;

      const filter = { is_deleted: false };

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      } else {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        filter.createdAt = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      if (id_branch) {
        if (!isValidObjectId(id_branch)) {
          return "Provide valid branch id";
        }

        const findBranch = await this.branchRepo.findById(id_branch);
        if (!findBranch) {
          return "Branch not found";
        }

        filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      }

      const data = await this.reportRepo.getEmployeeRefferal(
        filter,
        skip,
        limit
      );
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  async getCustomerRefferal(query) {
    try {
      const { page, limit, from_date, to_date, id_branch } = query;

      const pageNum = page ? parseInt(page) : 1;
      const perPage = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * perPage;

      const filter = { is_deleted: false };

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      } else {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        filter.createdAt = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      if (id_branch) {
        if (!isValidObjectId(id_branch)) {
          return "Provide valid branch id";
        }

        const findBranch = await this.branchRepo.findById(id_branch);
        if (!findBranch) {
          return "Branch not found";
        }

        filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      }

      const data = await this.reportRepo.getCustomerRefferal(
        filter,
        skip,
        limit
      );
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
    }
  }
}

export default ReportUseCase;
