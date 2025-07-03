import campaignTypeModel from "../../models/chit/campaignTypeModel.js";

class CampaignTypeRepository{
    async findByName(name) {
        const campaignTypeData = await campaignTypeModel.findOne({
            name: { $regex: new RegExp(name, 'i') }});
        if (!campaignTypeData) return null;
        return {
            name: campaignTypeData.name,
            _id:campaignTypeData._id
        };
    }

    async findAll() {
        const campaignTypeData = await campaignTypeModel.find({active:true});
        if (!campaignTypeData) return null;
        return campaignTypeData
    }

    async findById(id){
        const Data= await campaignTypeModel.findById(id);

        if(!Data) return null;

        return Data;
    }

    async addCampaignType (data){
        const savedData = await campaignTypeModel.create(data);
        if (!savedData) return null;

        return {
            name: savedData.name
        };
    }

    async editCampaignType(id,data){
        const updatedData = await campaignTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: data },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async toggleCapaignTypeStatus(id,active){
        const updatedData = await campaignTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:!active} },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async getAllActiveCampaignTypes({ query, documentskip, documentlimit }) {
        try {
            const totalCount = await campaignTypeModel.countDocuments(query);
            const data = await campaignTypeModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                // .select('name _id  active ')
                

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in getAll campaign type:", error);
            throw new Error("Database error occurred while fetching all metals.");
        }
    }

    async deleteCampaignType(id){
        const updatedData = await campaignTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:false} },
            { new: true } 
        );

        if(!updatedData){
            return null
        }

        return updatedData;
    }

    async changeModeActiveStatus(id,active){
        try {
            const updatedData = await campaignTypeModel.updateOne(
                {_id:id},
                {$set:{active:!active}},
                {new:true}
            );

            if(updatedData.matchedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }
}

export default CampaignTypeRepository;