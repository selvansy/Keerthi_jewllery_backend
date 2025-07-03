import TopupHistoryModel from "../../models/chit/topupHistoryModel.js"
import TopupModel from "../../models/chit/topupModel.js"

class TopupRepository { 

    async createTopup(data) {
        try {
            let newTopup = await TopupHistoryModel.create(data);
            return newTopup;
        } catch (error) {
            console.error("Error in createTopup:", error);
            return { success: false, message: "Error saving top-up configuration", error: error.message };
        }
    }

    async UpdateTopup(data,id) {
        try {
            const lastTopup = await TopupModel.findOne({ id_client: data.id_client }).lean();
    
            if (!lastTopup) {
                throw new Error("No previous top-up data found for the client");
            }
    
            let availableCredit = 0;
            if (data.SMS) {
                availableCredit = Number(lastTopup.SMS || 0);
            } else if (data.WhatsApp) { 
                availableCredit = Number(lastTopup.WhatsApp || 0);
            } else if (data.Email) {
                availableCredit = Number(lastTopup.Email || 0);
            }
    
            const limitReq = Number(data.limitRequest) || 0;
    
        
            const updatedData = {
                SMS: data.SMS ? availableCredit + limitReq : Number(lastTopup.SMS || 0),
                WhatsApp: data.WhatsApp ? availableCredit + limitReq : Number(lastTopup.WhatsApp || 0),
                Email: data.Email ? availableCredit + limitReq : Number(lastTopup.Email || 0),
            };
    
            if ((data.status === 1 || data.status === "1") && !lastTopup) {
                const newTopup = await TopupModel.create({
                    ...data,
                    ...updatedData,
                });
                return newTopup;
            }
    
            const updatedTopupData = await TopupModel.findOneAndUpdate(
                { id_client: data.id_client },
                { $set: updatedData },
                { new: true}
            );
    
            if (!updatedTopupData) {
                return {message:"Failed to update top-up data"};
            }

            const updateHistory = {
                actualAmount: availableCredit + Number(data.limitRequest || 0),  
                status: 1
            };
    
            await TopupHistoryModel.updateOne(
                {_id:id },
                { $set: updateHistory }
            );
            

            return updatedTopupData;
        } catch (error) {
            console.error("Error in UpdateTopup:", error);
            throw new Error("Error saving top-up configuration: " + error.message);
        }
    }
     

    async getTopupByClientId(id) {
        return await TopupModel.findOne({ id_client: id });
    }

    async getAllTopupBalance() {
        return await TopupModel.findOne({active:true});
    }


    async getTopupByStatus({ query, documentskip = 0, documentlimit }) {
        try {

            const totalCount = await TopupHistoryModel.countDocuments(query);
            const data = await TopupHistoryModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .sort({ createdAt: -1 })

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in topup:", error);
            throw new Error("Error fetching all top-up configurations");
        }
    }

    async getAllTopup({ query, documentskip = 0, documentlimit }) {
        try {

            const totalCount = await TopupHistoryModel.countDocuments(query);
            const data = await TopupHistoryModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .sort({ createdAt: -1 })

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in getAllTopup Repository:", error);
            throw new Error("Error fetching all top-up configurations");
        }
    }


    async deleteTopup(id) {
        try {
            const data = await TopupHistoryModel.updateOne(
                { _id: id },
                { $set: { is_deleted: true, active: fasle } }
            );

            if (data.modifiedCount === 0) {
                return null;
            }

            return data;
        } catch (error) {
            console.error(error)
        }
    }

    async updateSmsCount(count) {
        try {
          return await TopupHistoryModel.updateOne(
            {},
            { $inc: { SMS: -count } }
          );
        } catch (error) {
          console.error("Error updating SMS count:", error);
          return null;
        }
      }

      async decrementField(query, fieldName, decrementBy) {
        try {
          if (!query || Object.keys(query).length === 0) {
            console.warn("decrementField: Empty query used — ensure only one document exists.");
          }
      
          const update = {
            $inc: {
              [fieldName]: -Math.abs(decrementBy),
            },
          };
      
          const data = await TopupModel.updateOne(query, update);
      
          if (data.modifiedCount === 0) {
            return null;
          }
      
          return data;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }     
}

export default TopupRepository;