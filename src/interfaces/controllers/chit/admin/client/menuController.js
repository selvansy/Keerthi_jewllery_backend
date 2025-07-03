class MenuController {
  constructor(menuUseCase, validator) {
    this.menuUseCase = menuUseCase;
    this.validator = validator;
  }

  async addMenuSetting(req, res) {
    try {
      const { error } = this.validator.menuSettngValidations.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data= req.body;
      const result = await this.menuUseCase.addMenuSetting(data,req.file);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editMenuSetting(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res
          .status(400)
          .json({ message: "No valid document id provided" });
      }

      const { error } = this.validator.menuSettngValidations.validate(req.body);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      
      const data = req.body;
      const result = await this.menuUseCase.editMenuSetting(id, data,req.file);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.staus(500).json({ message: "Internal server error" });
    }
  }

  async deleteMenuSetting(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.statu(400).json({message:"No id provided"})
      }

      const result= await this.menuUseCase.deleteMenuSetting(id);

      if(result.success){
        return res.status(200).json({message:result.message});
      }

      return res.status(400).json({message:result.message})
    } catch (error) {
      console.error(error);
      return req.staus(500).json({message:"Intenal sever error"})
    }
  }

  async changeMenuActiveStatus(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.menuUseCase.changeMenuActiveStatus(id)

      if(!result.success){
        return res.status(400).json({message:result.message})
      }

      return res.status(200).json({message:result.message});
    } catch (error) {
      console.error(error);
      return req.status(500).json({message:"Internal server error"})
    }
  }

  async getAllActiveMenuSettings(req, res) {
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

        const result = await this.menuUseCase.getAllActiveMenuSettings(
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


  async getMenuById(req, res) {
    const {id}= req.params;
    try {
      if(!id){
        return res.status(400).json({message:"No valid id provided"})
      }

      const result= await this.menuUseCase.getMenuById(id)

      if(result.success === false){
        return res.status(400).json({message:result.message});
      }

      return res.status(200).json({message:result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAllMenu(req, res) {
    try {
      const roleId = req.user.id_role._id
      const result= await this.menuUseCase.getAllMenu()

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

export default MenuController;