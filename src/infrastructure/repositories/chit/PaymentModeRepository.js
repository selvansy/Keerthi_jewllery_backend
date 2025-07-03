import paymentModeModel from "../../models/chit/paymentModeModel.js";

class PaymentModeRepository{
    async findByName(name) {
        try {
            const Data = await paymentModeModel.findOne({
                mode_name: { $regex: new RegExp(name, 'i') },
            }).lean();

            if (!Data) return null;

            return {
                mode_name: Data.mode_name,
                _id: Data._id,
            };
        } catch (error) {
            console.error("Error in findByName:", error);
            throw new Error("Database error occurred while finding payment mode by name.");
        }
    }

    async find(query) {
        try {
            const Data = await paymentModeModel.find(query)
            .select('_id id_mode mode_name payment_method_type active')
            .sort({mode_name:1})
            .lean();

            if (!Data) return null;

            return Data;
        } catch (error) {
            console.error("Error in findByName:", error);
            throw new Error("Database error occurred while finding payment mode by name.");
        }
    }

    async findById(id){
        try {
            const data= await paymentModeModel.findById(id).lean().select('mode_name _id id_project active is_deleted payment_method_type')

            if(!data){
                return null;
            }
            
            return data;
        } catch (error) {
            console.error("Error in findById:",error)
            throw new Error("Database error occured while finding payment mode by id")
        }
    }

    async addPaymentMode(data){
        try {
            const savedData= await paymentModeModel.create(data);

            if(savedData){
                return savedData;
            }

            return null;
        } catch (error) {
            console.error("Error while adding payment mode:",error);
            throw new Error("Database error occured while saving payment mode")
        }
    }

   async editPaymentMode(id,data){
        try {
            const updatedData= await paymentModeModel.findByIdAndUpdate(
                {_id:id},
                {$set:data},
                {new:true}
            );

            if(!updatedData){
                return null;
            }

            return updatedData;
        } catch (error) {
            console.error("Error while updating payment mode: ",error);
            throw new Error("Database error occured while updating payment mode")
        }
    }

    async deletePaymentMode(id){
        try {
            const deletedData= await paymentModeModel.findByIdAndUpdate(
                {_id:id},
                {$set:{is_deleted:true,active:false}},
                {new:true}
            );
            if(deletedData){
                return deletedData;
            }

            return null;
        } catch (error) {
            console.error("Error while deleting payment mode: ",error);
            throw new Error("Database error occured while deleting payment mode")
        }
    }

    async changeModeActiveStatus(id,active){
        try {
            const deletedData= await paymentModeModel.findByIdAndUpdate(
                {_id:id},
                {$set:{active:!active}},
                {new:true}
            );
            if(deletedData){
                return deletedData;
            }

            return null;
        } catch (error) {
            console.error("Error while deleting payment mode: ",error);
            throw new Error("Database error occured while changing payment mode status")
        }
    }

    async paymentModeTable({ query, documentskip, documentlimit }) {
        try {
            const totalCount = await paymentModeModel.countDocuments(query);
            const data = await paymentModeModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .select('mode_name _id active id_project payment_method_type');

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in getAllMetals:", error);
            throw new Error("Database error occurred while fetching data");
        }
    }
}

export default PaymentModeRepository;