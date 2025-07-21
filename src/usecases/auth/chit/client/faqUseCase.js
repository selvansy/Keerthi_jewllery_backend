
import mongoose from "mongoose";

class faqUseCase {

    constructor(faqRepo) { 
        this.faqRepo = faqRepo;
    }

    async createfaq(data, token) {

        if (!token || !token.id_role) {
            return { success: false, message: "Unauthorized: Token is required" };
        }


        data.updatedBy = token.id_role._id;
        if (!data.createdBy) data.createdBy = token.id_role._id;

        const existsData = await this.faqRepo.getfaqById(data._id);

        if (existsData) {
            return { success: false, message: "faq already exists" };
        }

        const savedConfig = await this.faqRepo.createfaq(data);

        if (!savedConfig) {
            return { success: false, message: "Failed to create faq" };
        }

        return { success: true, message: "faq created successfully", data: savedConfig };
    }

    async updatefaq(id, data) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "Not a valid object ID" };
        }

        const existsData = await this.faqRepo.getfaqById(id);


        if (!existsData) {
            return { success: false, message: "No faq found" };
        }

        const savedData = await this.faqRepo.updatefaq(id, data);

        if (!savedData) {
            return { success: false, message: "Failed to update faq" };
        }

        return { success: true, message: "faq updated successfully", data: savedData };
    }

  
    async getAllfaq({ page, limit, search, category, from_date, to_date }) {
        try {
          const pageNum = page ? parseInt(page) : 1;
          const pageSize = limit ? parseInt(limit) : 10;
          const searchTerm = search || "";
      
          
          const searchCriteria = searchTerm
            ? {
                question: { $regex: searchTerm, $options: "i" },
              }
            : {};
      
       
          const categoryFilter =
            category !== undefined ? { category: parseInt(category) } : {};
      
       
          let dateFilter = {};
          if (from_date && to_date) {
            dateFilter = {
              createdAt: {
                $gte: new Date(from_date),
                $lte: new Date(to_date),
              },
            };
          }
      
        
          const query = {
            active: true,
            ...searchCriteria,
            ...categoryFilter,
            ...dateFilter,
          };
      
          const documentskip = (pageNum - 1) * pageSize;
          const documentlimit = pageSize;
      
          const Data = await this.faqRepo.getAllfaq({
            query,
            documentskip,
            documentlimit,
          });
      
          if (!Data || Data.length === 0) {
            return { success: false, message: "No data found" };
          }
      
          return {
            success: true,
            message: "Data fetched successfully",
            data: Data.data,
            totalDocument: Data.totalCount,
            totalPages: Math.ceil(Data.totalCount / pageSize),
            currentPage: pageNum,
          };
        } catch (error) {
          console.error("Error in faq UseCase:", error);
          return { success: false, message: "Error fetching FAQs" };
        }
      }
      


    async getfaqByUser(id) {
       
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, message: "Invalid object ID" };
        }

        const faq = await this.faqRepo.getfaqById(id);

        if (faq) {
            return {
                success: true,
                message: "faq retrieved successfully",
                data: faq,
            };
        }

        return { success: false, message: "No faq found" };
    }

    async deletefaq(id) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return { success: false, message: "Invalid faq ID" };
            }

            const deletedfaq = await this.faqRepo.deletefaq(id);

            if (!deletedfaq) {
                return { success: false, message: "Failed to delete faq" };
            }

            return deletedfaq;
        } catch (error) {
            console.error("Error in deletefaq:", error);
            return { success: false, message: "Error deleting faq" };
        }
    }
    
}

export default faqUseCase;
