class AdminController {
  constructor(adminUseCase, clientUsecase, projectUsecase
    ,appsettingUseCase
  ) {  
    this.adminUseCase = adminUseCase;
    this.clientUseCase = clientUsecase;
    this.projectUsecase = projectUsecase;
    this.appsettingUsecase= appsettingUseCase;
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await this.adminUseCase.findAdmin(username, password);
      if (result.success) {
        return res.status(200).json({
          message: result.message,
          token: result.token,
          user: result.user,
        });
      }

      if (
        result.message === "Not found" ||
        result.message === "Invalid password or Email"
      ) {
        return res.status(400).json({ message: result.message });
      }

      if (result.message === "Deactivated") {
        return res.status(403).json({ message: result.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async addNewAdmin(req, res) {
    try {
      const data = req.body;
      const result = await this.adminUseCase.addAdmin(data);

      if (!result.success) {
        return res.status(400).json({
          message: result.message,
        });
      }

      return res.status(200).json({
        message: result.message,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async changeActiveState(req, res) {
    try {
      const { id } = req.params;
      const result = await this.adminUseCase.changeActiveState(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      } else if (!result.status) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      if(!id){
        return res.status(400).json({message:'ID required'})
      }
      const result = await this.adminUseCase.deleteAdmin(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      } else if (!result.success) {
        return res.status(400).json({ message: result.message });
      } 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async addClient(req, res) {
    try {
      const { company_name } = req.body;

      const data = {...req.body};

      if (!company_name || company_name === '') {
        return res.status(400).json({ message: 'Company Name required' });
      }

      const result = await this.clientUseCase.addClient(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async updateClient(req, res) {
    const {id} = req.params;
    
    try {
         if(!id){
          return res.status(400).json({message:"No valid document id provided"})
         }

      const { company_name } = req.body;
 

      const data = {...req.body};

      if (!company_name || company_name === '') {
        return res.status(400).json({ message: 'Company Name required' });
      }

      const result = await this.clientUseCase.updateClient(id,data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async clientTable(req, res) {
    try {
      const { page, limit, search } = req.body;
      const result = await this.clientUseCase.clientTable(page, limit, search);

      if (!result.success) {
        return res.status(204).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message, 
        data: result.data.clientData ,
            totalDocuments: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async deleteClient(req,res){
    const {id}= req.params;
    try {
       if(!id){
        return res.status(400).json({message:"No client id provided"})
       }

       const result = await this.clientUseCase.deleteClient(id);

       if(!result.success){
        return res.status(400).json({message:result.message})
       }

       return res.status(200).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:'Internal server error'})
    }
  }

  async activateClient(req,res){
    const {id}= req.params;
    try {
       if(!id){
        return res.status(400).json({message:"No client id provided"})
       }

       const result = await this.clientUseCase.activateClient(id);

       if(!result.success){
        return res.status(400).json({message:result.message})
       }

       return res.status(200).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:'Internal server error'})
    }
  }

  async getClientById(req,res){
    const {id}= req.params;
    try {
       if(!id){
        return res.status(400).json({message:"No client id provided"})
       }

       const result = await this.clientUseCase.getClientById(id);

       if(!result.success){
        return res.status(400).json({message:result.message})
       }

       return res.status(200).json({message:result.message,data:result.data})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:'Internal server error'})
    }
  }

  async getAllClients(req,res){
    try {
       const result = await this.clientUseCase.getAllClients();

       if(!result.success){
        return res.status(400).json({message:result.message})
       }

       return res.status(200).json({message:result.message,data:result.data})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:'Internal server error'})
    }
  }

  ///// project section

  async getProjectByClient(req,res){
    const {clientId}= req.params;
    try {
       if(!clientId){
        return res.status(400).json({message:"No client id provided"})
       }

       const result = await this.projectUsecase.getProjectByClient(clientId);

       if(!result.success){
        return res.status(400).json({message:result.message})
       }

       return res.status(200).json({message:result.message,data:result.data})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:'Internal server error'})
    }
  }

  async addProject(req, res) {
    try {
      const { project_name } = req.body;

      const result = await this.projectUsecase.addProject({ project_name: project_name });

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async updateProject(req, res) {
    try {
      const { project_name } = req.body;
      const { id } = req.params;

      const result = await this.projectUsecase.updateProject(id, project_name);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async toggleProjectStatus(req, res) {
    try {
      const { id } = req.params;

      const result = await this.projectUsecase.toggleProjectStatus(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.projectUsecase.getProjectById(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message, data: result.projectData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async getAllActiveProjects(req, res) {
    try {
      const { page, limit, search } = req.body;
      const result = await this.projectUsecase.getAllActiveProjects(page, limit, search);

      if (!result.success) {
        return res.status(204).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message, data: result.data,totalDocuments: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async getAllProjects(req, res) {
    try {
      const result = await this.projectUsecase.getAllProjects();

      if (!result.success) {
        return res.status(200).json({ message: result.message,data:[]});
      }

      return res.status(200).json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const result = await this.projectUsecase.deleteProject(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  //app setting
  async addAppSetting(req, res) {
    const {    
      id_branch,
      id_project,
      id_client
    } = req.body;
    try {
      if (!id_client || id_client === "") {
        return res.status(400).json({ status: 'Failed', message: 'Client Id is required' });
      } 
  
      if (!id_branch || id_branch === "") {
        return res.status(400).json({ status: 'Failed', message: 'Branch Id is required' });
      } 
  
      if (!id_project || id_project === "") {
        return res.status(400).json({ status: 'Failed', message: 'Project Id is required' });
      }

      const data=req.body
      const result= await this.appsettingUsecase.addAppSetting(data)

      if(!result.success){
        return res.status(400).json({message:result.message});
      }

      res.status(201).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async updataAppSetting(req, res) {
    const {id}= req.params;

    const {    
      id_client,
      id_branch,
      id_project,
      android_version,
      ios_version,
      is_android_latest,
      is_ios_latest,
      android_link,
      ios_link,
      youtube_link,
      facebook_link,
      instagram_link,
      website_link,
      social_link,
      android_launch,
      ios_launch,
    } = req.body;
    try {
      if(!id){
        return res.status(400).json({message:"No valid object id provided"})
      }
      if (!id_client || id_client === "") {
        return res.status(400).json({message: 'Client Id is required' });
      } 
  
      if (!id_branch || id_branch === "") {
        return res.status(400).json({message: 'Branch Id is required' });
      } 
  
      if (!id_project || id_project === "") {
        return res.status(400).json({message: 'Project Id is required' });
      }

      const updateFields = Object.entries({
        id_client,
        id_branch,
        id_project,
        android_version,
        ios_version,
        is_android_latest,
        is_ios_latest,
        android_link,
        ios_link,
        youtube_link,
        facebook_link,
        instagram_link,
        website_link,
        social_link,
        android_launch,
        ios_launch,
      }).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') acc[key] = value;
        return acc;
      }, {});
  
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({message: 'No fields to update' });
      }

      const result= await this.appsettingUsecase.updateAppSetting(id,updateFields)

      if(!result.success){
        return res.status(400).json({message:result.message});
      }

      res.status(201).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

  async getAppSettingById(req,res){
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.appsettingUsecase.getAppSettingById(id)

      if(!result.success){
        return res.status(400).json({message:result.message})
      }

      res.status(200).json({message:result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAppSettingByBranchId(req,res){
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No branch id provided"})
      }

      const result= await this.appsettingUsecase.getAppSettingByBranchId(id);

      if(result.success){
        return res.status(200).json({message:"Setting data fetched successfully",data:result.data})
      }

      return res.status(400).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAppSettingByProjectAndBranch(req,res){
    const {projectId,branchId}= req.params;
    try {
      if(!projectId){
        return res.status(400).json({message:"No project id provided"})
      }else if(!branchId){
        return res.status(400).json({message:"No branch id provided"})
      }

      const result= await this.appsettingUsecase.getAppSettingByProjectAndBranch(projectId,branchId);

      if(result.success){
        return res.status(200).json({message:"Setting data fetched successfully",data:result.data})
      }

      return res.status(400).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAllAppSettings(req, res) {
    try {
      const { page, limit, search } = req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const result =
        await this.appsettingUsecase.getAllAppSettings(
          page,
          limit,
          search
        );

      if (!result || !result.success) {
        return res.status(404).json({ message: result.message });
      }

      res.status(200).json({
        message: result.message,
        data: result.data,
        totalDocument:result.totalCount,
        totalPages:result.totalPages,
        currentPage:result.currentPage
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default AdminController;