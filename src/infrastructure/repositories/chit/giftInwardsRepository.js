import giftInwardsModel from '../../models/chit/giftInwardsModel.js';
import mongoose from 'mongoose';

class giftInwardsRepository{
    async findById(id){
        try {
            const giftData= await giftInwardsModel.findById(id).lean()

            if(!giftData){
                return null;
            }

            return giftData;
        } catch (error) {
            console.error(error);
            throw new Error ('Database error while finding document')
        }
    }

    async findOne(query){
        try {
            const giftData= await giftInwardsModel.findOne(query).lean()
            if(!giftData){
                return null;
            }

            return giftData;
        } catch (error) {
            console.error(error);
            throw new Error ('Database error while finding document')
        }
    }

    async updateQty(id,qty){
        try {
            const giftData= await giftInwardsModel.updateOne(
                { _id: id },
                { $inc: { qty: -qty } }
            );

            if(!giftData){
                return null;
            }

            return giftData;
        } catch (error) {
            console.error(error);
            throw new Error ('Database error in Updating qty')
        }
    }

    async updateOne(id,qty){
        try {
            const giftData= await giftInwardsModel.updateOne(
                { _id: id },
                { $inc: { qty: -qty } }
            );

            if(!giftData){
                return null;
            }

            return giftData;
        } catch (error) {
            console.error(error);
            throw new Error ('Database error while finding document')
        }
    }

  
    
    async searchBarcode(branchId, searchCode) {
      try {
        const result = await giftInwardsModel.aggregate([
          {
            $match: {
              id_branch: new mongoose.Types.ObjectId(branchId),
              active: true
            }
          },
          {
            $lookup: {
              from: 'giftitems', 
              localField: 'id_gift',
              foreignField: '_id',
              as: 'gift'
            }
          },
          {
            $unwind: '$gift'
          },
          {
            $match: {
              'gift.gift_code': searchCode 
            }
          },
          {
            $lookup: {
              from: 'giftvendors', 
              localField: 'gift_vendorid',
              foreignField: '_id',
              as: 'gift_vendor'
            }
          },
          {
            $unwind: {
              path: '$gift_vendor',
              preserveNullAndEmptyArrays: true
            }
          }
        ]);
    
        return result[0] || null; 
      } catch (error) {
        console.error('Error during lookup:', error);
        throw new Error('Database error during lookup');
      }
    }
    
      
    

    async getByBranch(query) {
        try {
          const giftData = await giftInwardsModel
            .find({
              ...query, 
              id_gift: { $ne: null } 
            })
            .populate({
              path: "id_gift",
              match: { active: true, is_deleted: false }
            })
            .sort({ createdAt: -1 })
            .lean();
       
          const filteredData = giftData.filter(doc => doc.id_gift);
      
          return filteredData.length ? filteredData : []; 
        } catch (error) {
          console.error(error);
          throw new Error("Database error while finding document");
        }
      }
      
      

    async addGiftInward(data){
        try {
            const newData= await giftInwardsModel.create(data);

          return  newData ? newData : null; 
        } catch (error) {
            console.error(error);
            throw new Error("Database error: addGiftInward")
        }
    }

    async editGiftInward(id,data){
        try {
            const newData= await giftInwardsModel.findByIdAndUpdate(
                {_id:id},
                {$set:data},
                {new:true}
            );

            if(!newData){
                return null;
            }

            return  newData ? newData : null; 
        } catch (error) {
            (error);
            throw new Error("Database error: editGiftInward")
        }
    }

    async deleteGiftInward(id){
        try {
            const newData= await giftInwardsModel.updateOne(
                {_id:id},
                {$set:{is_deleted:true,active:false}}
            );

            if(newData.modifiedCount === 0){
                return null;
            }

            return  newData ? newData : null; 
        } catch (error) {
            console.error(error);
            throw new Error("Database error: editGiftInward")
        }
    }

    async changeInwardsActiveStatus(id,active){
        try {
            const newData= await giftInwardsModel.updateOne(
                {_id:id},
                {$set:{active:!active}},
                {new:true}
            )

            if(newData.modifiedCount === 0){
                return null;
            }

            return newData;
        } catch (error) {
            console.error(error);
            throw new Error('Database erro: changeInwardsActiveStatus')
        }
    }

    async giftInwardsDataTable({ query = {}, documentskip = 0, documentlimit = 10 }) {
        try {
           
            const totalCount = await giftInwardsModel.countDocuments(query);
    
            const data = await giftInwardsModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .populate("gift_vendorid")
                .populate("id_gift")
                .populate("id_branch")
                .select('-created_by -modified_by -updatetime -createdAt -updatedAt -__v')
                .sort({ _id: -1 })
                .lean();
    
            return {
                data,
                totalCount
            };
        } catch (error) {
            console.error("Error in giftInwardsDataTable repository layer:", error);
            throw new Error("Database error occurred while fetching data");
        }
    }
    
    async giftAccountCount(branchId){
        try {
            const newData= await giftInwardsModel.aggregate([
                { $match: { active: true, id_branch: branchId } },
                { $group: { _id: null, total: { $sum: '$qty' } } }
              ]);

            if(newData.length > 0){
                return newData;
            }

            return [];
        } catch (error) {
            console.error(error);
            throw new Error('Database erro: changeInwardsActiveStatus')
        }
    }

    async findByGiftCode(query) {
        try {
          const result = await giftInwardsModel.aggregate([
            {
                $lookup: {
                  from: 'giftitems', 
                  localField: 'id_gift',
                  foreignField: '_id',
                  as: 'gift'
                }
              },
              { $unwind: '$gift' },
              {
                $match: {
                  'gift.gift_code': query.gift_code
                }
              },
            { $limit: 1 }
          ]);
      
          return result[0] || null;
        } catch (error) {
          console.error(error);
          throw new Error('Error finding inward by gift_code');
        }
      }

      
      async countGifts() {
          const result = await giftInwardsModel.aggregate([
            { $match: { is_deleted: false, active: true } },
            {
              $group: {
                _id: null,
                totalQuantity: { $sum: "$qty" }
              }
            }
          ]);
          return result[0]?.totalQuantity || 0;
        }
      
      
      
}

export default giftInwardsRepository;