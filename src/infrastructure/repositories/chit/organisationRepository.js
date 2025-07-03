import organisationModel from "../../models/chit/organisationModel.js";

class OrganisationRepository{

    async findOne(){
        try {
            const data = await organisationModel.findOne({})
            .lean()

            if(!data){
                return null;
            }

            return data;
        } catch (error) {
            console.error(error)
        }
    }

    async insertOne(data){
        try {
            const newData = await organisationModel.create(data)

            if(!newData){
                return null;
            }

            return newData;
        } catch (error) {
            console.error(error)
        }
    }
    
    async updateOne(id,data){
        try {
            const updatedData = await organisationModel.updateOne(
                {_id:id},
                {$set:data}
            )

            if(updatedData.matchedCount === 0){
                return null;
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }
}

export default OrganisationRepository;