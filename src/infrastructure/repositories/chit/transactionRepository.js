import transactionModel from "../../models/chit/transactionModel.js";

class TransactionRepository{
    async addTransaction(data){
        try {
            const savedTransaction = transactionModel.create(data);

            if(!savedTransaction){
                return null
            }

            return savedTransaction;
        } catch (error) {
            console.error(error)
        }
    }
}

export default TransactionRepository;