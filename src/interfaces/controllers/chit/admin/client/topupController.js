import { isValidObjectId } from "mongoose";


class topupController {
     
    constructor(topupUsecase) {
        this.topupUsecase = topupUsecase;
    }

    async addTopupHistory(req, res) {
        try {
            const data = req.body;
            const token = req.user;

            const result = await this.topupUsecase.createTopup(data, token);

            if (!result.success) {
                return res.status(400).json({ success: false, message: result.message, error: result.error });
            }
    
            return res.status(200).json({ success: true, message: result.message, data: result.data });
    
        } catch (error) {
            console.error("Error in addTopupHistory:", error);
            return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
        }
    }
    

    async UpdateTopup(req, res) {
        try {

            const { id }= req.params;
            
            if (!id) {
                return res.status(400).json({ success: false, message: "id is required" });
            }
       
            const result = await this.topupUsecase.UpdateTopup(req.body,id,req.user);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            console.error("Error in saveOrUpdateConfig:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getTopupByClientId(req, res) {
        try {

            const id = req.user.id_client;
            
      
            if (!id) {
                return res.status(400).json({ success: false, message: "id is required" });
            }
    
            const result = await this.topupUsecase.getTopupByClientId(id);
           
        
            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message, data: null });
            }
    
            return res.status(200).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            console.error("Error in getConfigByUser:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
   

    async getAllTopup(req,res){
        try{   
        
          const { page = 1, limit = 10, search = "", from_date, to_date } = req.body;

          const pageNumber = parseInt(page, 10);
          const limitNumber = parseInt(limit, 10);

          if (isNaN(pageNumber) || pageNumber <= 0) {
              return res.status(400).json({ success: false, message: "Invalid page number" });
          }
          if (isNaN(limitNumber) || limitNumber <= 0) {
              return res.status(400).json({ success: false, message: "Invalid limit number" });
          }
          
          const result = await this.topupUsecase.getAllTopup(req.body);
          
          if (result.success) {
            return res
              .status(200)
              .json({  message: result.message,
                data: result.data,
                totalDocument: result.totalDocument,
                totalPages: result.totalPages,
                currentPage: result.currentPage,});
          }
          return res.status(400).json({message:result.message})
        }catch(error){
            console.error("Error in getAllTopup Controller:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
      }


      
    async getTopupByStatus(req,res){
        try{

          const result = await this.topupUsecase.getTopupByStatus(req.body);
          
          if (result.success) {
            return res
              .status(200)
              .json({  message: result.message,
                data: result.data,
                totalDocument: result.totalDocument,
                totalPages: result.totalPages,
                currentPage: result.currentPage,});
          }
          return res.status(400).json({message:result.message})
        }catch(error){
            console.error("Error in getByStatusTopup Controller:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
      }
    

    
    async deleteConfig(req, res) {
        try {
            const { id } = req.params;

            if (!isValidObjectId(id)) {
                return res.status(400).json({ success: false, message: "Invalid configuration ID" });
            }

            const result = await this.topupUsecase.deleteConfig(id);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            console.error("Error in deleteConfig:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }
}

export default topupController;
