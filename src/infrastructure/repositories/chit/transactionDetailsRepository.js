import transactionDetailsModel from "../../models/chit/transactionDetailsModel.js";

class TransactionDetailsRepository{
    async addTransactionDetails(data){
        try {
            const savedData = transactionDetailsModel.create(data)

            if(!savedData){
                return null
            }

            return savedData;
        } catch (error) {
            console.error(error)
        }
    }

}

export default TransactionDetailsRepository;