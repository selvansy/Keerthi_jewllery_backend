import weddingModel from '../../models/chit/weddingBrithSettingsModel.js'

class WeddigRepository{
    async findById (id){
        try {
            const pipeline = [
                {$match:{_id:id}},
                {
                    $lookup: {
                        from: "s3bucketsettings", 
                        localField: "id_branch",
                        foreignField: "id_branch", 
                        as: "bucketSettings" 
                    }
                },

                { $unwind: "$bucketSettings" },
                {
                    $project: {
                        desc:1,
                        _id: 1,
                        id_branch: 1,
                        active: 1,
                        type: 1,
                        image: 1,
                        pathurl: {
                            $concat: [
                                "$bucketSettings.s3display_url",
                                "webadmin/assets/img/wedding/"
                            ]
                        }
                    }
                }
            ];
            return await weddingModel.aggregate(pipeline);
        } catch (error) {
            console.error(error)
        }
    }

    async addWedding(data){
        try {
            const newData = await weddingModel.create(data)

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
            const updatedData = await weddingModel.updateOne(
                {_id:id},
                {$set:data},
                {new:true}
            )

            if(updatedData.modifiedCount === 0){
                return null;
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }

    async dataTable(){
        try {
            const newData = await weddingModel.aggregate([
                {
                    $lookup: {
                        from: "s3bucketsettings",
                        localField: "id_branch", 
                        foreignField: "id_branch",
                        as: "bucketSettings" 
                    }
                },
                { $unwind: "$bucketSettings" },
                {
                    $project:{
                        desciption:1,
                        title:1,
                        image:1,
                        id_branch:1,
                        type:1,
                        pathurl: {
                            $concat: [
                                "$bucketSettings.s3display_url",
                                "webadmin/assets/img/wedding/"
                            ]
                        }

                    }
                }
            ]);

            if(newData.length === 0){
                return null;
            }

            return newData;
        } catch (error) {
            console.error(error)
        }
    }

    async getByType(id) {
        try {
            const numericId = Number(id);

            const updatedData = await weddingModel.aggregate([
                {
                    $match: { type: numericId },
                },
                {
                    $lookup: {
                        from: "s3bucketsettings",
                        localField: "id_branch", 
                        foreignField: "id_branch", 
                        as: "s3details", 
                    },
                },
                {
                    $unwind: { 
                        path: "$s3details", 
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        description: 1,
                        image: 1,
                        id_branch: 1,
                        type: 1,
                        pathurl: {
                            $concat: [
                                "$s3details.s3display_url",
                                "webadmin/assets/img/wedding/"
                            ]
                        },
                    },
                },
            ]);
    
            if (updatedData.length === 0) {
                return null;
            }
    
            return updatedData[0];
        } catch (error) {
            console.error("Error in getByType:", error);
            throw error; 
        }
    }
    
}

export default WeddigRepository;