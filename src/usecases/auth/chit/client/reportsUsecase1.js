import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

class ReportUseCase {
  constructor(reportRepo, branchRepo) {
    this.reportRepo = reportRepo;
    this.branchRepo = branchRepo;
  }

  calculateAmount(record) {
    let amount = "";
    switch (record.scheme_type) {
      case 9:
        amount = `${record.min_amount} - ${record.max_amount}`;
        break;
      case 8:
      case 7:
      case 6:
      case 2:
        amount = `${record.amount}`;
        break;
      case 5:
      case 10:
      case 4:
        amount = `${record.min_amount} - ${record.max_amount}`;
        break;
      case 3:
        amount = `${record.min_weight} - ${record.max_weight} gm`;
        break;
      default:
        amount = `${record.amount}`;
    }
    return amount;
  }

  async totalJoinAccount(id_scheme, fromDate, toDate, id_branch) {
    const query = {
      active: true,
    };

    if (fromDate && toDate) {
      query.start_date = { $gte: fromDate, $lte: toDate };
    }
    if (isValidObjectId(id_branch)) query.id_branch = id_branch;
    if (id_scheme) query.id_scheme = id_scheme;

    return await this.reportRepo.countSchemeAccounts(query);
  }

  async totalPaidAmount(
    id_scheme,
    fromDate,
    toDate,
    payment_mode,
    branch_select
  ) {
    const query = {
      active: true,
      payment_status: 1,
    };
    if (fromDate && toDate) {
      query.date_payment = { $gte: fromDate, $lte: toDate };
    }
    if (branch_select) query.id_branch = branch_select;
    if (id_scheme) query.id_scheme = id_scheme;
    if (payment_mode) query.payment_mode = payment_mode;

    return await this.reportRepo.paymenCounts(query);
  }

  async totalSchemeStatus(id_scheme, fromDate, toDate, status, branch_select) {
    const query = {
      active: true,
      status: status,
    };

    if (fromDate && toDate) {
      query.closed_date = { $gte: fromDate, $lte: toDate };
    }
    if (branch_select) query.id_branch = branch_select;
    if (id_scheme) query.id_scheme = id_scheme;
    return await this.reportRepo.schemeAccountAggregate(query);
  }

  async getPaymentAmount(
    id_scheme,
    fromDate,
    toDate,
    payment_mode,
    branch_select
  ) {
    const paymentMode = await this.reportRepo.paymentMode({
      id_mode: payment_mode,
    });
    const paymentData = await this.totalPaidAmount(
      id_scheme,
      fromDate,
      toDate,
      paymentMode._id,
      branch_select
    );
    return paymentData.total_amt || 0;
  }

  //  get accountSummary
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

    if (id_branch) query.id_branch = new mongoose.Types.ObjectId(id_branch);
    if (id_scheme) query.id_scheme = new mongoose.Types.ObjectId(id_scheme);;
    if (id_classification) query.id_classification =  new mongoose.Types.ObjectId(id_classification);

 
    
    let fromDate
    let toDate
    
