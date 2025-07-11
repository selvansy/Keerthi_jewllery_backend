class PurityController{
    constructor(pruityUseCase,validator){
        this.purityUseCase= pruityUseCase;
        this.validator= validator;
    }

    async addPurity(req,res){
        try {
            const {error} = this.validator.purityValidations.validate(req.body)

            if(error){
                console.error(error)
                return res.status(400).json({message:error.details[0].message})
            }

            const data= {...req.body};
            const result = await this.purityUseCase.addPurity(data,req.user)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async updatePurity(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:'No valid id provided'})
            }

            const {error} = this.validator.purityValidations.validate(req.body)

            if(error){
                console.error(error)
                return res.status(400).json({message:error.details[0].message})
            }

            const data= {...req.body};
            const result = await this.purityUseCase.updatePurity(id,data)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async deletePurity(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:'No valid id provided'})
            }

            const result = await this.purityUseCase.deletePurity(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async activatePurity(req,res){
        const {id} = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await this.purityUseCase.activatePurity(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async purityDisplaySettings(req,res){
        const {id} = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await this.purityUseCase.purityDisplaySettings(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message});
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getPurityById(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await this.purityUseCase.getPurityById(id)

            if(!result.success){
                return res.status(400).json({message:result.message});
            }
            
            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getPurityByMetalId(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await this.purityUseCase.getPurityByMetalId(id)

            if(!result.success){
                return res.status(400).json({message:result.message});
            }
            
            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getAllPurity(req,res){
        try {
            const result = await this.purityUseCase.getAllPurity()

            if(!result.success){
                return res.status(400).json({message:result.message,data:[]});
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
    }

      async puityTable(req, res) {
        try {
            let { page, limit, search } = req.body;
            
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;
            search = search || ""; 
    
            if ( !page || isNaN(page) || page <= 0) {
                return res.status(400).json({ message: "Invalid page number" });
            }
            if (!limit || isNaN(limit) || limit <= 0) {
                return res.status(400).json({ message: "Invalid limit number" });
            }
    
            const result = await this.purityUseCase.puityTable(page, limit, search);
    
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

export default PurityController;