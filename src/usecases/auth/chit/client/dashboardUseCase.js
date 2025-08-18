import mongoose, { isValidObjectId } from "mongoose";
import SchemeAccountRepository from "../../../../infrastructure/repositories/chit/schemeAccountRepository.js";

class DashboardUseCase {
  constructor(branchRepository, dashboardRepository) {
    this.branchRepository = branchRepository;
    this.dashboardRepository = dashboardRepository;
    this.schemeaccRepo = new SchemeAccountRepository()
  }

  async getAllOver(data) {
    try {
      const { branchId } = data;
      const filter = { is_deleted: false,active:true};
      if (branchId) {
        if (isValidObjectId(branchId)) {
          const isValidBranch = await this.branchRepository.findById(branchId);
          if (!isValidBranch) {
            return { success: false, message: "Branch not found" };
          }
          filter.id_branch = new mongoose.Types.ObjectId(branchId);
        } else {
          return { success: false, message: "Provide Valid Branch ID" };
        }
      }

      const overAllData = await this.dashboardRepository.getAllOver(filter);

      if(overAllData){
        const overDueData = await this.dashboardRepository.overdueCalculation()
        overAllData.overDues = overDueData.totalOverdueAccounts

        return {success:true,data:overAllData,message:"Dashboard Data fetched successfully"}
      }

      return {success:false,message:"Failed to fetch data"}
    } catch (err) {
      return { success: false, message: "Failed to get allover data" };
    }
  }

  async accountStat({id_branch, startDate, endDate}) {
    try {
      const filter = { is_deleted: false };
      
      if (id_branch) {
        if (isValidObjectId(id_branch)) {
          const isValidBranch = await this.branchRepository.findById(id_branch);
          if (!isValidBranch) {
            return { success: false, message: "Branch not found" };
          }
          filter.id_branch = new mongoose.Types.ObjectId(id_branch);
        } else {
          return { success: false, message: "Provide a valid Branch ID" };
        }
      }
  
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
      
        if (isNaN(parsedEndDate)) {
          return { success: false, message: "Invalid end date format. Please provide a valid date." };
        }
      
        if (isNaN(parsedStartDate)) {
          return { success: false, message: "Invalid start date format. Please provide a valid date." };
        }
      
        filter.createdAt = {
          $gte: parsedStartDate,
          $lte: parsedEndDate,
        };
      }
      
      const data = await this.dashboardRepository.getAccountStat(filter);
  
      if (data) {
        return { success: true, data, message: "Account Data fetched successfully" };
      }
  
      return { success: false, message: "Failed to fetch data" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to get overall data" };
    }
  }
  

  async account({id_branch, startDate, endDate}) {
    try {
      const filter = { is_deleted: false };
  
      if (id_branch) {
        if (isValidObjectId(id_branch)) {
          const isValidBranch = await this.branchRepository.findById(id_branch);
          if (!isValidBranch) {
            return { success: false, message: "Branch not found" };
          }
          filter.id_branch = new mongoose.Types.ObjectId(id_branch);
        } else {
          return { success: false, message: "Provide a valid Branch ID" };
        }
      }
  
      if (startDate &&endDate ) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate)) {
          return { success: false, message: "Invalid end date format. Please provide a valid date." };
        }
        if (isNaN(parsedStartDate)) {
          return { success: false, message: "Invalid start date format. Please provide a valid date." };
        }
        filter.createdAt = {
          $gte: parsedStartDate,
          $lte: parsedEndDate,
        };
      }
  
      
      const data = await this.dashboardRepository.getAccountData(filter);
  
      if (data) {
        return { success: true, data, message: "Account Data fetched successfully" };
      }
  
      return { success: false, message: "Failed to fetch data" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to get overall data" };
    }
  }


  async getPaymentHistory({page, limit,id_branch}) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter={}
      if (id_branch) {
        if (isValidObjectId(id_branch)) {
          const isValidBranch = await this.branchRepository.findById(id_branch);
          if (!isValidBranch) {
            return { success: false, message: "Branch not found" };
          }
          filter.id_branch = new mongoose.Types.ObjectId(id_branch);
        } else {
          return { success: false, message: "Provide a valid Branch ID" };
        }
      }

      const data = await this.dashboardRepository.getPaymentHistory(skip,
        pageSize,filter);
  
      if (data) {
        return { success: true, data, message: "Payment History Data fetched successfully" };
      }
  
      return { success: false, message: "Failed to fetch data" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to get overall data" };
    }
  }


  async paymentModeData({id_branch, startDate, endDate}) {
    try {
      const filter = { is_deleted: false };
      
      if (id_branch) {
        if (isValidObjectId(id_branch)) {
          const isValidBranch = await this.branchRepository.findById(id_branch);
          if (!isValidBranch) {
            return { success: false, message: "Branch not found" };
          }
          filter.id_branch = new mongoose.Types.ObjectId(id_branch);
        } else {
          return { success: false, message: "Provide a valid Branch ID" };
        }
      }
  
      const today = new Date();
      const startOfToday = new Date(today.setHours(0, 0, 0, 0));
      const endOfToday = new Date(today.setHours(23, 59, 59, 999));
      
      if (startDate && endDate) {
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
      
        if (isNaN(parsedEndDate)) {
          return { success: false, message: "Invalid end date format. Please provide a valid date." };
        }
      
        if (isNaN(parsedStartDate)) {
          return { success: false, message: "Invalid start date format. Please provide a valid date." };
        }
      
        filter.createdAt = {
          $gte: parsedStartDate,
          $lte: parsedEndDate,
        };
      } else {
        filter.createdAt = {
          $gte: startOfToday,
          $lte: endOfToday,
        };
      }
      
      
      const data = await this.dashboardRepository.paymentModeData(filter);
      if (data) {
        return { success: true, data, message: "Payment Mode Data fetched successfully" };
      }
  
      return { success: false, message: "Failed to fetch data" };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to get Payment Mode data" };
    }
  }

}

export default DashboardUseCase;
