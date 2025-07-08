import mongoose, { isValidObjectId } from "mongoose";
import SchemeAccountRepository from "../../../../infrastructure/repositories/chit/schemeAccountRepository.js";
import CustomerRepository from "../../../../infrastructure/repositories/chit/CustomerRepository.js"
import employeeRepository from "../../../../infrastructure/repositories/chit/EmployeeRepository.js"
import EmployeeRepository from "../../../../infrastructure/repositories/chit/EmployeeRepository.js";

class WalletUsecase {  
  constructor(walletRepo, branchRepo) {
    this.walletRepo = walletRepo;
    this.branchRepo = branchRepo;
    this.employeeRepository = new EmployeeRepository();
    this.schemeAccountRepo = new SchemeAccountRepository();
    this.customerRepo = new CustomerRepository();
  }

  async findLatestActiveWalletRate() {
    try {
      const data = await this.walletRepo.findLatestActiveWalletRate()
      if (!data) {
        return { success: false, message: "Wallet Rate not found" }
      }

      return { success: true, message: 'Wallet Rates fetched successfully', data: data }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Error while fetching Wallet Rate data' }
    }
  }


  async addWallet(data, token) {
    try {
      if (!isValidObjectId(data.id_customer)) {
        return {
          success: false,
          message: "Customer id is not valid object id",
        };
      }

      if (!isValidObjectId(data.id_scheme_account)) {
        return {
          success: false,
          message: "Scheme account is not a valid object id",
        };
      }

      const walletData = await this.walletRepo.findWallet(data.id_customer);

      if (walletData) {
        return { success: false, message: "Wallet already exists" };
      }

      data.modified_by = token.id_employee || token._id || "";
      data.created_by = token.id_employee || token._id || "";
      data.total_reward_amt = data.balance_amt;
      const saveWallet = await this.walletRepo.addWallet(data);

      if (!saveWallet) {
        return { success: false, message: "Failed to create wallet" };
      }

      const historyData = {
        // id_customer: data.id_customer,
        // id_scheme_account: data.id_scheme_account,
        modified_by: token.id_employee || token._id,
        created_by: token.id_employee || token._id,
        credited_amount: data.balance_amt,
        reward_mode: data.reward_mode,
        wallet_id:saveWallet._id
      };

      await this.walletRepo.addWalletHistory(historyData);

      return { success: true, message: "Wallet created successfully" };
    } catch (error) {
      console.error(error);
    }
  }


