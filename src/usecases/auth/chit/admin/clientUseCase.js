import { isValidObjectId } from "mongoose";

class ClientUseCase {
  constructor(clientRepository, projectUsecase) {
    this.clientRepository = clientRepository;
    this.projectUsecase = projectUsecase;
  }

  async addClient(data) {
    try {
      const existingClient = await this.clientRepository.findByName(data.company_name);

      if (existingClient && !isValidObjectId(existingClient._id)) {
        return { success: false, message: "Invalid object ID" };
      }

      if (existingClient && existingClient._id.toString() !== data.id_client) {
        return { success: false, message: "Company name already in use" };
      }

      const projectsToUpdate = [];
      for (const project of data.projects || []) {
        if (project.active) {
          const foundProject = await this.projectUsecase.findByName(project.name);
          if (foundProject) {
            projectsToUpdate.push(foundProject.data._id);
          }
        }
      }

      const clientDataToSave = {
        company_name: data.company_name,
        shop_contact: data.shop_contact,
        md_name: data.md_name,
        md_mobile: data.md_mobile,
        organiz_spocname: data.organiz_spocname,
        organiz_spoccontact: data.organiz_spoccontact,
        aupay_url:data.aupay_url,
        ausale_url:data.ausale_url,
        id_project: data.id_project,
        aupay_active: data.aupay_active,
        ausale_active: data.ausale_active,
        pawn_url: data.pawn_url,
        pawn_active:data.pawn_active,
        active: true,
        sign_date:data.sign_date,
        launch_date:data.launch_date
      };

      if(clientDataToSave.launch_date < clientDataToSave.sign_date){
        return { success: false, message: "Launch Date should be in future Date of Sign Date" };
      }

      if (existingClient) {
        const updatedClient = await this.clientRepository.updateClient(existingClient._id, clientDataToSave);
        return updatedClient
          ? { success: true, message: "Client updated successfully" }
          : { success: false, message: "Failed to update client" };
      } else {
        const savedClient = await this.clientRepository.addClient(clientDataToSave);
        return savedClient
          ? { success: true, message: "Client created successfully" }
          : { success: false, message: "Failed to create new client" };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while processing client" };
    }
  }

  async updateClient(id,data) {
    try {
      const existingClient = await this.clientRepository.findById(id);

      if (existingClient && !isValidObjectId(existingClient._id)) {
        return { success: false, message: "Invalid object ID" };
      }

      if (existingClient && existingClient._id.toString() !== id) {
        return { success: false, message: "No client found" };
      }
      
      if(data.projects){
        const projectsToUpdate = [];
        for (const project of data.projects || []) {
          if (project.active) {
            const foundProject = await this.projectUsecase.findByName(project.name);
            if (foundProject) {
              projectsToUpdate.push(foundProject.data._id);
            }
          }
        }

        return projectsToUpdate;
      }
 

      const clientDataToSave = {
        company_name: data.company_name,
        shop_contact: data.shop_contact,
        md_name: data.md_name,
        md_mobile: data.md_mobile,
        organiz_spocname: data.organiz_spocname,
        organiz_spoccontact: data.organiz_spoccontact,
        aupay_url:data.aupay_url,
        ausale_url:data.ausale_url,
        id_project: data.id_project,
        aupay_active: data.aupay_active,
        ausale_active: data.ausale_active,
        pawn_url: data.pawn_url,
        pawn_active:data.pawn_active,
        active: true,
        sign_date:data.sign_date,
        launch_date:data.launch_date
      };

        const updatedClient = await this.clientRepository.updateClient(id, clientDataToSave);
        return updatedClient
          ? { success: true, message: "Client updated successfully" }
          : { success: false, message: "Failed to update client" };
     
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while processing client" };
    }
  }

  async clientTable(page, limit, search) {
    
    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const searchTerm = search || "";

    const searchCriteria = searchTerm
      ? {
          $or: [
            { company_name: { $regex: searchTerm, $options: "i" } },
            { md_mobile: { $regex: searchTerm, $options: "i" } },
            { shop_contact: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {};

    const query = {is_deleted:false,active:true, ...searchCriteria};

    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const clientData = await this.clientRepository.clientTable({
      query,
      documentskip,
      documentlimit,
    });

    if (!clientData || clientData.length === 0) {
      return { success: false, message: "No active projects found" };
    }

    return {
      success: true,
      message: "Projects fetched successfully",
      data: clientData,
      totalCount: clientData.totalCount,
      totalPages: Math.ceil(clientData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async deleteClient(id){
    try {
       if(!isValidObjectId(id)){
        return res.status(400).json({message:"Provide a valid object id"})
       }

       const existingClient= await this.clientRepository.findById(id)

       if(!existingClient){
        return {success:false,message:"No client found"}
       }

       if(existingClient.is_deleted){
        return {success:false,message:"Already deleted client"}
       }

       const data = await this.clientRepository.deleteClient(id);

       if(!data){
        return {success:false,message:"Failed to delete client"}
       }

       return {success:true,message:"Client deleted successfully"}
    } catch (error) {
      console.error(error);
      return {success:false,message:"Error while deleting client"}
    }
  }

  async activateClient(id){
    try {
       if(!isValidObjectId(id)){
        return res.status(400).json({message:"Provide a valid object id"})
       }

       const existingClient= await this.clientRepository.findById(id)

       if(!existingClient){
        return {success:false,message:"No client found"}
       }

       if(existingClient.is_deleted){
        return {success:false,message:"Deleted client action not permitted"}
       }

       const data = await this.clientRepository.activateClient(id,existingClient.active);

       if(!data){
        return {success:false,message:"Failed to change client state"}
       }

       let message = existingClient.active ?
       "Client deactvated successfully" :
       "Client activated successfully"

       return {success:true,message:message}
    } catch (error) {
      console.error(error);
      return {success:false,message:"Error while changing active status"}
    }
  }

  async getClientById(id){
    try {
       if(!isValidObjectId(id)){
        return res.status(400).json({message:"Provide a valid object id"})
       }

       const existingClient= await this.clientRepository.findById(id)

       if(!existingClient){
        return {success:false,message:"No client found"}
       }

       return {success:true,message:"Client data fetched successfully",data:existingClient}
    } catch (error) {
      console.error(error);
      return {success:false,message:"Error while fetching client"}
    }
  }

  async getAllClients(){
    try {
       const clients= await this.clientRepository.find()

       if(!clients){
        return {success:false,message:"No client found"}
       }

       return {success:true,message:"Client data fetched successfully",data:clients}
    } catch (error) {
      console.error(error);
      return {success:false,message:"Error while fetching client"}
    }
  }
}

export default ClientUseCase;