

class faqController {
    constructor(faqUseCase) {
       
        this.faqUseCase = faqUseCase;
    }

    async createfaq(req, res) {
        try {
            const value = req.body;
            const token = req.user;
    
            if (!value) {
                return res.status(400).json({ message: "FAQ data is required" });
            }
    
            // if (!token || token.id_role.id_role !== 1) {
            //     return res.status(403).json({ message: "Unauthorized" });
            // }
    
            req.body.createdBy = token.id_role._id;
            const data = req.body;
    
            // const existingFaq = await this.faqUseCase.findFaqByOrder(data.order);

            // if (existingFaq) {
            //     return res.status(400).json({ message: "Order must be unique" });
            // }
    
            const result = await this.faqUseCase.createfaq(data, token);
    
            return res.status(result.success ? 201 : 400).json({ message: result.message });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
    

    async getfaqByUser(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "faq ID required" });
            }

            const result = await this.faqUseCase.getfaqByUser(id);

            return res.status(result.success ? 200 : 400).json({ message: result.message, data: result.data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    
    async getAllfaq(req,res){
        try{

          const result = await this.faqUseCase.getAllfaq(req.body);
    
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
            console.error("Error in getAllfaq Controller:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
      }

    async updatefaq(req, res) {
        try {
            const { id } = req.params;
            const values = req.body;

            if (!id) {
                return res.status(400).json({ message: "ID required" });
            }

            if (!values) {
                return res.status(400).json({ message: "faq is required" });
            }

            req.body.updatedBy = req.user.id_role._id;
            const data = req.body;

            const result = await this.faqUseCase.updatefaq(id, data);

            return res.status(result.success ? 200 : 400).json({ message: result.message, data: result.data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async deletefaq(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "faq ID is required" });
            }

            const result = await this.faqUseCase.deletefaq(id);

            return res.status(result.success ? 200 : 400).json({ message: result.message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default faqController;
