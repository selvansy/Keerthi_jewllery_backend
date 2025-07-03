import contentModel from "../../models/chit/contentModel.js";

export default class ContentRepo {

  async createContent(data) {
    try {
      const content = new contentModel(data);
      return await content.save();
    } catch (error) {
      throw new Error(`Error creating content: ${error.message}`);
    }
  }

   async getContentByUser(id) {
      try {
        const exists = await contentModel.findOne({createdBy:id});
  
        if (!exists) {
          return null;
        }
  
        return exists;
      } catch (error) {
        console.error(error);
      }
    }



    async getContentById(id) {
      try {
        const exists = await contentModel.findById(id);
  
        if (!exists) {
          return null;
        }
  
        return exists;
      } catch (error) {
        console.error(error);
      }
    }

      async getAllContent({ query, documentskip = 0, documentlimit }) {
          try {
          
              const totalCount = await contentModel.countDocuments(query);
              const data = await contentModel
                  .find(query)
                  .skip(documentskip)
                  .limit(documentlimit)
                  .sort({ createdAt: -1 })
              
              if (!data || data.length === 0) return null;
  
              return { data, totalCount };
          } catch (error) {
            throw new Error(`Error fetching all content: ${error.message}`);
          }
      }

      async getContentTypes({ query, documentskip = 0, documentlimit }) {
        try { 
            const totalCount = await contentModel.countDocuments(query);
            const data = await contentModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .sort({ createdAt: -1 })
            
            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
          throw new Error(`Error fetching all content: ${error.message}`);
        }
    }

  async updateContent(id, data) {
    try {
      const updatedContent = await contentModel.findByIdAndUpdate(id, data, { new: true });
      
      if (!updatedContent) {
        throw new Error("Content not found");
      }
      return { success: true, message: "Content updated successfully", data: updatedContent };
    } catch (error) {
      throw new Error(`Error updating content: ${error.message}`);
    }
  }

  async deleteContent(id) {
    try {
      
        const existingContent = await contentModel.findById(id);
        
        if (!existingContent) {
            return { success: false, message: "Content not found" };
        }

        const deletedContent = await contentModel.findByIdAndUpdate(
            id,
            { $set: { active: false } },
            { new: true }
        );

        if (existingContent.active === true) {
          return { success: true, message: "Content deleted successfully", data: deletedContent };
        }

        return { success: false, message: "Content already deleted"};
        
    } catch (error) {
        throw new Error(`Error deleting content: ${error.message}`);
    }
}




}


