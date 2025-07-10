class CampaignTypeController {
  constructor(campaignTypeUseCase, validator) {
    this.campaignTypeUseCase = campaignTypeUseCase;
    this.validator = validator;
  }

  async addCampaignTypeSetting(req, res) {
    try {
      const { error } = this.validator.campaignTypeValidations.validate(req.body);
      
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      
      req.body.createdBy = req.user.id_employee;
      
      const data= req.body;
      
      const result = await this.campaignTypeUseCase.addCampaignType(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editCampaignTypeSetting(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res
          .status(400)
          .json({ message: "No valid document id provided" });
      }

      const { error } = this.validator.campaignTypeValidations.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      req.body.updatedBy = req.user.id_employee;
      
      const data = req.body;
      const result = await this.campaignTypeUseCase.editCampaignType(id, data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.staus(500).json({ message: "Internal server error" });
    }
  }

  async deleteCampaignTypeSetting(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.statu(400).json({message:"No id provided"})
      }

      const result= await this.campaignTypeUseCase.deleteCampaignType(id);

      if(result.success){
        return res.status(200).json({message:result.message});
      }

      return res.status(400).json({message:result.message})
    } catch (error) {
      console.error(error);
      return req.staus(500).json({message:"Intenal sever error"})
    }
  }

  async changeCampaignTypeActiveStatus(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.campaignTypeUseCase.changeCampaignTypeActiveStatus(id)

      if(!result.success){
        return res.status(400).json({message:result.message})
      }

      return res.status(200).json({message:result.message});
    } catch (error) {
      console.error(error);
      return req.status(500).json({message:"Internal server error"})
    }
  }

  async getAllActiveCampaignTypeSettings(req, res) {
    try {
        const { page, limit, search } = req.body;

        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        if ( isNaN(pageNumber) || pageNumber <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
        }
        if (isNaN(limitNumber) || limitNumber <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
        }

        const result = await this.campaignTypeUseCase.getAllActiveCampaignTypes(
            pageNumber,
            limitNumber,
            search
        );

        if (!result || !result.success) {
            return res.status(200).json({ message: result.message,data:[]});
        }

        res.status(200).json({
            message: result.message,
            data: result.data,
            totalDocuments: result.totalCount,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


  async getCampaignTypeById(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.campaignTypeUseCase.getCampaignTypeById(id)

      if(result.success === false){
        return res.status(400).json({message:result.message});
      }

      return res.status(200).json({message:result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAllCampaignType(req, res) {
    try {
      const roleId = req.user.id_role._id
      const result= await this.campaignTypeUseCase.getAllCampaignType()

      if(result.success === false){
        return res.status(400).json({message:result.message});
      }

      return res.status(200).json({message:result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }
}

export default CampaignTypeController; 