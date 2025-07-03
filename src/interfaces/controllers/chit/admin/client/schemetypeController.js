class SchemeTypeController{
    constructor(schemetypeUseCase,validator){
        this.schemetypeUsecase= schemetypeUseCase;
        this.validator = validator;
    }

    async addSchemeType(req,res){
        const {
          scheme_typename,
        } = req.body;
      
        try {
          if (!scheme_typename) {
            return res.status(400).json({message: 'Scheme Type Name is required' });
          }
    
          const data=req.body;
          const result = await this.schemetypeUsecase.addSchemeType(data);
    
          if (!result.success) {
            return res.status(400).json({message:result.message});
          }
    
          res.status(201).json({message:result.message});
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error'});
        }
      }
    
      async editSchemeType(req,res){
        const {id}= req.params;
        const {
          scheme_typename,
        } = req.body;
      
        try {
          if(!id){
            return res.status(400).json({message:"ID required"})
          }
    
          if (!scheme_typename) {
            return res.status(400).json({message: 'Scheme Type Name is required' });
          }
    
          const data=req.body;
          const result = await this.schemetypeUsecase.editSchemeType(id,data);
    
          if (!result.success) {
            return res.status(400).json({message:result.message});
          }
    
          res.status(201).json({message:result.message});
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error'});
        }
      }
    
      async deleteSchemeType(req, res) {
        try {
          const { id } = req.params;
    
          if (!id) {
            return res
              .status(400)
              .json({ message: "Schemetype ID is required" });
          }
    
          const result = await this.schemetypeUsecase.deleteSchemeType(id);
    
          if (result.success) {
            return res.status(200).json({ message: result.message });
          } else if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
        } catch (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
        }
      }
    
      async changeSchemeTypeStatus(req,res){
        try {
          const {id}= req.params
           if(!id){
            return res.status(400).json({message:"Scheme type ID required"})
           }
    
           const result= await this.schemetypeUsecase.changeSchemeTypeStatus(id);
    
           if(!result.success){
            return res.status(400).json({message:result.message});
           }
    
           res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async getSchemeTypeByid(req,res){
        try {
          const {id}= req.params;
    
          if(!id){
            return res.status(400).json({message:"Scheme type ID required"})
          }
    
          const result= await this.schemetypeUsecase.getSchemeTypeByid(id)
    
          if(!result.success) {
            return res.status(400).json({message:result.message})
          }
    
          res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async schemeTypeTable(req, res) {
        try {
          const { page, limit, search } = req.body;
    
          if (!page || isNaN(page) || parseInt(page) <= 0) {
            return res.status(400).json({ message: "Invalid page number" });
          }
          if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
            return res.status(400).json({ message: "Invalid limit number" });
          }
    
          const result =
            await this.schemetypeUsecase.schemeTypeTable(
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

      async getAllActiveSchemeTypes(req,res){
        try {
           const result = await this.schemetypeUsecase.getAllActiveSchemeTypes()

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

export default SchemeTypeController;