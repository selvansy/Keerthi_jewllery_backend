class giftVendorController {
    constructor(giftVendorUseCase,validator){
        this.giftVendorUseCase= giftVendorUseCase;
        this.validator= validator; 
    }
 
    async addGiftVendor(req,res){
        try {
            const { error } = this.validator.giftVendorValidations.validate(
                req.body
              );
        
              if (error) {
                return res.status(400).json({ message: error.details[0].message });
              }
    
             const data= {...req.body};

             if(req.user && req.user.id_employee){
                data.modify_by= req.user.id_employee;
                data.created_by= req.user.id_employee
             }
    
             const result= await this.giftVendorUseCase.addGiftVendor(data);
    
             if(!result.success){
                return res.status(400).json({message:result.message})
             }
    
             return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async editGiftVendor(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:'No valid id provided'})
            }

            const { error } = this.validator.giftVendorValidations.validate(
                req.body
              );
        
              if (error) {
                return res.status(400).json({ message: error.details[0].message });
              }

              const data= {...req.body};

             if(req.user && req.user.id_employee){
                data.modify_by= req.user.id_employee;
             }

             const result= await this.giftVendorUseCase.editGiftVendor(id,data);

            if(!result.success){
                return res.status(400).json({message:result.message})
             }
    
             return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async deleteVendor(req,res){
        const {id}=req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"});
            }

            const result = await this.giftVendorUseCase.deleteVendor(id);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }
            
            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async changeVendorActiveState(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"});
            }

            const result= await this.giftVendorUseCase.changeVendorActiveState(id);

            if(!result.success){
                return res.status(400).json({message:result.message});
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getGiftItemById(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"});
            }

            const result= await this.giftVendorUseCase.getGiftItemById(id);

            if(!result.success){
                return res.status(400).json({message:result.message});
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getGiftVendorByBranch(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"});
            }

            const result= await this.giftVendorUseCase.getGiftVendorByBranch(id);

            if(!result.success){
                return res.status(200).json({message:result.message,data:[]});
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getAllActiveVendors(req,res){
        try {
            const result= await this.giftVendorUseCase.getAllActiveVendors();

            if(!result.success){
                return res.status(400).json({message:result.message});
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async allVendorsDataTable(req, res) {
        try {
            const { page, limit, search,active } = req.body;
      
            if (!page || isNaN(page) || parseInt(page) <= 0) {
              return res.status(400).json({ message: "Invalid page number" });
            }
            if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
              return res.status(400).json({ message: "Invalid limit number" });
            }
      
            const result = await this.giftVendorUseCase.allVendorsDataTable(
              page,
              limit,
              search,
              active
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

export default giftVendorController;