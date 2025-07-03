class MetalController {
    constructor(metalUseCase,validator){
        this.validator = validator;
        this.metalUseCase=metalUseCase;
    }

    async addMetal(req,res){
        try {
          const { error } = this.validator.metalValidations.metal_name.validate(req.body.metal_name);
    
          if (error) {
            return res.status(400).json({ message: error.details[0].message });
          }
    
          const data= req.body
          const result= await this.metalUseCase.addMetal(data);
    
          if(!result.success){
            return res.status(400).json({message:result.message});
          }
           
          res.status(201).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
      
      async editMetal(req,res){
        const {id}= req.params;
        try{
          if(!id){
            return res.status(400).json({message:"No valid id provided"})
          }
    
          const { error } = this.validator.metalValidations.metal_name.validate(req.body.metal_name);
    
          if (error) {
            return res.status(400).json({ message: error.details[0].message });
          }
    
          const data= req.body;
          const result= await this.metalUseCase.editMetal(id,data);
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
          
          res.status(200).json({message:result.message})
        }catch(error){
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async getMetalById(req,res){
        const {id}= req.params;
        try {
          if(!id){
            return res.status(400).json({message:"No object id provided"})
          }
    
          const result= await this.metalUseCase.getMetalById(id);
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
    
          res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async deleteMetal(req,res){
        const {id}= req.params
        try {
          if(!id){
            return res.status(400).json({message:"No id provided"})
          }
    
          const result= await this.metalUseCase.deleteMetal(id);
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
          
          res.status(200).json({message:result.message});
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async toggleMetalActiveState(req,res){
        const {id}= req.params;
        try {
          if(!id){
            return res.status(400).json({message:"No document id provided"})
          }
    
          const result= await this.metalUseCase.toggleMetalActiveState(id);
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
    
          res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async metalTableData(req,res){
        try {
          const { page, limit, search } = req.body;

          if (isNaN(page) || parseInt(page) <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
          }
          if (isNaN(limit) || parseInt(limit) <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
          }
    
          const result =
            await this.metalUseCase.metalTableData(
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
            currentPage:result.currentPage,
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async getAllMetals(req,res){
        try {
            const result = await this.metalUseCase.getAllMetals();

            if(!result.success){
              return res.status(200).json({message:result.message,data:[]})
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
}

export default MetalController;