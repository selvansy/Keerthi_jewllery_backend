import newArrivalsModel from "../../models/chit/newArrivalsModel.js";
import mongoose, { isValidObjectId } from "mongoose";

class NewArrivalRepository {
  async addNewArrivals(arrivalsData) {
    try {
      const createBranch = new newArrivalsModel(arrivalsData);
      return await createBranch.save();
    } catch (err) {
      console.error(err);
      throw new Error("Database error occured while adding new arrivals");
    }
  }

  async findByTitle(title,id_branch, id = null) {
    try {
      const filter = {
        title:title,
        is_deleted: false,
        id_branch:id_branch
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const newArrivalData = await newArrivalsModel.findOne(filter);

      if (!newArrivalData) return null;

      return {
        title: newArrivalData.title,
        _id: newArrivalData._id,
        id_branch:newArrivalData.id_branch
      };
    } catch (err) {
      throw new Error(
        "Database error occurred while finding new arrivals by name"
      );
    }
  }

  async findById(id) {
    try {
      const userData = await newArrivalsModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id),is_deleted:false},
        },
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "s3Details",
          },
        },
        { $unwind: "$s3Details" },
        {
          $project: {
            _id: 1,
            title:1,
            id_branch:1,
            id_product:1,
            description:1,
            images_Url:1,
            start_date:1,
            end_date:1,
            active:1,
            pathurl: {
              $concat: [
                  "$s3Details.s3display_url",
                  "keerthijewellery/webadmin/assets/newarrivals/"
              ]
          }
          },
        },
        {
          $limit: 1,
        },
      ]);
      if (!userData || userData.length === 0) {
        return null;
      }
      
      return userData[0];
    } catch (err) {
      throw new Error(
        "Database error occurred while finding new arrivals by id"
      );
    }
  }

  async findByBranchId(id) {
    try {
      return await newArrivalsModel.find({ id_branch: id, is_deleted: false });
    } catch (err) {
      throw new Error(
        "Database error occurred while finding new arrivals by branch id"
      );
    }
  }

  async editNewArrivals(id, newArrivalData) {
    try {
      const updateNewArrivals = await newArrivalsModel.updateOne(
        { _id: id },
        { $set: newArrivalData }
      );
      if (updateNewArrivals.modifiedCount == 1) {
        return updateNewArrivals;
      } else {
        return null;
      }
    } catch (err) {
      console.error(err)
      throw new Error("Database error occurred while editing new arrivals");
    }
  }

  async deleteNewArrivals(id) {
    try {
      const deleteNewArrivals = await newArrivalsModel.updateOne(
        { _id: id },
        { $set: { is_deleted: true } }
      );

      if (deleteNewArrivals.modifiedCount == 1) {
        return true;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while deleting new arrivals");
    }
  }

  async changeStatus(id,status) {
    try {
      const changeStatus = await newArrivalsModel.updateOne(
        { _id: id },
        { $set: { active: !status } }
      );

      if (changeStatus.modifiedCount == 1) {
        return true;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while changing status new arrivals");
    }
  }

  async getNewArrivals(filter, skip, limit, customerId) {
    try {
      const isValidCustomerId = customerId && mongoose.Types.ObjectId.isValid(customerId);
      const currentDate = new Date();
  
      return await newArrivalsModel.aggregate([
        { $match: filter },
        ...(isValidCustomerId
          ? [{ $match: { end_date: { $gt: currentDate } } }]
          : []
        ),
        { $sort: { createdAt: -1 } },
  
        {
          $lookup: {
            from: "products",
            localField: "id_product",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "s3Details"
          }
        },
        { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
  
        ...(isValidCustomerId
          ? [
              {
                $lookup: {
                  from: "wishlists",
                  let: { productId: "$productDetails._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$itemId", "$$productId"] },
                            { $eq: ["$id_customer", new mongoose.Types.ObjectId(customerId)] }
                          ]
                        }
                      }
                    }
                  ],
                  as: "wishlistMatch"
                }
              },
              {
                $addFields: {
                  isWishlisted: { $gt: [{ $size: "$wishlistMatch" }, 0] }
                }
              }
            ]
          : [
              { $addFields: { isWishlisted: false } }
            ]
        ),
  
        {
          $project: {
            id_product: "$productDetails._id",
            product_name: "$productDetails.product_name",
            images_Url: "$productDetails.product_image",
            start_date: 1,
            end_date: 1,
            createdAt: 1,
            active: 1,
            isWishlisted: 1,
            pathurl: {
              $concat: [
                "$s3Details.s3display_url",
                "keerthijewellery/webadmin/assets/products/"
              ]
            }
          }
        },
  
        { $skip: skip },
        { $limit: limit }
      ]);
    } catch (err) {
      throw new Error("Database error occurred while getting new arrivals");
    }
  }
  
  
      async countNewArrivals(filter) {
        return await newArrivalsModel.countDocuments(filter);
      }

      //helper repo to add total whatsapp message sent count
  async updateCount(id,count){
    try {
      const countUpdate = await newArrivalsModel.updateOne(
        {_id:id},
        {$set:{whatsapp_sent:count}}
      )

      if(countUpdate.modifiedCount > 0){
        return countUpdate
      }

      return null
    } catch (error) {
      console.error(error)
    }
  }
}

export default NewArrivalRepository;
