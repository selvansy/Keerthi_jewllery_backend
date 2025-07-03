import customerRewardModel from "../../models/chit/customerRewardModel.js";

class CustomerRewardRepository{
    async findOne(id){
        try {
            const existingReward = await customerRewardModel.findOne({
                active: true,
                id_scheme_account:id
              }).sort({ id_reward: -1 });

              if(!existingReward){
                return 
              }
        } catch (error) {
            console.error(error)
        }
    }

    async addReward(data){
        try {
            const addedData = await customerRewardModel.create(data);

            if(!addedData){
                return null;
            }

            return addedData;
        } catch (error) {
            console.error(error)
        }
    }
}

export default CustomerRewardRepository;