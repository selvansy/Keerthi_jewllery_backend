import { isValidObjectId } from "mongoose";

class ProjectUsecase {
  constructor(projectRepository,clientRepository) {
    this.projectRepository = projectRepository;
    this.clientRepository =  clientRepository;
  }
 
  async findByName(name) {
    const projectData = await this.projectRepository.findByName(name);

    if (!projectData) {
      return { success: false, message: "No project data found" };
    }

    return {
      success: true,
      message: "Project data feteched successfully",
      data: projectData,
    };
  }

  async addProject(data) {
    const projectData = await this.projectRepository.findByName(data.name);

    if (projectData) {
      return { success: false, message: "Project already exisits" };
    }

    const savedProject = await this.projectRepository.addProject(data);

    if (!savedProject) {
      return { success: false, message: "Failed to add new project" };
    }

    return { success: true, message: "Project added successfully" };
  }

  async updateProject(id, name) {
    const projectData = await this.projectRepository.findById(id);

    if (!projectData) {
      return { success: false, message: "No project found" };
    }

    const updatedProject = await this.projectRepository.updateProject(id, name);

    if (!updatedProject) {
      return { success: false, message: "Failed to update project" };
    }

    return { success: true, message: "Project updated successfully" };
  }

  async toggleProjectStatus(id) {
    if(!isValidObjectId(id)){
      return {success:false,message:"Invalid document ID"}
    }

    const projectData = await this.projectRepository.findById(id);

    if (!projectData) {
      return { success: false, message: "No project found" };
    }

    if (projectData.is_deleted == true) {
      return { success: false, message: "Deleted project unable to activate" };
    }

    const updatedProject = await this.projectRepository.toggleProjectStatus(
      id,
      projectData.active
    );

    if (!updatedProject) {
      return { success: false, message: "Failed to update project" };
    }

    let message = updatedProject.active
      ? "Project activated successfully"
      : "Project deactivated";

    return { success: true, message: message };
  }

  async getProjectById(id) {
    const projectData = await this.projectRepository.findById(id);

    if (!projectData) {
      return { success: false, message: "No project found" };
    }

    return {
      success: true,
      message: "Project data retrieved successfully",
      projectData,
    };
  }

  async getAllActiveProjects(page, limit, search) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const searchTerm = search || "";

    const searchCriteria = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    const query = {
      active: true,
      ...searchCriteria,
    };

    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const projectData = await this.projectRepository.getAllActiveProjects({
      query,
      documentskip,
      documentlimit,
    });

    if (!projectData || projectData.length === 0) {
      return { success: false, message: "No active projects found" };
    }

    return {
      success: true,
      message: "Projects fetched successfully",
      data: projectData,
      totalCount: clientData.totalCount,
      totalPages: Math.ceil(clientData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async deleteProject(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }
    
    const projectData = await this.projectRepository.deleteProject(id);

    if (!projectData) {
      return { success: false, message: "Failed to delete project" };
    }

    return { success: true, message: "Project deleted successfully" };
  }

  async getAllProjects() {
    const projectData = await this.projectRepository.getAllProjects();

    if (!projectData) {
      return { success: false, message: "Failed to get project" };
    }

    return { success: true, message: "Project data fetched successfully",data:projectData};
  }

  async getProjectByClient(clientId){
    try {
       if(!isValidObjectId(clientId)){
        return res.status(400).json({message:"Provide a valid object id"})
       }

       const existingClient= await this.clientRepository.getProjectByClient(clientId)

       if(!existingClient){
        return {success:false,message:"No client found"}
       }

       return {success:true,message:"Client project data fetched successfully",data:existingClient}
    } catch (error) {
      console.error(error);
      return {success:false,message:"Error while fetching client"}
    }
  }
}

export default ProjectUsecase;