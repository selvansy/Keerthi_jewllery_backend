import { isValidObjectId } from "mongoose";
import {
  addedTypeData,
  displaySellTypeData,
  getAllClosedPrintData,
  getAllPrintTypeData,
  getAllReciptTypeData,
  // getBuyGstTypeData,
  getClassificationData,
  getDisplayTypeData,
  getFundTypeData,
  getGenderData,
  getLayoutTypeData,
  getMakingChargeData,
  getPaymentTypeData,
  getReferralData,
  getShowTypeData,
  getSmsAccessTypeData,
  getWastageTypeData,
  getWhatsappTypeData,
  giftIssueTypeData,
  multiPaymentmodeData,
  notificationTypeData,
  offersTypeData,
  getTypeWayData,
  accountNoType,
  getRedeemType,
  getContentType,
  getFaqCategories
} from "../../../../services/staticDataService.js";
import AppVersionRepository from "../../../../infrastructure/repositories/chit/commonRepository.js";
import EmployeeRepository from '../../../../infrastructure/repositories/chit/EmployeeRepository.js'

class CommonUseCase {
  constructor(commonRepository) {
    this.commonRepository = commonRepository;
    this.appversionRepo = new AppVersionRepository()
    this.employeeRepo = new EmployeeRepository()
  }

  async getWastageData() {
    try {
      return getWastageTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get wastage data");
    }
  }

  async getAllmakingcharge() {
    try {
      return getMakingChargeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all making charge data");
    }
  }

  async getDisplayType() {
    try {
      return getDisplayTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all display type data");
    }
  }

  async getAllGender() {
    try {
      return getGenderData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all gender data");
    }
  }

  async getShowTypes() {
    try {
      return getShowTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all show types data");
    }
  }

