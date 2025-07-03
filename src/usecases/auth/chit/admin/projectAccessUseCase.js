import { isValidObjectId } from "mongoose";
 
class ProjectAccessUseCase {
  constructor(projectAccessRepository) {
    this.projectAccessRepository = projectAccessRepository;
  }

  async addProjectAccess(data) {
    try {
      const newData = await this.projectAccessRepository.addProjectAccess(data);
      if (!newData) {
        return { success: false, message: "Failed to save project access" };
      }
      return { success: true, message: "Project access added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while adding project access" };
    }
  }

  async updateProjectAccess(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }
      const exists = await this.projectAccessRepository.getProjectAccessById(
        id
      );
      if (!exists) {
        return { success: false, message: "No project access found" };
      }
      const updatedData =
        await this.projectAccessRepository.updateProjectAccess(id, data);
      if (!updatedData) {
        return { success: false, message: "Failed to update project access" };
      }
      return { success: true, message: "Project access updated successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while updating project access" };
    }
  }

  async deleteProjectAccess(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }
      const data = await this.projectAccessRepository.deleteProjectAccess(id);
      if (!data) {
        return { success: false, message: "Failed to delete project access" };
      }
      return { success: true, message: "Project access deleted successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting project access" };
    }
  }

  async activateProjectAccess(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.projectAccessRepository.getProjectAccessById(
        id
      );

      if (!exists) {
        return { success: false, message: "No documents found" };
      }

      const result = await this.projectAccessRepository.activateProjectAccess(
        id,
        exists.active
      );

      if (!result) {
        return { success: false, message: "Failed to change active status" };
      }
      let message = exists.active
        ? "Project access deacactivated successfully"
        : "Project access activated successfully";

      return { success: true, message: message };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while activating project access",
      };
    }
  }

  async getProjectAccessById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }
      const result = await this.projectAccessRepository.getProjectAccessById(
        id
      );

      if (!result) {
        return { success: false, message: "Project access not found" };
      }
      return {
        success: true,
        message: "Project access retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while retrieving project access",
      };
    }
  }

  async getAllActiveProjectAccess() {
    try {
      const result =
        await this.projectAccessRepository.getAllActiveProjectAccess();
      return {
        success: true,
        message: "Active project accesses retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while retrieving active project accesses",
      };
    }
  }

  async projectAccessTable(page, limit, filter) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
  
      const query = {
        is_deleted:false,
        active:true,
        ...filter,
      };
  
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const result = await this.projectAccessRepository.projectAccessTable(
        query,
        documentskip,
        documentlimit
      );
  
      return {
        success: true,
        message: "Project access table retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while retrieving project access table",
      };
    }
  }

  async getBranchByClientId(id) {
    try {
      if(!isValidObjectId(id)){
        return {success:false,message:"Provide a valid object id"}
      }

      const data = await this.projectAccessRepository.getBranchByClientId(id);

      if(!data){
        return {success:false,message:"No brach data found"}
      }

      return {
        success: true,
        message: "Active project accesses retrieved successfully",
        data: data,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while retrieving active project accesses",
      };
    }
  }
  
}

export default ProjectAccessUseCase;