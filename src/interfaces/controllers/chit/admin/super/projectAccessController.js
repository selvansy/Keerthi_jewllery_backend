class ProjectAccessController {
  constructor(projectAccessUseCase) {
    this.projectAccessUseCase = projectAccessUseCase;
  } 

  async addProjectAccess(req, res) {
    try {
      const { id_project, id_client, id_branch } = req.body;

      if (!id_project || id_project === 0) {
        return res.status(400).json({ status: "Failed", message: "Project is required" });
      }
      if (!id_client) {
        return res.status(400).json({ status: "Failed", message: "Client is required" });
      }
      if (!id_branch) {
        return res.status(400).json({ status: "Failed", message: "Branch is required" });
      }

      const result = await this.projectAccessUseCase.addProjectAccess(req.body);
      res.status(201).json({ status: "Success", message: "Project access added successfully", data: result });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async updateProjectAccess(req, res) {
    try {
      const { id } = req.params;
      const { id_project, id_client, id_branch } = req.body;

      if (!id) {
        return res.status(400).json({ status: "Failed", message: "No object ID provided" });
      }
      if (!id_project || id_project === 0) {
        return res.status(400).json({ status: "Failed", message: "Project is required" });
      }
      if (!id_client) {
        return res.status(400).json({ status: "Failed", message: "Client is required" });
      }
      if (!id_branch) {
        return res.status(400).json({ status: "Failed", message: "Branch is required" });
      }

      const result = await this.projectAccessUseCase.updateProjectAccess(id, req.body);
      if (!result.success) {
        return res.status(400).json({ status: "Failed", message: result.message });
      }

      res.status(200).json({ status: "Success", message: result.message });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async deleteProjectAccess(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ status: "Failed", message: "No object ID provided" });
      }

      const result = await this.projectAccessUseCase.deleteProjectAccess(id);
      if (!result.success) {
        return res.status(400).json({ status: "Failed", message: result.message });
      }

      res.status(200).json({ status: "Success", message: result.message });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async activateProjectAccess(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ status: "Failed", message: "No object ID provided" });
      }

      const result = await this.projectAccessUseCase.activateProjectAccess(id);

      if (!result.success) {
        return res.status(400).json({ status: "Failed", message: result.message });
      }

      res.status(200).json({ status: "Success", message: result.message });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async getProjectAccessById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ status: "Failed", message: "No object ID provided" });
      }

      const result = await this.projectAccessUseCase.getProjectAccessById(id);

      if (!result.success) {
        return res.status(400).json({ status: "Failed", message: result.message });
      }

      res.status(200).json({ status: "Success", message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async getAllActiveProjectAccess(req, res) {
    try {
      const result = await this.projectAccessUseCase.getAllActiveProjectAccess();

      if (!result.success) {
        return res.status(200).json({ status: "Failed", message: result.message ,data:[]});
      }

      res.status(200).json({ status: "Success", message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async projectAccessTable(req, res) {
    try {
      const { page, limit, id_client, id_project, id_branch } = req.body;
  
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);
  
      if (isNaN(pageNumber) || pageNumber <= 0) {
        return res.status(400).json({ status: "Failed", message: "Invalid page number" });
      }
      if (isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ status: "Failed", message: "Invalid limit number" });
      }
  
      const filters = {};
      if (id_client) filters.id_client = id_client;
      if (id_project) filters.id_project = id_project;
      if (id_branch) filters.id_branch = id_branch;
  
      const result = await this.projectAccessUseCase.projectAccessTable(pageNumber, limitNumber, filters);
  
      if (!result || !result.success) {
        return res.status(200).json({ status: "Success", message: result?.message || "No data found", data: [] });
      }
  
      res.status(200).json({
        status: "Success",
        message: result.message,
        data: result.data,
        totalDocuments: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }

  async getBranchByClientId(req, res) {
    try {
      const {clientId} =  req.params;

      if(!clientId){
        return res.status(400).json({message:"No id provided"})
      }

      const result = await this.projectAccessUseCase.getBranchByClientId(clientId);

      if (!result.success) {
        return res.status(200).json({ status: "Failed", message: result.message ,data:[]});
      }

      res.status(200).json({ status: "Success", message: result.message, data: result.data });
    } catch (error) {
      res.status(500).json({ status: "Error", message: error.message });
    }
  }
  
}

export default ProjectAccessController;