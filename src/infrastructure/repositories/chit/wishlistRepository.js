import wishlistModel from "../../models/chit/wishlistModel.js"
import mongoose from "mongoose";

class WishlistRepository{
    async findOne(query){
        try {
            const result = await wishlistModel.findOne(query)

            if(!result){
                return null
            }

            return result;
        } catch (error) {
            console.error(error)
        }
    }

    async find(query){
        try {
            const result = await wishlistModel.find(query)

            if(result.length == 0){
                return null
            }

            return result;
        } catch (error) {
            console.error(error)
        }
    }

    async addToWishlist(data){
        try {
            const result = await wishlistModel.create(data)

            if(!result){
                return null
            }

            return result;
        } catch (error) {
            console.error(error)
        }
    }

    async removedFromWishlist(query){
        try {
            const result = await wishlistModel.deleteOne(query)

            if(!result){
                return null
            }

            return result;
        } catch (error) {
            console.error(error)
        }
    }

    async getWishlist(id_customer) {
        try {
          const result = await wishlistModel.aggregate([
            {
              $match: { id_customer: new mongoose.Types.ObjectId(id_customer) }
            },
            {
              $lookup: {
                from: "products",
                localField: "itemId",
                foreignField: "_id",
                as: "product"
              }
            },
            {
              $unwind: "$product"
            },
            {
              $lookup: {
                from: "s3bucketsettings",
                localField: "id_branch",
                foreignField: "id_branch",
                as: "s3Details"
              }
            },
            { $unwind: "$s3Details" },
            {
              $lookup: {
                from: "metalrates",
                let: {
                  purityId: "$product.id_purity",
                  branchId: "$product.id_branch"
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$purity_id", "$$purityId"] },
                          { $eq: ["$id_branch", "$$branchId"] }
                        ]
                      }
                    }
                  },
                  { $sort: { createdAt: -1 } },
                  { $limit: 1 }
                ],
                as: "purity"
              }
            },
            {
              $unwind: {
                path: "$purity",
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $addFields: {
                "product.purityRate": "$purity.rate",
                "product.metalValue": {
                  $cond: {
                    if: { $and: ["$purity.rate", "$product.weight"] },
                    then: { $multiply: ["$product.weight", "$purity.rate"] },
                    else: null
                  }
                },
                pathUrl: {
                  $concat: ["$s3Details.s3display_url", "keerthijewellery/webadmin/assets/products/"]
                }
              }
            },
            {
              $project: {
                purity: 0
              }
            }
          ]);
      
          return result.length ? result : null;
        } catch (error) {
          console.error("Error in getWishlist (lookup):", error);
        }
      }      
}

export default WishlistRepository;