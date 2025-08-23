import mongoose from "mongoose";
import OffersModel from "../../models/chit/offersModel.js";

class OfferRepository {
  async addOffer(offerData) {
    try {
      const createOffer = new OffersModel(offerData);
      await createOffer.save();

      if (!createOffer) return null;

      return createOffer
    } catch (err) {
      console.error(err)
      throw new Error("Database error occured while adding offer");
    }
  }

  async findById(id) {
    try {
      const userData = await OffersModel.aggregate([
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
            title: 1,
            videoId: 1,
            description: 1,
            active: 1,
            offer_image: 1,
            type: 1,
            whatsapp_sent: 1,
            id_branch:1,
            "branchDetails._id": 1,
            "branchDetails.branch_name": 1,
            "branchDetails.active": 1,
            pathurl: {
              $concat: [
                  "$s3Details.s3display_url",
                  "keerthijewellery/webadmin/assets/offers/"
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
      console.error(err)
      throw new Error("Database error occured while find offer by id");
    }
  }

  async findByName(title, offer_id = null) {
    try {
      const filter = {
        title: title ? title.toLowerCase() : '',
        is_deleted: false,
      };

      if (offer_id) {
        filter._id = { $ne: offer_id };
      }

      const offerData = await OffersModel.findOne(filter);

      if (!offerData) return null;

      return {
        title: offerData.title,
        _id: offerData._id,
      };
    } catch (err) {
      throw new Error("Database error occured while find offer by title");
    }
  }

  async updateOffer(offerData, offer_id) {
    try {
      const updateOffer = await OffersModel.updateOne(
        { _id: offer_id },
        { $set: offerData }
      );
      return updateOffer;
    } catch (err) {
      throw new Error("Database error occured while updating offer");
    }
  }

  async deleteOffer(id) {
    try {
      const deleteOffer = await OffersModel.updateOne(
        { _id: id },
        { $set: { is_deleted: true } }
      );
      return deleteOffer;
    } catch (err) {
      throw new Error("Database error occured while deleting offer");
    }
  }

  async changeStatus(id){
    try{
        const findOffer=await this.findById(id)
        const updateOffer = await OffersModel.updateOne(
            {_id:id},
            { $set: { active: !findOffer.active } },
          );
          
      if(updateOffer.modifiedCount==1){
        return updateOffer
      }else{
        return null
      }

    }catch(err){
      throw new Error("Database error occured while changing offer status");  
    }
  }

  async findByBranchId(id_branch){
    try{
      
      const offerByBranch=await OffersModel.find({id_branch:id_branch,active:true})
      return offerByBranch

    }catch(err){      
      throw new Error("Database error occured while find offer by branch id");  
    }
  }

  async getOffers(filter, skip, limit) {
    try{
      return await OffersModel.aggregate([
        { $match: filter },
        {$sort:{createdAt:-1}},
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: 'branches', 
            localField: 'id_branch',
            foreignField: '_id',
            as: 'id_branch'
          }
        },
        { $unwind: { path: '$id_branch', preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch._id",
            foreignField: "id_branch",
            as: "s3Details",
          },
        },
        { $unwind: { path: '$s3Details', preserveNullAndEmptyArrays: true } },
       
        {$project:{
          type:1,
          offer_image:1,
          createdAt:1,
          active:1,
          title:1,
          pathurl: {
            $concat: [
                "$s3Details.s3display_url",
                "keerthijewellery/webadmin/assets/offers/"
            ]
        }
        }}
      ]);
      
    }catch(err){
      console.error(err)
      throw new Error("Database error occured while get offer");
    }
  }

  async countOffers(filter) {
    return await OffersModel.countDocuments(filter);
  }
 
  //helper repo to add total whatsapp message sent count
  async updateCount(id,count){
    try {
      const countUpdate = await OffersModel.updateOne(
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

export default OfferRepository;
