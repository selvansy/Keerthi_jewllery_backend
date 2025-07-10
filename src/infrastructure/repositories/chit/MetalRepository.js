import metalModel from '../../models/chit/metalModel.js';

class MetalRepository {
    async findByName(name) {
        try {
            const metalData = await metalModel.findOne({
                metal_name: { $regex: new RegExp(`^${name}$`, 'i') },
                is_deleted: false
              });
              

            if (!metalData) return null;

            return {
                metal_name: metalData.metal_name,
                _id: metalData._id,
            };
        } catch (error) {
            console.error("Error in findByName:", error);
            throw new Error("Database error occurred while finding metal by name.");
        }
    }

    async findById(id) {
        try {
            const existingData = await metalModel.findById(id);
            if (!existingData) return null;

            return {
                metal_name: existingData.metal_name,
                _id: existingData._id,
                id_metal: existingData.id_metal,
                active: existingData.active,
            };
        } catch (error) {
            console.error("Error in findById:", error);
            throw new Error("Database error occurred while finding metal by ID.");
        }
    }

    async addMetal(data) {
        try {
            return await metalModel.create(data);
        } catch (error) {
            console.error("Error in addMetal:", error);
            throw new Error("Database error occurred while adding metal.");
        }
    }

    async editMetal(id, data) {
        try {
            return await metalModel.updateOne(
                { _id: id },
                { $set: data }
            );
        } catch (error) {
            console.error("Error in editMetal:", error);
            throw new Error("Database error occurred while editing metal.");
        }
    }

    async deleteMetal(id) {
        try {
            return await metalModel.findByIdAndUpdate(
                id,
                { is_deleted: true, active: false },
                { new: true }
            );
        } catch (error) {
            console.error("Error in deleteMetal:", error);
            throw new Error("Database error occurred while deleting metal.");
        }
    }

    async toggleMetalActiveState(id, active) {
        try {
            return await metalModel.findOneAndUpdate(
                { _id: id },
                { active: !active },
                { new: true }
            );
        } catch (error) {
            console.error("Error in toggleMetalActiveState:", error);
            throw new Error("Database error occurred while toggling metal active state.");
        }
    }

    async metalTableData({ query, documentskip, documentlimit }) {
        try {
            const aggregationPipeline = [
                { $match: query },
                {
                    $lookup: {
                        from: 'schemes',
                        localField: '_id',
                        foreignField: 'id_metal',
                        as: 'relatedSchemes'
                    }
                },
                {
                    $addFields: {
                        isUsed: { $cond: [{ $gt: [{ $size: '$relatedSchemes' }, 0] }, true, false] }
                    }
                },
                {
                    $project: {
                        metal_name: 1,
                        _id: 1,
                        active: 1,
                        id_metal: 1,
                        isUsed: 1
                    }
                },
                {
                    $facet: {
                        data: [
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ],
                        totalCount: [
                            { $count: 'count' }
                        ]
                    }
                }
            ];
    
            const result = await metalModel.aggregate(aggregationPipeline);
    
            const data = result[0]?.data || [];
            const totalCount = result[0]?.totalCount[0]?.count || 0;
    
            if (data.length === 0) return null;
    
            return { data, totalCount };
    
        } catch (error) {
            console.error("Error in metalTableData:", error);
            throw new Error("Database error occurred while fetching metals.");
        }
    }
    

    async findAll(){
        try {
            const metalData = await metalModel.find({is_deleted:false,active:true});

            if(!metalData){
                return null;
            }

            return metalData
        } catch (error) {
            console.error(error);
            throw new Error("Database error occurred while fetching all metals.");
        }
    }

    async findOne(query){
        try {
            const metalData = await metalModel.find(query);

            if(!metalData){
                return null;
            }

            return metalData
        } catch (error) {
            console.error(error);
            throw new Error("Database error occurred while fetching all metals.");
        }
    }
}

export default MetalRepository;