    if (from_date && to_date) {
      fromDate = new Date(from_date);
      toDate = new Date(to_date);
   
     if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
       throw new Error("Invalid date format.");
     }
   } else {
     const currentDate = new Date();
     fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
     toDate = new Date(currentDate.setHours(0, 0, 0, 0));
   }

   query.start_date={ $gte: fromDate, $lte: toDate }

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const schemes = await this.reportRepo.accountSummary(query,search, skip, limit);

    return {
      data: schemes.data,
      totalDocuments: schemes.totalDocuments,
      totalPages: Math.ceil(schemes.totalDocuments / pageSize),
      currentPage: pageNum,
    };
  }

  // get payment Summary
  async getPaymentSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_classification,
    id_branch,
    search,
  }) {
    const query = { active: true };

    if (id_branch) query.id_branch = id_branch;
    if (id_scheme) query._id = id_scheme;
    if (id_classification) query["_id.id_classification"] = id_classification;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const schemes = await this.reportRepo.getPaymentReport(query, skip, limit);

    return {
      data: schemes,
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    };
  }

  // get preclose summary

  async getPreCloseSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_classification,
    id_branch,
    search,
  }) {
    const query = { active: true };

    if (id_branch) query.id_branch = id_branch;
    if (id_scheme) query._id = id_scheme;
    if (id_classification) query["_id.id_classification"] = id_classification;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await this.reportRepo.getPreCloseReport(query, skip, limit);

    return {
      data: result,
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    };
  }

  // get Redeemption Summary
  async getRedeemptionSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_classification,
    id_branch,
    search,
  }) {
    const query = { active: true };

    if (id_branch) query.id_branch = id_branch;
    if (id_scheme) query._id = id_scheme;
    if (id_classification) query["_id.id_classification"] = id_classification;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await this.reportRepo.getRedeemptionReport(
      query,
      skip,
      limit
    );

    return {
      data: result,
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    };
  }

  // get Refund Summary
  async getRefundSummary({
    page = 1,
    limit = 10,
    id_scheme,
    id_classification,
    id_branch,
    search,
  }) {
    const query = { active: true };

    if (id_branch) query.id_branch = id_branch;
    if (id_scheme) query._id = id_scheme;
    if (id_classification) query["_id.id_classification"] = id_classification;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ scheme_name: { $regex: searchRegex } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const result = await this.reportRepo.getRefundReport(query, skip, limit);

    return {
      data: result,
      totalCount: 1,
      currentPage: 1,
      totalPages: 1,
    };
  }

  // get overall report

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
    } = query;

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * pageSize;
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
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      filter.createdAt = {
        $gte: oneYearAgo,
        $lte: new Date(),
      };
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ category_name: { $regex: searchRegex } }];
    }

    if (isValidObjectId(id_branch)) {
      filter.id_branch = id_branch;
    }

    if (isValidObjectId(id_scheme)) {
      filter.id_scheme = id_scheme;
    }
    if (isValidObjectId(id_classification)) {
      filter.id_classification = id_classification;
    }

    const data = await this.reportRepo.overAllReport(filter, skip, pageSize);
    return data;
  }

  async paymentReport(query) {
    try {
      const { page, limit, from_date, to_date, id_payment, id_branch } = query;
  
      const pageNum = Math.max(1, parseInt(page) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));
      const skip = (pageNum - 1) * pageSize;
  
      const filter = { is_deleted: false };
  
      let startDate, endDate;
      if (from_date && to_date) {
        startDate = new Date(from_date);
        endDate = new Date(to_date);
  
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format. Use YYYY-MM-DD.");
        }
      } else {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
  
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }
  
      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };

      if (id_branch) {
        if (!mongoose.Types.ObjectId.isValid(id_branch)) {
          throw new Error("Invalid branch ID format");
        }
  
        const findBranch = await this.branchRepo.findById(id_branch);
        if (!findBranch) {
          throw new Error("Branch not found");
        }
  
        filter.id_branch = new mongoose.Types.ObjectId(id_branch);
      }
  
      if (id_payment) {
        if (!mongoose.Types.ObjectId.isValid(id_payment)) {
          throw new Error("Invalid payment ID format");
        }
  
        filter._id = new mongoose.Types.ObjectId(id_payment);
      }
  
      const sanitizedFilter = Object.entries(filter).reduce((acc, [key, val]) => {
        if (val !== undefined && val !== null) acc[key] = val;
        return acc;
      }, {});
  
      const data = await this.reportRepo.getPaymentReport(skip, pageSize, sanitizedFilter);
      return data;
  
    } catch (error) {
      console.error("Error in paymentReport:", error);
      throw new Error(error.message || "Something went wrong while generating the payment report.");
    }
  }
  

  //get employee Referral Report
  // async employeeReferralReport({
  //   page = 1,
  //   limit = 10,
  //   id_scheme,
  //   id_classification,
  //   id_branch,
  //   search,
  // }) {
  //   const query = { active: true };

  //   if (id_branch) query.id_branch = id_branch;
  //   if (id_scheme) query._id = id_scheme;
  //   if (id_classification) query["_id.id_classification"] = id_classification;

  //   if (search) {
  //     const searchRegex = new RegExp(search, "i");
  //     query.$or = [{ scheme_name: { $regex: searchRegex } }];
  //   }

  //   const skip = (parseInt(page) - 1) * parseInt(limit);
  //   const result = await this.reportRepo.employeeReferralReport(
  //     query,
  //     skip,
  //     limit
  //   );

  //   return {
  //     data: result,
  //     totalCount: 1,
  //     currentPage: 1,
  //     totalPages: 1,
  //   };
  // }

  async _getTotalAccount(id_branch, id_scheme, id_classification, status) {
    let filter = { active: true, status };

    if (id_branch) filter.id_branch = id_branch;
    if (id_scheme) filter.id_scheme = id_scheme;
    if (id_classification)
      filter["id_scheme.id_classification"] = id_classification;

    return await this.reportRepo.countSchemeAccounts(filter);
  }

  async getOutstandingReport(filters) {
    const {
      page = 1,
      limit = 10,
      added_by,
      from_date,
      to_date,
      id_branch,
      scheme_status,
      id_scheme,
      summary_type,
      collectionuserid,
      search,
    } = filters;

    const query = { active: true };

    if (from_date && to_date) {
      query.createdAt = {
        $gte: new Date(from_date),
        $lte: new Date(to_date),
      };
    }

    if (added_by) query.added_by = parseInt(added_by);
    if (scheme_status) query.status = parseInt(scheme_status);
    if (id_branch) query.id_branch = id_branch;
    if (id_scheme) query.id_scheme = id_scheme;
    if (collectionuserid) query.id_employee = collectionuserid;

    if (summary_type === 1) {
      query["scheme_type"] = { $in: [0, 1, 4, 7, 8, 9] }; // amount
    }
    if (summary_type === 2) {
      query["scheme_type"] = { $in: [2, 3, 5, 6, 10] }; // weight
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { account_name: { $regex: searchRegex } },
        { scheme_acc_number: { $regex: searchRegex } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const data = await this.reportRepo.getOutstandingReport(
      query,
      skip,
      limitNum
    );

    if (data.length > 0) {
      return {
        message: "Outstanding amount report fetched successfully",
        data: data[0].data,
        totalCount: data[0].total,
        currentPage: page,
        totalPages: Math.ceil(data[0].total / limitNum),
      };
    }

    return { message: "No outstanding amount data found", data: [] };
  }

  // async overAllReport(filterData){
  //   try {
  //     const {page, limit, from_date,to_date, id_scheme, id_branch, search } = filterData;

  //     let query = { active: { $ne: false } };

  //   if (id_scheme) {
  //       query.id_scheme = id_scheme;
  //   }

  //   if (isValidObjectId(id_branch)) {
  //       query.id_branch = id_branch;
  //   }

  //   let fromDate=''
  //   let toDate=''
  //   if (from_date && to_date) {
  //      fromDate = new Date(from_date);
  //      toDate = new Date(to_date);
  //     if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
  //       throw new Error("Invalid date format.");
  //     }

  //     filter.start_date = {
  //       $gte: fromDate,
  //       $lte: toDate,
  //     };
  //   }

  //   if (search.value) {
  //       const regex = new RegExp(search.value, 'i');
  //       query.$or = [
  //           { scheme_name: { $regex: regex } },
  //           { code: { $regex: regex } },
  //           { created_by: { $regex: regex } }
  //       ];
  //   }

  //   const schemData = await this.reportRepo.schemeData(page,limit,query);

  //   const records = schemData.schemeData;
  //   const count = schemData.documents

  //   const data = [];
  //   for(let key of records){
  //     const amount = this.calculateAmount(key);
  //     const schemeName = `${key.scheme_name} ${amount}`;
  //     const totalJoin = await this.totalJoinAccount(key._id,fromDate,toDate,id_branch);
  //     const totalPaid = await this.totalPaidAmount(key._id, fromDate, toDate, 0, id_branch);
  //     const totalClose = await this.totalSchemeStatus(key._id, fromDate, toDate, 1, id_branch);
  //     const totalPreclose = await this.totalSchemeStatus(key._id, fromDate, toDate, 3, id_branch);
  //     const totalRefund = await this.totalSchemeStatus(key._id, fromDate, toDate, 4, id_branch);
  //     const totalParitialClosed = await this.totalSchemeStatus(key._id, fromDate, toDate, 5, id_branch);
  //     const totalPartiallyPreclosed = await this.totalSchemeStatus(key._id, fromDate, toDate, 6, id_branch);

  //     data.push({
  //         id: key._id,
  //         scheme_name: schemeName,
  //         total_join: totalJoin || 0,
  //         total_paid_account: totalPaid?.count || 0,
  //         paid_amount: totalPaid.total_amt || 0,
  //         total_close_account: totalClose?.count || 0,
  //         close_amount: totalClose?.total_amt || 0,
  //         total_weight: totalClose?.total_weight || 0,
  //         total_preclose_account: totalPreclose?.count || 0,
  //         preclose_amount: totalPreclose?.total_amt || 0,
  //         total_refund_account: totalRefund?.count || 0,
  //         refund_amount: totalRefund?.total_amt || 0,
  //         total_partial_Close_accounts:totalParitialClosed.count || 0,
  //         total_partial_Close_amount:totalParitialClosed.total_amt || 0,
  //         total_partial_Close_weight:totalParitialClosed.total_weight || 0,
  //         total_partial_PreClose_amount:totalPartiallyPreclosed.total_amt || 0,
  //         total_partial_PreClose_weight:totalPartiallyPreclosed.total_weight || 0,
  //         branch_name: id_branch ? await this.reportRepo.brnachName(id_branch) : "All Branch",
  //         cash: await this.getPaymentAmount(key._id, fromDate, toDate, 1, id_branch),
  //         paytmcard: await this.getPaymentAmount(key._id, fromDate, toDate, 2, id_branch),
  //         paytmpay: await this.getPaymentAmount(key._id, fromDate, toDate, 3, id_branch),
  //         banktransfer: await this.getPaymentAmount(key._id, fromDate, toDate, 4, id_branch),
  //         razor: await this.getPaymentAmount(key._id, fromDate, toDate, 5, id_branch),
  //         gpay: await this.getPaymentAmount(key._id, fromDate, toDate, 8, id_branch),
  //         bharatpe: await this.getPaymentAmount(key._id, fromDate, toDate, 9, id_branch),
  //         easebuzz: await this.getPaymentAmount(key._id, fromDate, toDate, 10, id_branch),
  //     });
  //   }

  //   return {success:true, data:data,message:"Overall report data fetched successfully"}
  //   } catch (error) {
  //     console.error(error)
  //     return {success:false,message:"Error while getting overall data"}
  //   }
  // }

  async overduesummary(filterdata) {
    try {
      const { page, limit, from_date, to_date, id_scheme, id_branch, search } =
        filterdata;
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      let query = { active: { $ne: false },status:0 };

      if (id_scheme) {
        query.id_scheme = id_scheme;
      }

      if (query.id_scheme && typeof query.id_scheme === "string") {
        query.id_scheme = new mongoose.Types.ObjectId(query.id_scheme);
      }

      if (id_branch && isValidObjectId(id_branch)) {
        query.id_branch = new mongoose.Types.ObjectId(id_branch);
      }

      let  fromDate
      let  toDate

      if (from_date && to_date) {
         fromDate = new Date(from_date);
         toDate = new Date(to_date);
      
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
          throw new Error("Invalid date format.");
        }
      } else {
        const currentDate = new Date();
        fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
        toDate = new Date(currentDate.setHours(0, 0, 0, 0));
      }
      

    

      const dueData = await this.reportRepo.pendingDuePayment(
        pageNum,
        pageSize,
        query,
        fromDate,
        toDate
      );

      if (!dueData || !dueData || dueData.length === 0) {
        return { message: "No pending due records found", data: [] };
      }
      return {
        message: "Pending due data fetched successfully",
        data: dueData,
        totalDocuments: dueData.totalDocuments,
        totalPages: Math.ceil(dueData.totalDocuments / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting Pending due data",
      };
    }
  }

  async employeeReferralReport(filterdata) {
    try {
      const { page, limit, from_date, to_date, id_branch, id_scheme, search } =
        filterdata;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      let query = { active: { $ne: false } };

      if (id_scheme) {
        query.id_scheme = id_scheme;
      }

      if (isValidObjectId(id_branch)) {
        query.id_branch = id_branch;
      }

      let fromDate = "";
      let toDate = "";
      if (from_date && to_date) {
        fromDate = new Date(from_date);
        toDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.start_date = {
          $gte: fromDate,
          $lte: toDate,
        };
      }

      // if (search.value) {
      //     const regex = new RegExp(search.value, 'i');
      //     query.$or = [
      //         { scheme_name: { $regex: regex } },
      //         { code: { $regex: regex } },
      //         { created_by: { $regex: regex } }
      //     ];
      // }

      const result = await this.reportRepo.employeeReferralReport(
        pageNum,
        pageSize,
        query
      );

      if (!result) {
        return { message: "No employee referrals found", data: [] };
      }

      return {
        message: "Employee referrals fetched successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting employee referrals",
      };
    }
  }

  async customerReferralReport(filterdata) {
    try {
      const { page, limit, from_date, to_date, id_branch, id_scheme, search } =
        filterdata;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      let query = { active: { $ne: false } };

      if (id_scheme) {
        query.id_scheme = id_scheme;
      }

      if (isValidObjectId(id_branch)) {
        query.id_branch = id_branch;
      }

      let fromDate = "";
      let toDate = "";
      if (from_date && to_date) {
        fromDate = new Date(from_date);
        toDate = new Date(to_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date format.");
        }

        filter.start_date = {
          $gte: fromDate,
          $lte: toDate,
        };
      }

      if (search.value) {
        const regex = new RegExp(search.value, "i");
        query.$or = [
          { scheme_name: { $regex: regex } },
          { code: { $regex: regex } },
          { created_by: { $regex: regex } },
        ];
      }

      const result = await this.reportRepo.customerReferralReport(
        pageNum,
        pageSize,
        query
      );

      if (!result) {
        return { message: "No customer referrals found", data: [] };
      }

      return {
        message: "Customer referrals fetched successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting Customer referral data",
      };
    }
  }

  async getAllActiveGiftItems(page, limit, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [{ gift_name: { $regex: searchTerm, $options: "i" } }],
          }
        : {};

      const query = {
        is_deleted: false,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.giftItemRepository.getAllActiveGiftItems({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Gift item retrieved successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
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
  
      const searchCriteria = searchTerm
        ? { $or: [{ gift_name: { $regex: searchTerm, $options: "i" } }] }
        : {};

      
      const query = {
        active: true,
        id_branch,
        ...searchCriteria, 
      }; 
  
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.reportRepo.getGiftReport({ query, documentskip, documentlimit });
  
      if (!Data || !Data.result || Data.result.length === 0) {
        return { success: false, message: "No data found" };
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


}

export default ReportUseCase;
