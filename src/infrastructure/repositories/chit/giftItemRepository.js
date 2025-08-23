import giftItemModel from '../../models/chit/giftItemModel.js';
import mongoose from 'mongoose';
 
class GiftItemRepository{ 
   async addGiftItem(data){
    try {
        const savedData= await giftItemModel.create(data);

        if(!savedData){
            return null;
        }

        return savedData;
    } catch (error) {
        console.error("Error in addGiftItem:", error);
        throw new Error("Database error occurred while adding gift");
    }
   }

   async findById(id) {
    try {
        const objectId = new mongoose.Types.ObjectId(id);

        const aggregationPipeline = [
            { 
                $match: { _id: objectId }
            },
            { 
                $lookup: {
                    from: 'giftvendors', 
                    localField: 'gift_vendorid',
                    foreignField: '_id',
                    as: 'vendor_data'
                }
            },
            { 
                $lookup: {
                    from: 'branches', 
                    localField: 'id_branch',
                    foreignField: '_id',
                    as: 'branch_data'
                }
            },
            // { 
            //     $lookup: {
            //         from: 's3bucketsettings', 
            //         localField: 'id_branch',
            //         foreignField: 'id_branch',
            //         as: 's3data'
            //     }
            // },
            { 
                $project: {
                    gift_name: 1,
                    _id: 1, 
                    active: 1, 
                    id_branch: 1,
                    gift_code:1,
                    gift_vendorid:{ $arrayElemAt: ['$vendor_data._id', 0] },
                    branch_name: { $arrayElemAt: ['$branch_data._id', 0] },
                    // pathurl: {
                    //     $concat: [
                    //         { $arrayElemAt: ['$s3data.s3display_url', 0] },
                    //         'keerthijewellery/webadmin/assets/giftItem/'
                    //     ]
                    // }
                }
            }
        ];

        const giftItem = await giftItemModel.aggregate(aggregationPipeline);

        if (giftItem && giftItem.length > 0) {
            return giftItem[0]; 
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}


   async findByVendorId(id){
    try {
        const giftItem= await giftItemModel.find({gift_vendorid:id,active:true}).lean()
        
        if(giftItem){
            return giftItem;
        }

        return null;
    } catch (error) {
        console.error(error);
    }
   }

   async findByBranchId(id){
    try {
        const giftItem= await giftItemModel.find({id_branch:id}).lean()
        
        if(giftItem){
            return giftItem;
        }

        return null;
    } catch (error) {
        console.error(error);
    }
   }

   async editGiftItem(id,data){
    try {
        const updatedData= await giftItemModel.findByIdAndUpdate(
            {_id:id},
            {$set:data},
            {new:true}
        );

        if(updatedData){
            return updatedData;
        }

        return null;
    } catch (error) {
        console.error(error);
    }
   }

   async deleteGift(id){
    try {
        const updatedData= await giftItemModel.findByIdAndUpdate(
            {_id:id},
            {$set:{is_deleted:true,active:false}},
            {new:true}
        );

        if(updatedData){
            return updatedData;
        }

        return null;
    } catch (error) {
        console.error(error);
    }
   }

   async changeGiftItemActiveState(id,active){
    const updatedData = await giftItemModel.findOneAndUpdate(
        { _id: id }, 
        { $set: { active:!active} },
        { new: true } 
    );

    if(!updatedData) return null;

    return updatedData
}

// async getAllActiveGiftItems({ query, documentskip, documentlimit }) {
//     try {
//         const aggregationPipeline = [
//             { $match: query },
//             { 
//                 $lookup: {
//                     from: 'giftvendors', 
//                     localField: 'gift_vendorid',
//                     foreignField: '_id',
//                     as: 'vendor_data'
//                 }
//             },
//             { 
//                 $lookup: {
//                     from: 'branches', 
//                     localField: 'id_branch',
//                     foreignField: '_id',
//                     as: 'branch_data'
//                 }
//             },
//             // { 
//             //     $lookup: {
//             //         from: 's3bucketsettings', 
//             //         localField: 'id_branch',
//             //         foreignField: 'id_branch',
//             //         as: 's3data'
//             //     }
//             // },
//             { 
//                 $project: {
//                     gift_name: 1,
//                     _id: 1, 
//                     active: 1, 
//                     id_branch: 1,
//                     gift_image:1,
//                     gift_code:1,
//                     createdAt:1,
//                     gift_vendor: { 
//                         vendor_name: { $arrayElemAt: ['$vendor_data.vendor_name', 0] },
//                         vendor_id: { $arrayElemAt: ['$vendor_data._id', 0] }
//                     },
//                     branch_name: { $arrayElemAt: ['$branch_data.branch_name', 0] },
//                     pathurl: {
//                         $concat: [
//                             { $arrayElemAt: ['$s3data.s3display_url', 0] },
//                             'keerthijewellery/webadmin/assets/giftItem/'
//                         ]
//                     }
//                 } 
//             },
//             { $skip: documentskip },
//             { $limit: documentlimit },
//             {$sort:{_id:-1}}
//         ];

//         const data = await giftItemModel.aggregate(aggregationPipeline);

//         const totalCount = await giftItemModel.countDocuments(query);

//         if (!data || data.length === 0) return null;

//         return { data, totalCount };
//     } catch (error) {
//         console.error(error);
//     }
// }


async getAllActiveGiftItems({ query, documentskip, documentlimit }) {
    try {

        const aggregationPipeline = [
            { $match: query },
            { 
                $lookup: {
                    from: 'giftvendors', 
                    localField: 'gift_vendorid',
                    foreignField: '_id',
                    as: 'vendor_data'
                }
            },
            { 
                $lookup: {
                    from: 'branches', 
                    localField: 'id_branch',
                    foreignField: '_id',
                    as: 'branch_data'
                }
            },
            { 
                $project: {
                    gift_name: 1,
                    _id: 1, 
                    active: 1, 
                    id_branch: 1,
                    gift_image:1,
                    gift_code:1,
                    createdAt:1,
                    gift_vendor: { 
                        vendor_name: { $arrayElemAt: ['$vendor_data.vendor_name', 0] },
                        vendor_id: { $arrayElemAt: ['$vendor_data._id', 0] }
                    },
                    branch_name: { $arrayElemAt: ['$branch_data.branch_name', 0] },
                    // pathurl: {
                    //     $concat: [
                    //         { $arrayElemAt: ['$s3data.s3display_url', 0] },
                    //         'keerthijewellery/webadmin/assets/giftItem/'
                    //     ]
                    // }
                } 
            },
            {$sort:{ createdAt: -1 , _id:-1}},
            { $skip: documentskip },
            { $limit: documentlimit }
           
            
        ];

        const data = await giftItemModel.aggregate(aggregationPipeline);

        const totalCount = await giftItemModel.countDocuments(query);

        if (!data || data.length === 0) return null;

        return { data, totalCount };
    } catch (error) {
        console.error(error);
    }
}


  async countGifts(){
    try {
        const count  = await giftItemModel.countDocuments({is_deleted:false,active:true})

        if(!count){
            return null;
        }

        return count;
    } catch (error) {
        console.error(error)
    }
  }


}

export default GiftItemRepository;