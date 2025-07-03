import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

class SubMenuUseCase {
  constructor(subMenuRepository) {
    this.subMenuRepository = subMenuRepository;
  }

  async addSubMenuSetting(data) {
    try {
      const exists = await this.subMenuRepository.findByName(data.submenu_name);

      if (exists) {
        return { success: false, message: "Submenu already exists" };
      }

      const savedData = await this.subMenuRepository.addSubMenuSetting(data);

      if (savedData) {
        return { success: true, message: "Submenu created successfully" };
      }

      return { success: false, message: "Failed to create sub menu" };
    } catch (error) {
      console.error("Error in addSubmenuSetting:", error);
      return {
        success: false,
        message: "An error occurred while adding sub menu",
      };
    }
  }

  async editSubMenuSetting(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existingDoc = await this.subMenuRepository.findById(id);

      if (!existingDoc) {
        return { success: false, message: "Sub menu not found" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        if (value instanceof Date) {
          return value.toISOString().split(".")[0] + "Z";
        }
        return value;
      };

      let fieldsToUpdate = {};
      Object.keys(existingDoc).forEach((key) => {
        if (
          ["_id", "createdAt", "updatedAt", "__v", "is_deleted"].includes(
            key
          ) ||
          data[key] === undefined 
        ) {
          return;
        }

        if (normalizeValue(existingDoc[key]) !== normalizeValue(data[key])) {
          fieldsToUpdate[key] = data[key];
        }
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      const updatedData = await this.subMenuRepository.editSubMenuSetting(
        id,
        fieldsToUpdate
      );

      if (updatedData) {
        return { success: true, message: "Sub menu updated successfully" };
      }

      return { success: false, message: "Failed to update" };
    } catch (error) {
      console.error("Error in editSubMenu:", error);
      return {
        success: false,
        message: "An error occurred while editing sub menu",
      };
    }
  }

  async deleteMenuSetting(id) {
    try {
        if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }
    
          const exists = await this.subMenuRepository.findById(id);

          if(!exists){
            return {success:false,message:"No Submenu setting found"}
          }

          if(exists.is_deleted){
            return {success:false,message:"Already deleted Submenu"}
          }

          const deletedData= await this.subMenuRepository.deleteSubMenu(id);

          if(deletedData){
            return {success:true,message:'Submenu deleted successfully'}
          }

          return {success:false,message:"Failed to delete submenu"}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occurred while deleting submenu"}
    }
  }

  async getSubMenuById(id){
    try {
        if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object ID" };
          }

          const menuData= await this.subMenuRepository.findById(id)

          if(!menuData){
            return {success:false,message:"No submenu found"}
          }

          return {success:true, message:"Submenu data fetched successfully",data:menuData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"An error occured while fetching data"}
    }
  }

  async changeMenuActiveStatus(id){
    try {
      if(!isValidObjectId(id)){
        return {success:false,message:"Provide a valid object id"}
      }

      const exisits= await this.subMenuRepository.findById(id);

      if(!exisits){
        return {success:false,message:'No submenu found'}
      }

      // if(exisits.is_deleted){
      //   return {success:false,message:'Deleted submenu action aborted'}
      // }

      const changedData= await this.subMenuRepository.toggleSubMenuStatus(id,exisits.active);

      if(!changedData){
        return {success:false,message:"Failed to change active state"}
      }

      let message= exisits.active ?
      "Sub menu deactivated successfully" :
      "Sub menu activated successfully"

      return {success:true,message:message}
    } catch (error) {
      console.error(error)
    }
  }

  async getAllActiveSubMenus(page, limit, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [
              { submenu_name: { $regex: searchTerm, $options: "i" } }
            ],
          }
        : {};

      const query = {
        is_deleted:false,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.subMenuRepository.getAllActiveSubMenus({
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
      console.error("Error in getAllActiveSubMenus:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }
}

export default SubMenuUseCase;