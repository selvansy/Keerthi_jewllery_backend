class giftItemCotroller {
    constructor(giftItemUseCase,validator){
        this.giftItemUseCase = giftItemUseCase;
        this.validator = validator;
    }
  
    async addGiftItem(req,res){
        try {
            const { error } = this.validator.giftItemValidations.validate(
                req.body
              );
        
              if (error) {
                return res.status(400).json({ message: error.details[0].message });
              }

              const data = {...req.body}
              if (req.user && req.user.id_employee) {
                data.created_by = req.user.id_employee;
                data.modify_by = req.user.id_employee;
            }
            

            const result= await this.giftItemUseCase.addGiftItem(data);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(201).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"});
        }
    }

    async editGiftItem(req,res){ 
        const {id}=req.params;
        try {
            if(!id){
                return res.status(400).json({message:'No id provided'})
            }

            const { error } = this.validator.giftItemValidations.validate(
                req.body
              );
        
              if (error) {
                return res.status(400).json({ message: error.details[0].message });
              }

              const data = {...req.body}
              if (req.user && req.user.id_employee) {
                data.modify_by = req.user.id_employee;
            }
             
            // let gift_image=''
            // if(req.files){
            //     if(req.files.gift_image){
            //         gift_image = req.files.gift_image[0]
            //     }
            // }
            const result= await this.giftItemUseCase.editGiftItem(id,data);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async deleteGift(req, res) {
        const {id}= req.params;
        try {
          if(!id){
            return res.statu(400).json({message:"No id provided"})
          }
    
          const result= await this.giftItemUseCase.deleteGift(id);
    
          if(!result.success){
            return res.status(400).json({message:result.message});
          }
    
          return res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          return req.staus(500).json({message:"Intenal sever error"})
        }
      }

      async changeGiftItemActiveState(req, res) {
        const {id}= req.params;
        try {
          if(!id){
            return res.status(400).json({message:"No valid id provided"})
          }
    
          const result= await this.giftItemUseCase.changeGiftItemActiveState(id)
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
    
          return res.status(200).json({message:result.message});
        } catch (error) {
          console.error(error);
          return req.status(500).json({message:"Internal server error"})
        }
      }

      async getGiftItemById(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result= await this.giftItemUseCase.getGiftItemById(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message,data:result.data});
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
      }

      async getGiftItemByVendor(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result= await this.giftItemUseCase.getGiftItemByVendor(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message,data:result.data});
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
      }

      async getGiftItemByBranch(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result= await this.giftItemUseCase.getGiftItemByBranch(id)

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message,data:result.data});
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal server error"})
        }
      }

      async getAllActiveGiftItems(req, res) {
        try {
            const { page, limit, search,active } = req.body;
      
            if (!page || isNaN(page) || parseInt(page) <= 0) {
              return res.status(400).json({ message: "Invalid page number" });
            }
            if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
              return res.status(400).json({ message: "Invalid limit number" });
            }
      
            const result = await this.giftItemUseCase.getAllActiveGiftItems(
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

export default giftItemCotroller;