  async getAlltypeway() {
    try {
      return getTypeWayData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all show types data");
    }
  }
  async getAllClassifyType() {
    try {
      return getClassificationData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async getAllPrintType() {
    try {
      return getAllPrintTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getAllAccountType() {
    try {
      return accountNoType();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getAllClosedPrint() {
    try {
      return getAllClosedPrintData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getReferralCal() {
    try {
      return getReferralData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getReceiptType() {
    try {
      return getAllReciptTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getSmsAccessType() {
    try {
      return getSmsAccessTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getWhatsappType() {
    try {
      return getWhatsappTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }

  async getPaymentType() {
    try {
      return getPaymentTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async getFundType() {
    try {
      return getFundTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  // async getBuyGstType() {
  //   try {
  //     return getBuyGstTypeData();
  //   } catch (err) {
  //       console.error(err)
  //     throw new Error("Failed to get all Classification data");
  //   }
  // }
  async getLayoutType() {
    try {
      return getLayoutTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async addedType() {
    try {
      return addedTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async giftIssueType() {
    try {
      return giftIssueTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async offersType() {
    try {
      return offersTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async displaySellType() {
    try {
      return displaySellTypeData();
    } catch (err) {
        console.error(err)
      throw new Error("Failed to get all Classification data");
    }
  }
  async notificationType() {
    try {
      return notificationTypeData();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all Classification data");
    }
  }
  async multiPaymentmode() {
    try {
      return multiPaymentmodeData();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all Classification data");
    }
  } 

  async getCity(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const data = await this.commonRepository.getCity(id);

      if (!data) {
        return { success: false, message: "No cities found" };
      }

      return {
        success: true,
        message: "Cities data fetched successfully",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get cities data");
    }
  }

  async getStates(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const data = await this.commonRepository.getStates(id);

      if (!data) {
        return { success: false, message: "No cities found" };
      }

      return {
        success: true,
        message: "State data fetched successfully",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all Classification data");
    }
  }

  async getCountry() {
    try {
      const data = await this.commonRepository.getCountry();

      if (!data) {
        return { success: false, message: "No cities found" };
      }

      return {
        success: true,
        message: "Country data fetched successfully",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get Country data");
    }
  }

  async getAllMetal() {
    try {
      const data = await this.commonRepository.getAllMetal();

      if (!data) {
        return { success: false, message: "No metals found" };
      }

      return { success: true, message: "All metals data fetched", data: data };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all metals data");
    }
  }

  async getAllPurity() {
    try {
      const data = await this.commonRepository.getAllPurity();

      if (!data) {
        return { success: false, message: "No purity found" };
      }

      return { success: true, message: "All purity data fetched", data: data };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get purity data");
    }
  }

  async getAllRelationships() {
    try {
      const data = await this.commonRepository.getAllRelationships();

      if (!data) {
        return { success: false, message: "No relationship data found" };
      }

      return {
        success: true,
        message: "All relationship data fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all relationship data");
    }
  }

  async getAllPaymentMode() {
    try {
      const data = await this.commonRepository.getAllPaymentMode();

      if (!data) {
        return { success: false, message: "No payment mode found" };
      }

      return {
        success: true,
        message: "All payment mode data fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get payment mode data");
    }
  }

  async getAllPaymentStatus() {
    try {
      const data = await this.commonRepository.getAllPaymentStatus();

      if (!data) {
        return { success: false, message: "No payment status data found" };
      }

      return {
        success: true,
        message: "All payment status data fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get payment status data");
    }
  }

  async getAllSchemeStatus() {
    try {
      const data = await this.commonRepository.getAllSchemeStatus();

      if (!data) {
        return { success: false, message: "No scheme status data found" };
      }

      return {
        success: true,
        message: "All scheme status data fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get scheme status data");
    }
  }

  async getAllInstallmentType() {
    try {
      const data = await this.commonRepository.getAllInstallmentType();

      if (!data) {
        return { success: false, message: "No installment types data found" };
      }

      return {
        success: true,
        message: "All installment types fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get installment types");
    }
  }

  async getPurityByMetal(metalId) {
    try {
        if(!isValidObjectId(metalId)){
            return {success:false,message:"Provide a valid object id"}
        }

      const data = await this.commonRepository.getPurityByMetal(metalId);

      if (!data) {
        return { success: false, message: "No  data found" };
      }

      return {
        success: true,
        message: "Purity data fetched",
        data: data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get purity data");
    }
  }


  async getRedeemType() {
    try {
      return getRedeemType();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all Redeem Type");
    }
  }
  async getContentType() {
    try {
      return getContentType();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all Content type");
    }
  }

  async getFaqCategories() {
    try {
      return getFaqCategories();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all faq categries");
    }
  }


  //! app version check, add, update api section (do not modify with proper understanding)
  async addAppVersionData(data,token) {
    try {
      const employeeData = await this.employeeRepo.findOne({_id:token.id_employee,is_deleted:false})

      if(!employeeData){
        return {success:false,message:"Employee not found,operation aborted"}
      }

      const existsData = await this.appversionRepo.findOne(data);
  
      let result = null;
      let message = "";
      let success = false;
  
      if (existsData) {
        data.updatedBy = `${employeeData?.firstname} ${employeeData?.lastname}`
        result = await this.appversionRepo.updateAppVersionData(existsData._id,data);
        if (result) {
          success = true;
          message = "App version details updated successfully";
        } else {
          message = "Failed to update app version details";
        }
      } else {
        data.updatedBy = `${employeeData?.firstname} ${employeeData?.lastname}`
        result = await this.appversionRepo.addAppVersionData(data);
        if (result) {
          success = true;
          message = "App version details added successfully";
        } else {
          message = "Failed to add app version details";
        }
      }
  
      return { success, message };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all FAQ categories");
    }
  }

  async checkAppVersion() {
    try {
        const result= await this.appversionRepo.findOne()

        if(result){
          return {success:true,message:"App details fetches successfully",data:result}
        }

        return {success:false,message:"Failed to get app details"}
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get all faq categries");
    }
  }
  
}

export default CommonUseCase;