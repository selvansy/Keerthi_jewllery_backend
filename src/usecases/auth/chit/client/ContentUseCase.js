import mongoose from "mongoose";

class ContentUseCase {
  constructor(ContentRepo) {
    this.ContentRepo = ContentRepo;
  }

  async createContent(data, token) {
    if (!token || !token.id_role) {
      return { success: false, message: "Unauthorized: Token is required" };
    }

    data.updatedBy = token.id_role._id;
    if (!data.createdBy) data.createdBy = token.id_role._id;

    const existsData = await this.ContentRepo.getContentById(data._id);

    if (existsData) {
      return { success: false, message: "Content already exists" };
    }

    const savedConfig = await this.ContentRepo.createContent(data);

    if (!savedConfig) {
      return { success: false, message: "Failed to create content" };
    }

    return {
      success: true,
      message: "Content created successfully",
      data: savedConfig,
    };
  }

  async updateContent(id, data) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Not a valid object ID" };
    }

    const existsData = await this.ContentRepo.getContentById(id);

    if (!existsData) {
      return { success: false, message: "No content found" };
    }

    const savedData = await this.ContentRepo.updateContent(id, data);

    if (!savedData) {
      return { success: false, message: "Failed to update content" };
    }

    return {
      success: true,
      message: "Content updated successfully",
      data: savedData,
    };
  }

  //  async getAllContent({page, limit, search}) {
  //         try {
  //           const pageNum = page ? parseInt(page) : 1;

  //           const pageSize = limit ? parseInt(limit) : 10;

  //           const searchTerm = search || "";

  //           const searchCriteria = searchTerm
  //             ? {
  //                 $or: [
  //                   { title: { $regex: searchTerm, $options: "i" } },
  //                 ],
  //               }
  //             : {};

  //           const query = {
  //             active: true,
  //             ...searchCriteria,
  //           };

  //           const documentskip = (pageNum - 1) * pageSize;
  //           const documentlimit = pageSize;

  //           const Data = await this.ContentRepo.getAllContent({
  //             query,
  //             documentskip,
  //             documentlimit,
  //           });

  //           if (!Data || Data.length === 0) {
  //             return { success: false, message: "No data found" };
  //           }

  //           return {
  //             success: true,
  //             message: "Data fetched successfully",
  //             data: Data.data,
  //             totalDocument: Data.totalCount,
  //             totalPages: Math.ceil(Data.totalCount / pageSize),
  //             currentPage: pageNum,
  //           };
  //         } catch (error) {
  //             console.error("Error in Content UseCase:", error);
  //             return { success: false, message: "Error fetching configurations" };
  //         }
  //       }
  async getAllContent() {
    try {
      // const pageNum = page ? parseInt(page) : 1;

      // const pageSize = limit ? parseInt(limit) : 10;

      // const searchTerm = search || "";

      // const searchCriteria = searchTerm
      //   ? {
      //       $or: [
      //         { title: { $regex: searchTerm, $options: "i" } },
      //       ],
      //     }
      //   : {};

      const query = {
        active: true,
      };

      // const documentskip = (pageNum - 1) * pageSize;
      // const documentlimit = pageSize;

      const Data = await this.ContentRepo.getAllContent({
        query,
        // documentskip,
        // documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: Data.data,
        totalDocument: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in Content UseCase:", error);
      return { success: false, message: "Error fetching configurations" };
    }
  }

  async getContentTypes(type,mobile=false) {
    try {
      const pageNum = 1;
      const pageSize = 1;

      const query = {
        active: true,
        type: type,
      };

      if(mobile){
        query.toAdmin=false
        query.toCustomer=true
      }else{
        query.toAdmin=true
        query.toCustomer=false
      }

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.ContentRepo.getContentTypes({
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
        data: Data.data
      };
    } catch (error) {
      console.error("Error in Content UseCase:", error);
      return { success: false, message: "Error fetching configurations" };
    }
  }

  async getContentByUser(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, message: "Invalid object ID" };
    }

    const content = await this.ContentRepo.getContentById(id);

    if (content) {
      return {
        success: true,
        message: "Content retrieved successfully",
        data: content,
      };
    }

    return { success: false, message: "No content found" };
  }

  async deleteContent(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { success: false, message: "Invalid content ID" };
      }

      const deletedContent = await this.ContentRepo.deleteContent(id);

      if (!deletedContent) {
        return { success: false, message: "Failed to delete content" };
      }

      return deletedContent;
    } catch (error) {
      console.error("Error in deleteContent:", error);
      return { success: false, message: "Error deleting content" };
    }
  }
}

export default ContentUseCase;