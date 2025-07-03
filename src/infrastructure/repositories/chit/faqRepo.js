import faqModel from "../../models/chit/faqModel.js";

export default class faqRepo { 

  async createfaq(data) {
    try {
      const faq = new faqModel(data);
      return await faq.save();
    } catch (error) {
      throw new Error(`Error creating faq: ${error.message}`);
    }
  }

   async getfaqByUser(id) {
      try {
        const exists = await faqModel.findOne({createdBy:id});
  
        if (!exists) {
          return null;
        }
  
        return exists;
      } catch (error) {
        console.error(error);
      }
    }

    async getfaqById(id) {
      try {
        const exists = await faqModel.findById(id);
  
        if (!exists) {
          return null;
        }
  
        return exists;
      } catch (error) {
        console.error(error);
      }
    }

      async getAllfaq({ query, documentskip = 0, documentlimit }) {
          try {
          
              const totalCount = await faqModel.countDocuments(query);
              const data = await faqModel
                  .find(query)
                  .skip(documentskip)
                  .limit(documentlimit)
                  .sort({ createdAt: -1 })
              
              if (!data || data.length === 0) return null;
  
              return { data, totalCount };
          } catch (error) {
            throw new Error(`Error fetching all faq: ${error.message}`);
          }
      }


 

  async updatefaq(id, data) {
    try {
      const updatedfaq = await faqModel.findByIdAndUpdate(id, data, { new: true });
      
      if (!updatedfaq) {
        throw new Error("faq not found");
      }
      return { success: true, message: "faq updated successfully", data: updatedfaq };
    } catch (error) {
      throw new Error(`Error updating faq: ${error.message}`);
    }
  }

  async deletefaq(id) {
    try {
      
        const existingfaq = await faqModel.findById(id);
        
        if (!existingfaq) {
            return { success: false, message: "faq not found" };
        }

        const deletedfaq = await faqModel.findByIdAndUpdate(
            id,
            { $set: { active: false } },
            { new: true }
        );

        if (existingfaq.active === true) {
          return { success: true, message: "faq deleted successfully", data: deletedfaq };
        }

        return { success: false, message: "faq already deleted"};
        
    } catch (error) {
        throw new Error(`Error deleting faq: ${error.message}`);
    }
}


}


