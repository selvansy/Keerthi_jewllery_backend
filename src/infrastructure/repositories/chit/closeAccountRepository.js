import closeAccModel from '../../models/chit/closeAccBillModel.js'

class ClosAccRepository{
    async revertAccount(id) {
        try {
            const updatedData = await closeAccModel.findByIdAndUpdate(
                id,
                { $set: { active: 0 } },
                { new: true, useFindAndModify: false } 
            );
    
            return updatedData;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    

    async revertById(id){
        try {
            const deletedData = await closeAccModel.updateOne({_id:id},{$set:{active:0}})

            if(deletedData.modifiedCount === 0){
                return false;
            }

            return true
        } catch (error) {
            console.error(error)
        }
    }

    async addCloseAccount(data){
        try {
            const newData = await closeAccModel.create(data)

            if(!newData){
                return false;
            }

            return true;
        } catch (error) {
            console.error(error)
        }
    }

    //helper function schameAccount
    async getCloseaccount(id){
        try {
            const newData = await closeAccModel.findOne({ id_scheme_account:id,active:1})
            .sort({ closebill_id: -1 })
            .limit(1)
            .exec();

            if(!newData){
                return false;
            }

            return newData;
        } catch (error) {
            console.error(error)
        }
    }

    async getRevertedDetails(id) {
        try {
            const newData = await closeAccModel
                .findOne({ id_scheme_account: id, status: { $in: [3, 4, 1] } })
                .sort({ closebill_id: -1 }) 
                .lean();
    
            return newData || false;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    

}

export default ClosAccRepository;