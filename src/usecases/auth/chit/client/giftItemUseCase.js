import { isValidObjectId } from "mongoose"; 
import mongoose from "mongoose";
import config from "../../../../config/chit/env.js";
  
class giftItemUseCase {
  constructor(giftItemRepository, s3service, s3Repo) {
    this.giftItemRepository = giftItemRepository;
    // this.s3service = s3service;
    // this.s3Repo = s3Repo;
  }

  // async addGiftItem(data, gift_image) {
  //   try {
  //     if (gift_image) {
  //       const s3Configs = await this.s3Helper(data.id_branch);

  //       if (!s3Configs) {
  //         return { success: false, message: "No s3bucket configuraiton found" };
  //       }

  //       try {
  //         data.gift_image = await this.s3service.uploadToS3(
  //           gift_image,
  //           "giftItem",
  //           s3Configs
  //         );
  //       } catch (s3Error) {
  //         console.error(s3Error);
  //         return { success: false, message: "Error uploading image to S3" };
  //       }
  //     }
  //     data.createdate = Date.now();
  //     data.modifydate = Date.now();
  //     const savedGift = await this.giftItemRepository.addGiftItem(data);

  //     if (savedGift) {
  //       return { success: true, message: "Gift added successfully" };
  //     }

  //     return { success: false, message: "Failed to add gift" };
  //   } catch (error) {
  //     console.error(error);
  //     if (error.message.includes("S3")) {
  //       return { success: false, message: "Error uploading image to S3" };
  //     }
  //     return { success: false, message: "An error occured while adding gift" };
  //   }
  // }

  
  async addGiftItem(data) {
    try {
      data.createdate = Date.now();
      data.modifydate = Date.now();
      const savedGift = await this.giftItemRepository.addGiftItem(data);
     
      if (savedGift) {
        return { success: true, message: "Gift added successfully" };
      }

      return { success: false, message: "Failed to add gift" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while adding gift" };
    }
  }


  async editGiftItem(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }
      const exists = await this.giftItemRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No gift item found" };
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

      Object.keys(exists).forEach((key) => {
        if (
          ["_id", "createdAt", "updatedAt", "__v", "is_deleted"].includes(
            key
          ) ||
          data[key] === undefined
        ) {
          return;
        }

        if (normalizeValue(exists[key]) !== normalizeValue(data[key])) {
       
          fieldsToUpdate[key] = data[key];
        }
        
      });

    

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      

      const updatedData = this.giftItemRepository.editGiftItem(
        id,
        fieldsToUpdate
      );
       
      if (updatedData) {
        return { success: true, message: "Gift edited successfully" };
      }

      return { success: false, message: "Failed to edit gift" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while editing gift" };
    }
  }

  async deleteGift(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.giftItemRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No gift found" };
      }

      if (exists.is_deleted) {
        return { success: false, message: "Already deleted gift" };
      }

      const deletedData = await this.giftItemRepository.deleteGift(id);

      if (deletedData) {
        return { success: true, message: "Gift deleted successfully" };
      }

      return { success: false, message: "Failed to delete gift" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while deleting gift",
      };
    }
  }

  async changeGiftItemActiveState(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.giftItemRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No gift found" };
      }

      if (exists.is_deleted) {
        return { success: false, message: "Deleted gift no action performed" };
      }

      const updatedData =
        await this.giftItemRepository.changeGiftItemActiveState(
          id,
          exists.active
        );

      if (!updatedData) {
        return { success: false, message: "Failed to change active status" };
      }

      let message = updatedData.active
        ? "Gift activated successfully"
        : "Gift deactivated";

      return { success: true, message: message };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while switching gift status",
      };
    }
  }

  async getGiftItemById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const giftData = await this.giftItemRepository.findById(id);

      if (giftData) {
        return {
          success: true,
          message: "Data fetched successfully",
          data: giftData,
        };
      }

      return { success: false, message: "No gift item found" };
    } catch (error) {
      console.error(error);
    }
  }

  async getGiftItemByVendor(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const giftData = await this.giftItemRepository.findByVendorId(id);

      if (giftData) {
        return {
          success: true,
          message: "Data fetched successfully",
          data: giftData,
        };
      }

      return { success: false, message: "Failed to fetch data" };
    } catch (error) {
      console.error(error);
    }
  }

  async getGiftItemByBranch(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const giftData = await this.giftItemRepository.findByBranchId(id);

      if (giftData) {
        return {
          success: true,
          message: "Data fetched successfully",
          data: giftData,
        };
      }

      return { success: false, message: "Failed to fetch data" };
    } catch (error) {
      console.error(error);
    }
  }

  async getAllActiveGiftItems(page, limit, search,active) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [{ gift_name: { $regex: searchTerm, $options: "i" } }],
          }
        : {};

      let query = {
        is_deleted: false,
        ...searchCriteria,
      };

      if (active === undefined || active === null || active === "") {
        query.active = { $in: [true, false] }; 
      }else{
        query.active = { $in: [active] }
      }

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
}

export default giftItemUseCase;