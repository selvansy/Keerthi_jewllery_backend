

class ContentManagementController {
    constructor(ContentUseCase) {
      
        this.ContentUseCase = ContentUseCase;
    }

    async createContent(req, res) {
        try {

            const value = req.body;
            const token = req.user
            if (!value) {
                return res.status(400).json({ message: "Content is required" });
            }

            if (!token || !token.id_role) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            req.body.createdBy = token.id_role._id;
            const data = req.body;

            const result = await this.ContentUseCase.createContent(data, token);

            return res.status(result.success ? 201 : 400).json({ message: result.message });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async getContentById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "Content ID required" });
            }

            const result = await this.ContentUseCase.getContentByUser(id);

            return res.status(result.success ? 200 : 400).json({ message: result.message, data: result.data });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    
    async getAllContent(req,res){
        try{
          const result = await this.ContentUseCase.getAllContent();
    
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
            console.error("Error in getAllContent Controller:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
      }


      async getContentTypes(req,res){
        try{
            const { id } = req.params;
            const mobile = req.query.mobile
        
          const result = await this.ContentUseCase.getContentTypes(id,mobile);
    
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
            console.error("Error in getAllContent Controller:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
      }


    async updateContent(req, res) {
        try {
            const { id } = req.params;
            const values = req.body;

            if (!id) {
                return res.status(400).json({ message: "ID required" });
            }

            if (!values) {
                return res.status(400).json({ message: "Content is required" });
            }

            req.body.updatedBy = req.user.id_role._id;
            const data = req.body;
            const result = await this.ContentUseCase.updateContent(id, data);

            return res.status(result.success ? 200 : 400).json({ message: result.message, data: result.data });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async deleteContent(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ message: "Content ID is required" });
            }

            const result = await this.ContentUseCase.deleteContent(id);

            return res.status(result.success ? 200 : 400).json({ message: result.message });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error", error: error.message });
        }
    }
}

export default ContentManagementController;
