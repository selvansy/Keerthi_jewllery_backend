import { isValidObjectId } from "mongoose";

class GiftIssuesController { 
    constructor(giftIssuesUseCase,validator) {
      this.giftIssuesUseCase = giftIssuesUseCase;
      this.validator = validator; 
    }
  
    async addGiftIssue(req, res) {
      try {
        const {    
            issue_type,
            id_branch,
            id_giftinward,
            id_gift,
            gift_code,
            id_customer,
            divsion,
            excess_amount
          } = req.body;

          const validate = {issue_type,
            id_branch,
            id_giftinward,
            id_gift,
            gift_code,
            id_customer,
            divsion,
            excess_amount
          }

        // const { error } = this.validator.giftIssuesValidations.validate(validate);

        // if (error) {
        //   return res.status(400).json({ message: error.details[0].message });
        // }
  
        const data = { ...req.body };
        
        const result = await this.giftIssuesUseCase.addGiftIssue(data);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(201).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async editGiftIssue(req, res) {
      const { id } = req.params;
      try {
        if (!id) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const { error } = this.validator.giftIssuesValidations.validate(req.body, { abortEarly: false });
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }
  
        const data = { ...req.body };
        if (req && req.user.id_employee) {
          data.created_by = req.user.id_employee;
          data.modified_by = req.user.id_employee;
        }
  
        const result = await this.giftIssuesUseCase.editGiftIssue(id, data);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(201).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async deleteGiftIssue(req, res) {
      const { id } = req.params;
      try {
        if (!id) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.giftIssuesUseCase.deleteGiftIssue(id);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async getGiftIssueById(req, res) {
      const { id } = req.params;
      try {
        if (!id) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.giftIssuesUseCase.getGiftIssueById(id);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async getGiftIssuesByBranch(req, res) {
      const { branchId } = req.params;
      try {
        if (!branchId) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.giftIssuesUseCase.getGiftIssuesByBranch(branchId);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async changeIssueActiveStatus(req, res) {
      const { id } = req.params;
      try {
        if (!id) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.giftIssuesUseCase.changeIssueActiveStatus(id);
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  
    async giftIssuesDataTable(req, res) {
      try {
        const { page, limit, search} = req.body;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
  
        if (!pageNumber || isNaN(pageNumber) || pageNumber <= 0) {
          return res.status(400).json({ message: "Invalid page number" });
        }
        if (!limitNumber || isNaN(limitNumber) || limitNumber <= 0) {
          return res.status(400).json({ message: "Invalid limit number" });
        }
  
        // const filters = {};
        // if (from_date || to_date) {
        //   const fromDate = from_date ? new Date(from_date) : null;
        //   const toDate = to_date ? new Date(to_date) : null;
        //   if ((from_date && isNaN(fromDate)) || (to_date && isNaN(toDate))) {
        //     return res.status(400).json({ message: "Invalid date format" });
        //   }
        //   filters.updatetime = {};
        //   if (fromDate) filters.updatetime.$gte = fromDate;
        //   if (toDate) filters.updatetime.$lte = toDate;
        // }
        // if (gift_vendorid) filters.gift_vendorid = gift_vendorid;
        // if (isValidObjectId(id_branch)) {
        //   filters.id_branch = id_branch;
        // }


        // if (search) filters.$or = [{ invoice_no: { $regex: search, $options: "i" } }];
  
        const result = await this.giftIssuesUseCase.giftIssuesDataTable({ page: pageNumber, limit: limitNumber,search:search });
        return res.status(200).json({ message: result.message, data: result.data.data, totalDocument: result.totalCount, totalPages: result.totalPages, currentPage: result.currentPage });
      } catch (error) {
        console.error("Error in giftIssuesDataTable controller:", error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    async getAllActiveIssues(req, res) {
        try {
          const result = await this.giftIssuesUseCase.getAllActiveIssues();
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async searchBarcode(req, res) {
        const branchId = req.params.id; 
        const {search} = req.body; 
        try {
          if (!search || search === '') {
            return res.status(400).json({ message: "GiftCode number requierd" });
          }

          if(!branchId){
            return res.status(400).json({message:"Branch id is required"})
          }
    
          const result = await this.giftIssuesUseCase.searchBarcode(branchId,search);
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async giftAccounntCount(req, res) {
        const {branchId} = req.params; 
        try {
          if(!branchId){
            return res.status(400).json({message:"Branch id is required"})
          }
    
          const result = await this.giftIssuesUseCase.giftAccountCount(branchId);

          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      // async getCardsData(req, res) {
      //   try {
      //     const { from_date, to_date ,gift_vendorid, id_branch } = req.body;
        
      //     const filters = {};
      //     if (from_date || to_date) {
      //       const fromDate = from_date ? new Date(from_date) : null;
      //       const toDate = to_date ? new Date(to_date) : null;
      //       if ((from_date && isNaN(fromDate)) || (to_date && isNaN(toDate))) {
      //         return res.status(400).json({ message: "Invalid date format" });
      //       }

      //       filters.createdAt = {};
      //       if (fromDate) filters.createdAt.$gte = fromDate;
      //       if (toDate) filters.createdAt.$lte = toDate;
      //     }
      //     if (gift_vendorid) filters.gift_vendorid = gift_vendorid;
      //     if (isValidObjectId(id_branch)) filters.id_branch = id_branch;
          
      //     const result = await this.giftIssuesUseCase.getCardsData({ filters });

      //     if(!result.success){
      //       return res.status(400).json({message:result.message})
      //     }

      //     return res.status(200).json({ message: result.message, data: result.data});
      //   } catch (error) {
      //     console.error("Error in giftIssuesDataTable controller:", error);
      //     return res.status(500).json({ message: "Internal server error" });
      //   }
      // }


      async getCardsData(req, res) {
        try {
          const {gift_vendorid, id_branch } = req.body;
         
          const filters = {};
         
          if (gift_vendorid) filters.gift_vendorid = gift_vendorid;
          if (isValidObjectId(id_branch)) filters.id_branch = id_branch;
          
          const result = await this.giftIssuesUseCase.getCardsData({ filters });

          if(!result.success){
            return res.status(400).json({message:result.message})
          }

          return res.status(200).json({ message: result.message, data: result.data});
        } catch (error) {
          console.error("Error in giftIssuesDataTable controller:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
       
    async giftIssueDataByschemeaccId(req, res) {

      try {
    
        const { value } = req.params;
        const { page, limit, search } = req.body;
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10; 
  
        // if (!pageNumber || isNaN(pageNumber) || pageNumber <= 0) {
        //   return res.status(400).json({ message: "Invalid page number" });
        // }
        // if (!limitNumber || isNaN(limitNumber) || limitNumber <= 0) {
        //   return res.status(400).json({ message: "Invalid limit number" });
        // }


        if (!value) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.giftIssuesUseCase.giftIssueDataByschemeaccId({ page: pageNumber, limit: limitNumber,search:search,value:value });
        
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data.data,giftsList:result.giftsList, totalDocument: result.totalCount, totalPages: result.totalPages, currentPage: result.currentPage });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  }
  
  export default GiftIssuesController;  