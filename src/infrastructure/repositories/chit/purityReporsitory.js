import purityModel from "../../models/chit/purityModel.js";

class PuriytRepository { 
    async findOne(query){
        try {
            const purityData= await purityModel.findOne(query)
            .populate("id_metal")
            .select('purity_name active is_deleted')
            .lean()

            if(!purityData){
                return null;
            }
            return purityData;
        } catch (error) {
            console.error(error);
        }
    }

    async find(query){
        try {
            const purityData = await purityModel.find(query).populate({
                path:'id_metal',
                select:('_id id_metal metal_name active ')
            })

            if(!purityData){
                return null;
            }

            return purityData;
        } catch (error) {
            console.error(error)
        }
    }

    async findByNum(id) {
        try {
            const purityData = await purityModel.find().populate('id_metal');
    
            if (!purityData || purityData.length === 0) {
                return null;
            }
            
            const filteredData = purityData.filter(item => item.id_metal && item.id_metal.id_metal === Number(id));
    
            return filteredData.length > 0 ? filteredData : null;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    

    async findById(id){
        try {
            const purityData= await purityModel.findById(id)
            .populate({
                path:'id_metal',
                select:('_id metal_name active ')
            })
            .select('_id purity_name id_metal active is_deleted display_app')
            .lean()

            if(!purityData){
                return null;
            }

            return purityData;
        } catch (error) {
            console.error(error);
        }
    }

    async addPurity(data){
        try {
            const savedData= await purityModel.create(data);

            if(!savedData){
                return null;
            }
            return savedData;
        } catch (error) {
            console.error(error);
        }
    }

    async updatePurity(id, data) {
        try {
            const updatedData = await purityModel.findOneAndUpdate(
                { _id: id }, 
                { $set: data },
                { new: true }  
            );
    
            if (!updatedData) {
                return null; 
            }
    
            return updatedData; 
        } catch (error) {
            console.error(error);
            throw new Error('Error while updating purity');
        }
    }
    

    async deletePurity(id){
        try {
            const savedData= await purityModel.updateOne(
                {_id:id},
                {$set:{active:false,is_deleted:true}}
            );

            if(savedData.modifiedCount === 0){
                return null;
            }

            return savedData;
        } catch (error) {
            console.error(error);
        }
    }
    async activatePurity(id,currentstate){
        try {
            const savedData= await purityModel.updateOne(
                {_id:id},
                {$set:{active:!currentstate}}
            );

            if(savedData.modifiedCount === 0){
                return null;
            }

            return savedData;
        } catch (error) {
            console.error(error);
        }
    }
    async purityDisplaySettings(id,currentstate){
        try {
            const savedData= await purityModel.updateOne(
                {_id:id},
                {$set:{display_app:!currentstate}}
            );

            if(savedData.modifiedCount === 0){
                return null;
            }

            return savedData;
        } catch (error) {
            console.error(error);
        }
    }

    async puityTable({ query, documentskip, documentlimit }) {
        try {
            const aggregationPipeline = [
                { $match: query },
                {
                    $lookup: {
                        from: 'schemes',
                        localField: '_id',
                        foreignField: 'id_purity',
                        as: 'relatedSchemes'
                    }
                },
                {
                    $lookup: {
                        from: 'metals',
                        localField: 'id_metal',
                        foreignField: '_id',
                        as: 'metalData'
                    }
                },
                {
                    $unwind: {
                        path: "$metalData",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        isUsed: { $cond: [{ $gt: [{ $size: "$relatedSchemes" }, 0] }, true, false] }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        purity_name: 1,
                        active: 1,
                        isUsed: 1,
                        id_metal:"$metalData",
                        metal_name: "$metalData.metal_name"
                    }
                },
                {
                    $facet: {
                        data: [
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ]
                    }
                }
            ];
    
            const result = await purityModel.aggregate(aggregationPipeline);
    
            const data = result[0]?.data || [];
            const totalCount = result[0]?.totalCount[0]?.count || 0;
    
            return { data, totalCount };
        } catch (error) {
            console.error("Error in puityTable:", error);
            throw new Error("Database error occurred while fetching purity data.");
        }
    }
    // async puityTable({ query, documentskip, documentlimit }) {
    //     try {
    //         const totalCount = await purityModel.countDocuments(query);
    //         const data = await purityModel
    //             .find(query)
    //             .skip(documentskip)
    //             .limit(documentlimit)
    //             .populate({path:'id_metal', select:('_id active metal_name')})
    //             .select('purity_name _id active id_purity id_metal display_app');

    //         if (!data || data.length === 0) return null;

    //         return { data, totalCount };
    //     } catch (error) {
    //         console.error("Error in getAllPurity:", error);
    //     }
    // }


    async updateWithMetalNumber(number, data) {
        try {
          const documentsToUpdate = await purityModel.find(
            { metalNumber: number, active: true },
            { _id: 1 }
          );
      
          const ids = documentsToUpdate.map(doc => doc._id);
      
          if (ids.length === 0) {
            return null;
          }
      
          await purityModel.updateMany(
            { _id: { $in: ids } },
            { $set: { id_metal: data } }
          );
      
          return ids;
        } catch (error) {
          console.error(error);
          throw new Error("Error while updating purity");
        }
      }
}

export default PuriytRepository;