  async addBalanceToWallet(id, data, token) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Wallet ID is not a valid object" };
      }

      const existingData = await this.walletRepo.findWalletById(id);

      if (!existingData) {
        return { success: false, message: "No wallet found" };
      }

      const newBalance = existingData.balance_amt + data.balance_amt;
      const newTotal = existingData.total_reward_amt + data.balance_amt;

      // const newBalancePoint = existingData.balance_point + (data.balance_point || 0);
      // const newTotalPoint = existingData.total_reward_point + (data.balance_point || 0);

      const updateData = {
        balance_amt: newBalance,
        total_reward_amt: newTotal,
        // balance_point: newBalancePoint,
        // total_reward_point: newTotalPoint,
        modified_by: token.id_employee,
      };


      const updatedData = await this.walletRepo.updateWallet(id, updateData);

      if (!updatedData) {
        return { success: false, message: "Failed to add balance" };
      }

      const historyData = {
        id_customer: existingData.id_customer,
        id_scheme_account: existingData.id_scheme_account,
        modified_by: token.id_employee,
        credited_amount: data.balance_amt,
        reward_mode: data.reward_mode,
      };

      await this.walletRepo.addWalletHistory(historyData);

      return { success: true, message: "Balance added successfully" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while adding balance",
      };
    }
  }

  async redeemFromWallet(data, token) {
    try {
      const dataId ={_id:data.wallet_id}

      const existingData = await this.walletRepo.findWallet(dataId);

      if (!existingData) {
        return { success: false, message: "No wallet found" };
      }

      if ((data.redeem_type === 1 || data.redeem_type === "1") && !data.payment_mode) {
        return { success: false, message: "Payment mode is required for this redeem type" };
      }

      if (data.redeem_amt > existingData.balance_amt) {
        return {
          success: false,
          message: "Insufficient redeem amount",
        };
      }

      const newBalance = existingData.balance_amt - data.redeem_amt;
      const newRedeemedAmt = existingData.redeem_amt + data.redeem_amt;

      const updateData = {
        wallet_id:data.wallet_id,
        balance_amt: newBalance,
        redeem_amt: newRedeemedAmt,
        redeem_type:data.redeem_type,
        modified_by: token.id_employee,
        // wallet_type:data.wallet_type,
      };

      const updatedData = await this.walletRepo.updateWallet(dataId, updateData);
      if (!updatedData) {
        return { success: false, message: "Failed to update wallet" };
      }

      const historyData = {
        wallet_id:data?.wallet_id,        
        modified_by: token.id_employee || token._id,
        created_by: token.id_employee || token._id,
        credited_amount: -data.redeem_amt,
        redeem_type: data?.redeem_type,
        payment_mode: data?.payment_mode,
        bill_no: data?.bill_no,
        // id_customer: data.id_customer,
        // id_scheme_account: data?.id_scheme_account,
        // wallet_type:data?.wallet_type,
        // credited_point: -data.redeem_point,
      };

    
      const walletHistoryRes = await this.walletRepo.addWalletHistory(historyData);

      return { success: true, message: "Wallet redeemed successfully", data: walletHistoryRes };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occurred while redeeming" };
    }
  }

  async activateWallet(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Wallet is not a valid object id" };
      }

      const existingData = await this.walletRepo.findWalletById(id);

      if (!existingData) {
        return { success: false, message: "No wallet found" };
      }

      if (existingData.is_deleted) {
        return { success: false, message: "Deleted wallet action not permited" }
      }

      const message = existingData.active
        ? "Wallet deactivated successfully"
        : "Wallet activated successfully";

      const newData = await this.walletRepo.activateWallet(
        id,
        existingData.active
      );

      if (!newData && existingData.active) {
        return { success: false, message: "Failed to deactivate wallet" };
      } else if (!newData && !existingData.active) {
        return { success: false, message: "Failed to activate wallet" };
      }

      return { success: true, message: message };
    } catch (error) {
      console.error(error);
    }
  }


  async getCustomerWalletDetails(customerId, mobileNumber) {
    try {
      const custData = await this.customerRepo.findCustomerData(customerId || mobileNumber);

      if (!custData) {
        return { success: false, message: "Customer not found" };
      }

      const walletData = await this.walletRepo.getCustomerWalletDetails(custData._id);

      const customerid = new mongoose.Types.ObjectId(custData._id)
      const overDue = await this.schemeAccountRepo.overdueCalculation(customerid)

      if (walletData && walletData.is_deleted) {
        return { success: false, message: "No data found" };
      }

      walletData.overDue = overDue?.totalOverdue || 0
      return { success: true, message: walletData ? "Wallet exists" : "Wallet not exists", data:walletData };
    } catch (error) {
      console.error("Error in getCustomerWalletDetails:", error);
      throw new Error("Internal server error");
    }
  }


  async activateWallet(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Wallet is not a valid object id" };
      }

      const existingData = await this.walletRepo.findWalletById(id);

      if (!existingData) {
        return { success: false, message: "No wallet found" };
      }

      if (existingData.is_deleted) {
        return { success: false, message: "Deleted wallet action not permited" }
      }

      const message = existingData.active
        ? "Wallet deactivated successfully"
        : "Wallet activated successfully";

      const newData = await this.walletRepo.activateWallet(
        id,
        existingData.active
      );

      if (!newData && existingData.active) {
        return { success: false, message: "Failed to deactivate wallet" };
      } else if (!newData && !existingData.active) {
        return { success: false, message: "Failed to activate wallet" };
      }

      return { success: true, message: message };
    } catch (error) {
      console.error(error);
    }
  }

  async deletedWallet(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Wallet is not a valid object id" };
      }

      const existingData = await this.walletRepo.findWalletById(id)

      if (!existingData) {
        return { success: false, message: "No wallet found" }
      }

      if (existingData.is_deleted) {
        return { success: false, message: "Already deleted wallet" }
      }

      const deletedData = await this.walletRepo.deletedWallet(id)

      if (!deletedData) {
        return { success: false, message: "Failed to delete wallet" }
      }

      return { success: true, message: "Wallet deleted successfully" }
    } catch (error) {
      console.error(error);
    }
  }

  async getAllWallets(page, limit, search, from_date, to_date) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        search:search
      };
  
      const parseDate = (str) => {
        const [day, month, year] = str.split('/');
        const fullYear = year.length === 2 ? '20' + year : year;
        return new Date(`${fullYear}-${month}-${day}`);
      };

      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
      
        if (isNaN(startDate) || isNaN(endDate)) {
          return { success: false, message: "Invalid date format" };
        }
      
        
        startDate.setUTCHours(0, 0, 0, 0);     
        endDate.setUTCHours(23, 59, 59, 999);    
      
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
  
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
        
  
      const Data = await this.walletRepo.getAllWallets({
        query,
        documentskip,
        documentlimit
      });
  
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No wallet data found", data: Data };
      }
  
      return {
        success: true,
        message: "Wallet data fetched successfully",
        data: Data.data,
        walletData:Data.walletData,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
        totalRewardAmt: Data.totalRewardAmt,
        totalRedeemedAmt: Data.totalRedeemedAmt,
        totalBalanceAmt: Data.totalBalanceAmt
      };
    } catch (error) {
      console.error("Error in wallet use case:", error);
      return { success: false, message: "An error occurred while fetching wallet data" };
    }
  }

  async getRedeem({page, limit, search, from_date, to_date}) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        search,
        credited_amount: { $lt: 0 }
      };
  
      const parseDate = (str) => {
        const [day, month, year] = str.split('/');
        const fullYear = year.length === 2 ? '20' + year : year;
        return new Date(`${fullYear}-${month}-${day}`);
      };
  
      if (from_date && to_date) {
        const startDate = new Date(from_date);
        const endDate = new Date(to_date);
      
        if (isNaN(startDate) || isNaN(endDate)) {
          return { success: false, message: "Invalid date format" };
        }
      
        
        startDate.setUTCHours(0, 0, 0, 0);     
        endDate.setUTCHours(23, 59, 59, 999);    
      
        query.createdAt = { $gte: startDate, $lte: endDate };
      }
      
      // Handle search
      // if (search && search.trim() !== "") {
      //   const regex = { $regex: search, $options: "i" };
      //   query.$or = [
      //     { "user.firstname": regex },
      //     { "user.lastname": regex },
      //     { "user.mobile": regex },
      //     { bill_no: regex }
      //   ];
      // }

    //   if (search) {
    //     const searchRegex = new RegExp(search, "i");

    //     query.$or = [{ firstname: { $regex: searchRegex }, 
    //       lastname: { $regex: searchRegex },
    //       mobile: { $regex: searchRegex },
    //       bill_no: { $regex: searchRegex } 
    //      }
    //      ];
    // }
  
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.walletRepo.getRedeem({
        query,
        documentskip,
        documentlimit
      });
  
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No redeem data found", data: Data };
      }
  
      return {
        success: true,
        message: "Redeem data fetched successfully",
        data: Data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      
      };
    } catch (error) {
      console.error("Error in getRedeem use case:", error);
      return { success: false, message: "An error occurred while fetching redeem data" };
    }
  }
  


  async getWalletDataByMobile(value) {
    try {
      if (!value) {
        return { success: false, message: "Mobile number found" };
      }

      const query = {
        active: true,
        is_deleted: false,
        mobile:value
      };

      const walletData = await this.walletRepo.getWalletDataByMobile(query);

      if (walletData && (walletData.is_deleted === true)) {
        return { success: false, message: "Wallet does not exist" };
      }
  
      const data = { walletData };

      return { success: true, message: walletData ? "Wallet exists" : "Wallet not exists", data };
    } catch (error) {
      console.error("Error in getCustomerWalletDetails:", error);
      throw new Error("Internal server error");
    }
  }


  async getRedeemByUser(page, limit, mobile) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        credited_amount: { $lt: 0 }
      };

      const searchterm = mobile || "";
      
      const custData = await this.customerRepo.findCustomerData(searchterm);

    
      if (custData) {
        query.wallet_id = custData._id
      }

      // if (!custData) {
      //   query.mobile = searchterm;
      // }
      const employee = await this.employeeRepository.findOne({mobile:searchterm});
 
      if (employee) {
        query.wallet_id = employee._id
      }

      if (!custData && !employee) {
        return { success: false, message: "No Data found" };
      }
     
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.walletRepo.getRedeemByUser({
        query,
        documentskip,
        documentlimit
      });
     
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No redeem data found", data:Data.data };
      }
  
      return {
        success: true,
        message: "Redeem data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      
      };
    } catch (error) {
      console.error("Error in getRedeem use case:", error);
      return { success: false, message: "An error occurred while fetching redeem data" };
    }
  }

  async getRefferalListByUser(page, limit, mobile) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        mobile:mobile
      };

      // const searchterm = mobile || "";
      
      // const custData = await this.customerRepo.findCustomerData(searchterm);

      // if (custData) {
      //   query.wallet_id = custData._id
      // }

      
      // const employee = await this.employeeRepository.findOne({mobile:searchterm});
 
      // if (employee) {
      //   query.wallet_id = employee._id
      // }

      // if (!custData && !employee) {
      //   return { success: false, message: "No Data found" };
      // }

      const walletData = await this.walletRepo.findData({mobile:mobile})

      query.wallet
     
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.walletRepo.getRefferalListByUser({
        query,
        documentskip,
        documentlimit
      });
     
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No refferal data found", data:Data.data };
      }
  
      return {
        success: true,
        message: "Refferal data fetched successfully",
        data: Data.data,
        walletData: Data.data.walletData,
        totalCount: Data.data.totalCount,
        totalPages: Math.ceil(Data.data.totalCount / pageSize),
        currentPage: pageNum,
      
      };
    } catch (error) {
      console.error("Error in getRefferla use case:", error);
      return { success: false, message: "An error occurred while fetching refferl data" };
    }
  }

  async getRefferalPayment(page, limit,id) {
    try {

      if (!isValidObjectId(id)) {
        return { success: false, message: "Refferal schemeAccId is not a valid object id" };
      }

      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        id_scheme_account:new mongoose.Types.ObjectId(id)
      };
 

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.walletRepo.getRefferalPayment({
        query,
        documentskip,
        documentlimit
      });
     
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No refferal payment found", data:Data.data };
      }
  
      return {
        success: true,
        message: "Refferalpayment data fetched successfully",
        data: Data.data,
        totalCount: Data.data.totalCount,
        totalPages: Math.ceil(Data.data.totalCount / pageSize),
        currentPage: pageNum,
      
      };
    } catch (error) {
      console.error("Error in getRefferla payemnt use case:", error);
      return { success: false, message: "An error occurred while fetching refferal data" };
    }
  }

  async getWalletHistoryByWalletId(page, limit, walletId) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
  
      const query = {
        is_deleted: false,
        active: true,
        credited_amount: { $lt: 0 }
      };

      const searchterm = walletId || "";

      const walletData = await this.walletRepo.findWallet({_id:walletId})

      if(!walletData){
        return {status:false,message:"No wallet found"}
      }

      if(!walletData.active){
        return {status:false,message:"Wallet not acive"}
      }

      let userData = ''
      if(walletData.id_customer){
        userData = await this.customerRepo.findOne({_id:walletData.id_customer});
      }else {
        userData = await this.employeeRepository.findOne({_id:walletData.id_employee});
      }

      query.wallet_id = walletData._id
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const Data = await this.walletRepo.getRedeemByUser({
        query,
        documentskip,
        documentlimit
      });
      if (!Data || !Data.data || Data.data.length === 0) {
        return { success: true, message: "No redeem data found", data:Data.data };
      }
  
      return {
        success: true,
        message: "Redeem data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      
      };
    } catch (error) {
      console.error("Error in getRedeem use case:", error);
      return { success: false, message: "An error occurred while fetching redeem data" };
    }
  }

  async getWalletData(value) {
    try {
      const query = {
        active: true,
        is_deleted: false,
        mobile:value
      };

      // let custData;
      // custData = await this.customerRepo.findCustomerData(searchterm);

      // if (!custData) {
      //   return { success: false, message: "No customer found" };
      // }

      const walletData = await this.walletRepo.getWalletData(query);

      if (walletData && (walletData.is_deleted === true)) {
        return { success: false, message: "Wallet does not exist" };
      }

      const data = walletData

      return { success: true, message: walletData ? "Wallet exists" : "Wallet not exists", data };
    } catch (error) {
      console.error("Error in getCustomerWalletDetails:", error);
      throw new Error("Internal server error");
    }
  }


}

export default WalletUsecase;