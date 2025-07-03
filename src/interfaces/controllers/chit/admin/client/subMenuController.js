class SubMenuController {
  constructor(subMenuUseCase, validator) {
    this.subMenuUseCase = subMenuUseCase;
    this.validator = validator;
  }

  async addSubMenuSetting(req, res) {
    try {
      const { error } = this.validator.subMenuSettngValidations.validate(
        req.body
      );
      
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data= req.body;
      const result= await this.subMenuUseCase.addSubMenuSetting(data);

      if(!result.success){
        return res.status(400).json({message:result.message})
      }

      return res.status(201).json({message:result.message});
    } catch (error) {
      console.error(error);
      return res.staus(500).json({ message: "Internal server error" });
    }
  }

  async editSubMenuSetting(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res
          .status(400)
          .json({ message: "No valid document id provided" });
      }
      const { error } = this.validator.subMenuSettngValidations.validate(
        req.body
      );

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data = req.body;
      const result = await this.subMenuUseCase.editSubMenuSetting(id, data);

      if(!result.success){
        return res.status(400).json({message:result.message});
    }

    return res.status(200).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.staus(500).json({ message: "Internal server error" });
    }
  }

  async deleteSubMenuSetting(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.statu(400).json({message:"No id provided"})
      }

      const result= await this.subMenuUseCase.deleteMenuSetting(id);

      if(!result.success){
        return res.status(400).json({message:result.message});
      }

      return res.status(200).json({message:result.message})
    } catch (error) {
      console.error(error);
      return req.staus(500).json({message:"Intenal sever error"})
    }
  }

  async changeSubMenuActiveStatus(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.subMenuUseCase.changeMenuActiveStatus(id)

      if(!result.success){
        return res.status(400).json({message:result.message})
      }

      return res.status(200).json({message:result.message});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getSubMenuById(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.subMenuUseCase.getSubMenuById(id)

      if(!result.success){
        return res.status(400).json({message:result.message});
      }

      return res.status(200).json({message:result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAllActiveSubMenuSettings(req, res) {
    try {
        const { page, limit, search } = req.body;
  
        if (!page || isNaN(page) || parseInt(page) <= 0) {
          return res.status(400).json({ message: "Invalid page number" });
        }
        if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
          return res.status(400).json({ message: "Invalid limit number" });
        }
  
        const result = await this.subMenuUseCase.getAllActiveSubMenus(
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
          totalDocument: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
  }
}

export default SubMenuController;