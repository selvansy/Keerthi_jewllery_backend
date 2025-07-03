import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

class PaymentModeUseCase {
  constructor(paymentModeRepository) {
    this.paymentModeRepository = paymentModeRepository;
  }

  isValidObject = (id) => {
    return isValidObjectId(id);
  };

  async addPaymentMode(data) {
    try {
      const exisits = await this.paymentModeRepository.findByName(
        data.mode_name
      );

      if (exisits) {
        return { success: false, message: "Payment mode already exists" };
      }

      const savedData = await this.paymentModeRepository.addPaymentMode(data);

      if (savedData) {
        return { success: true, message: "Payment mode added successfully" };
      }

      return { success: false, message: "Failed to add payment mode" };
    } catch (error) {
      console.error("Error in addPayment:", error);
      return {
        success: false,
        message: "An error occurred while adding payment mode",
      };
    }
  }

  async editPaymentMode(id, data) {
    try {
      if (!this.isValidObject(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.paymentModeRepository.findById(id);

      if(!exists){
        return {success:false,message:"No payment mode found"}
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();  
        }
        if (value instanceof Date) {
            return value.toISOString().split('.')[0] + 'Z';
        }
        return value;
      };

     let fieldToUpdate={}
     Object.keys(exists).forEach((key) => {
        if (key === "_id" || key === 'active' || key === 'is_deleted') return;

        if (normalizeValue(exists[key]) !== normalizeValue(data[key])) {
          fieldToUpdate[key] = data[key];
        }
      });
  
      if (Object.keys(fieldToUpdate).length === 0) {
        return { success: false, message: "No fields to update"};
      }

      const savedData = await this.paymentModeRepository.editPaymentMode(id,fieldToUpdate);

      if(!savedData){
        return {success:false,message:"Failed to update "}
      }

      if (savedData) {
        return { success: true, message: "Payment mode updated successfully" };
      }
  
      return { success: false, message: "Failed to update payment mode" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occurred while updating payment mode" };
    }
  }

  async deletePaymentMode(id){
    try {
        if (!this.isValidObject(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }
    
          const exists = await this.paymentModeRepository.findById(id);
    
          if(!exists){
            return {success:false,message:"No payment mode found"}
          }

          if(exists.is_deleted){
            return {success:false,message:"Already deleted payment mode"}
          }

          const deletedData= await this.paymentModeRepository.deletePaymentMode(id);

          if(deletedData){
            return {success:true,message:'Payment mode deleted successfully'}
          }

          return {success:false,message:"Failed to delete payment mode"}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occurred while deleting payment mode"}
    }
  }

  async changeModeActiveStatus(id){
    try {
          if (!this.isValidObject(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }
    
          const exists = await this.paymentModeRepository.findById(id);
    
          if(!exists){
            return {success:false,message:"No payment mode found"}
          }

          if(exists.is_deleted){
            return {success:false,message:"Deleted payment mode unable to change status"}
          }

          const updatedData= await this.paymentModeRepository.changeModeActiveStatus(id,exists.active);

          if(!updatedData){
            return {success:false,message:"Failed to change payment mode status"}
          }

          let message= updatedData.active ?
          "Payment mode activated successfully"
          : "Payment mode deactivated";
    
          return {success:true,message:message}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while switching status"}
    }
  }

  async getModeById(id){
    try {
        if (!this.isValidObject(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }

          const modeData= await this.paymentModeRepository.findById(id)

          if(!modeData){
            return {success:false,message:"No payment mode find"}
          }

          return {success:true, message:"Payment mode fetched successfully",data:modeData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while fetching data"}
    }
  }

  async paymentModeTable(page, limit,query) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.paymentModeRepository.paymentModeTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in getAllMetals:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }

  async getAllActivePaymentModes(){
    try {
          const modeData= await this.paymentModeRepository.find({active:true})

          if(!modeData){
            return {success:false,message:"No payment mode find"}
          }

          return {success:true, message:"Payment mode fetched successfully",data:modeData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while fetching data"}
    }
  }
}

export default PaymentModeUseCase;
