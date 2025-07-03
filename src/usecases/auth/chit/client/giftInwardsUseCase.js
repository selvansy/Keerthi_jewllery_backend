import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
 
class giftInwardsUseCase { 
  constructor(giftInwardsRepository) {
    this.giftInwardsRepository = giftInwardsRepository;
  } 

  async addGiftInward(data) {
    try {
      const savedData = await this.giftInwardsRepository.addGiftInward(data);

      if (!savedData) {
        return { success: false, message: "Failed to add gift" };
      }

      return { success: true, message: "Gift added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while adding gift" };
    }
  }

  async getGiftInwardsById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const fetchedData = await this.giftInwardsRepository.findById(id);

      if (!fetchedData) {
        return { success: false, message: "No data found" };
      }

      let inwardsData = fetchedData;

      const gstPercent = fetchedData.gst_percenty.toString();
      const sellPrice = fetchedData.cus_sellprice.toString();

      inwardsData.gst_percenty = gstPercent;
      inwardsData.cus_sellprice = sellPrice;

      return {
        success: true,
        message: "Gift data retrieved successfully",
        data: inwardsData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
  }

  async getGiftInwardsByBranch(branchId) {
    try {
      if (!isValidObjectId(branchId)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const query =  {id_branch:branchId , active: true, is_deleted: false}
     
      const fetchedData = await this.giftInwardsRepository.getByBranch(query);
  

      if (!fetchedData || fetchedData.length === 0) {
        return { success: false, message: "No data found" };
      }
  
      const inwardsData = fetchedData.map(doc => {
        const gstPercent = doc.gst_percenty.toString(); 
        const sellPrice = doc.cus_sellprice.toString();
  
        return {
          ...doc,
          gst_percenty: gstPercent,
          cus_sellprice: sellPrice,
        };
      });

      return {
        success: true,
        message: "Gift data retrieved successfully",
        data: inwardsData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
  }

  async editGiftInward(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.giftInwardsRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No gift data found" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        if (value instanceof mongoose.Types.Decimal128) {
          return parseFloat(value.toString());
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "number") {
          return value;
        }
        return value;
      };

      const normalizedExists = {};
      for (const key in exists) {
        normalizedExists[key] = normalizeValue(exists[key]);
      }

      const normalizedData = {};
      for (const key in data) {
        normalizedData[key] = normalizeValue(data[key]);
      }

      let fieldsToUpdate = {};
      for (const key in normalizedData) {
        if (
          [
            "_id",
            "createdAt",
            "updatedAt",
            "__v",
            "is_deleted",
            "created_by",
          ].includes(key)
        ) {
          continue;
        }

        const existingValue = normalizedExists[key];
        const newValue = normalizedData[key];

        if (
          existingValue !== newValue &&
          newValue !== undefined &&
          newValue !== null
        ) {
          fieldsToUpdate[key] = data[key];
        }
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      const savedData = await this.giftInwardsRepository.editGiftInward(
        id,
        fieldsToUpdate
      );

      if (!savedData) {
        return { success: false, message: "Failed to update gift" };
      }

      return {
        success: true,
        message: "Gift updated successfully",
        data: savedData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while updating the gift",
      };
    }
  }

  async deleteGiftInward(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const metalRate = await this.giftInwardsRepository.findById(id);

      if (!metalRate) {
        return { success: false, message: "Inwards data not found" };
      }

      if (metalRate.is_deleted) {
        return { success: false, message: "Already deleted document" };
      }

      const newData = await this.giftInwardsRepository.deleteGiftInward(id);

      if (newData) {
        return { success: true, message: "Gift inwards deleted" };
      }

      return { success: false, message: "Failed to delete Gift" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while deleting gift inwards",
      };
    }
  }

  async changeInwardsActiveStatus(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const exisits = await this.giftInwardsRepository.findById(id);

      if (!exisits) {
        return { success: false, message: "No data found" };
      }

      if (exisits.is_deleted) {
        return { success: false, message: "Already deleted document" };
      }

      const newData = await this.giftInwardsRepository.changeInwardsActiveStatus(id,exisits.active);

      if (!newData) {
        return { success: false, message: "Failed to change active status" };
      }

      let message=  exisits.active ? 
      'Gift inwards deactivated' :
      'Gift inwards activated'

      return {success:true,message:message}
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while deleting gift inwards",
      };
    }
  }

  async giftInwardsDataTable({ page, limit, searchCriteria,active}) {
    try {
      const pageNum = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;

      let query = {
        is_deleted: false,
        ...searchCriteria,
      };

      if (active === undefined || active === null || active === "") {
        query.active = { $in: [true, false] }; 
      }else{
        query.active = { $in: active }
      }

      // const query = {
      //   active: { $in: [true, false] },
      //   is_deleted:false,
      //   ...searchCriteria 
      // };
  
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const data = await this.giftInwardsRepository.giftInwardsDataTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!data || data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: data,
        totalCount: data.totalCount,
        totalPages: Math.ceil(data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in giftInwardsDataTable use case:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }
  
}

export default giftInwardsUseCase;