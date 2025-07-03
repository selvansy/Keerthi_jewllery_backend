import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
  
class giftVendorUseCase {
  constructor(giftVendorRepository) {
    this.giftVendorRepository = giftVendorRepository;
  }

  async addGiftVendor(data) {
    try {
      const exists = await this.giftVendorRepository.checkMobileGst(data.mobile, data.gst);

      if (exists) {
        return {
          success: false,
          message: exists.mobile === data.mobile
            ? "Vendor with this mobile already exists"
            : "Vendor with this GST already exists"
        };
      }

      data.createdate = Date.now();
      data.modifydata = Date.now();

      const savedData = await this.giftVendorRepository.addGiftVendor(data);

      if (savedData) {
        return { success: true, message: "Vendor added successfully" }
      }

      return { success: false, message: "Failed to add vendor" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while adding vendor" }
    }
  }

  async deleteVendor(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide valid objec id" }
      }

      const exists = await this.giftVendorRepository.findById(id);

      if (!exists) {
        return { success: false, message: 'No vendor found' }
      }

      if (exists.is_deleted) {
        return { success: false, message: "Already deleted vendor" }
      }

      const newData = await this.giftVendorRepository.deleteVendor(id);

      if (newData) {
        return { success: true, message: "Vendor deleted successfully" }
      }

      return { success: false, message: "Failed to deleted vendor" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting vendor" }
    }
  }

 

  async editGiftVendor(id, data) {
      try {
          if (!mongoose.Types.ObjectId.isValid(id)) {
              return { success: false, message: "Provide a valid object id" };
          }
  
          const exists = await this.giftVendorRepository.checExists(id, data.mobile, data.gst);
          if (exists) {
              return { success: false, message: "Vendor already exists" };
          }
  
   
          const existingVendor = await this.giftVendorRepository.findById(id);
          if (!existingVendor) {
              return { success: false, message: "Vendor not found" };
          }
  
          let fieldsToUpdate = {};
  
          const normalizeValue = (value) => {
              if (value instanceof mongoose.Types.ObjectId) {
                  return value.toString();
              }
              if (value instanceof Date) {
                  return value.toISOString().split(".")[0] + "Z";
              }
              return value;
          };
  

          Object.keys(data).forEach((key) => {
              if (["_id", "createdAt", "updatedAt", "__v", "is_deleted"].includes(key) || data[key] === undefined) {
                  return;
              }
  
              if (normalizeValue(existingVendor[key]) !== normalizeValue(data[key])) {
                  fieldsToUpdate[key] = data[key];
              }
          });
  
          if (Object.keys(fieldsToUpdate).length === 0) {
              return { success: false, message: "No fields to update" };
          }
  
   
          const updatedData = await this.giftVendorRepository.editVendor(id, fieldsToUpdate);
  
          if (updatedData) {
              return { success: true, message: "Vendor edited successfully" };
          }
  
          return { success: false, message: "Failed to edit vendor" };
      } catch (error) {
          console.error("Error in editGiftVendor:", error);
          return { success: false, message: "An error occurred while editing vendor" };
      }
  }
  

  async changeVendorActiveState(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" }
      }

      const exists = await this.giftVendorRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No vendor found" }
      }

      if (exists.is_deleted) {
        return { success: false, message: "Deleted vendor action aborted" }
      }

      const newData = await this.giftVendorRepository.changeVendorActiveState(id, exists.active);

      let message = newData.active ?
        "Vendor activated successfully" :
        "Vendor deactivated successfully";

      if (newData) {
        return { success: true, message: message }
      }

      return { success: false, message: "Failed to change vendor status" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while changing states" }
    }
  }

  async getGiftItemById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide valid objec id" }
      }

      const newData = await this.giftVendorRepository.findById(id);

      if (newData) {
        return { success: true, message: "Vendor data fetched successfully", data: newData }
      }

      return { success: false, message: "Failed to deleted vendor" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting vendor" }
    }
  }

  async getGiftVendorByBranch(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide valid objec id" }
      }

      const newData = await this.giftVendorRepository.findByBranch({ id_branch: id,active:true,is_deleted:false });

      if (newData) {
        return { success: true, message: "Vendor data fetched successfully", data: newData }
      }

      return { success: false, message: "No vendor data found" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting vendor" }
    }
  }

  async getAllActiveVendors(id) {
    try {
      const newData = await this.giftVendorRepository.getAllActiveVendors();

      if (newData) {
        return { success: true, message: "Vendor data fetched successfully", data: newData }
      }

      return { success: false, message: "Failed to deleted vendor" }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting vendor" }
    }
  }

  async allVendorsDataTable(page, limit, search,active) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
          $or: [
            { vendor_name: { $regex: searchTerm, $options: "i" } }
          ],
        }
        : {};

       let query = {
        is_deleted: false,
        ...searchCriteria,
      };

      if (active === undefined || active === null || active === "") {
        query.active = { $in: [true, false] }; 
      }else{
        query.active = { $in: active }
      }

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.giftVendorRepository.allVendorsDataTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Gift vendor retrieved successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }
}

export default giftVendorUseCase;