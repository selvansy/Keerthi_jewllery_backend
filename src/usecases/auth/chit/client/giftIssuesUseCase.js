import { isValidObjectId } from "mongoose";
import mongoose from "mongoose"; 


class GiftIssuesUseCase { 
  
  constructor(giftIssuesRepository, giftInwardsRepo, giftItemRepo,schemeAccountRepository,customerRepository) {
    this.schemeAccountRepository = schemeAccountRepository;
    this.customerRepository = customerRepository;
    this.giftIssuesRepository = giftIssuesRepository;
    this.giftInwardsRepo = giftInwardsRepo;
    this.giftItemRepo = giftItemRepo
  }

  isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) ? id : null;

  //!ref code may restore later
//   async addGiftIssue(data) {
//     try {
//         const transformedData = {
//             issue_type: data.issue_type,
//             id_branch: this.isValidObjectId(data.id_branch),
//             id_customer: this.isValidObjectId(data.id_customer),
//             mobile: data.mobile,
//             gifts: data.gift_issues.map((gift) => ({
//                 id_gift: this.isValidObjectId(gift.gift_id),
//                 barcode: gift.barcode,
//                 qty: Number(gift.qty) || 1,
//               })),
//           id_scheme_account: this.isValidObjectId(data.id_scheme_account),
//         };
             
        
//         for (const gift of transformedData.gifts) {
//             const inwardItem = await this.giftInwardsRepo.findOne({
//                 barcode: gift.barcode,
//                 id_gift: gift.id_gift,
//             });

//             if (!inwardItem) {
//                 return { 
//                     success: false, 
//                     message: `No inward item found for barcode: ${gift.barcode}` 
//                 };
//             }

//             const totalQty = transformedData.gifts.reduce((sum, gift) => sum + gift.qty, 0);

//             let allowedGifts=0
//             let issuedGifts= 0
//             if(data.id_scheme_account && data.issue_type === 1){
//               const giftLimit = await this.schemeAccountRepository.find({_id:data.id_scheme_account});
//               allowedGifts = giftLimit[0]?.id_scheme?.no_of_gifts
//               issuedGifts = giftLimit[0]?.gift_issues
//             }

//             const newTotal = Number(totalQty)+ Number(issuedGifts)
//             if(newTotal>allowedGifts){
//               return {success:false,message:"Not allowed to add gift more than scheme allowed limit reduce gift count"}
//             }

//             if(allowedGifts< issuedGifts || allowedGifts === issuedGifts && data.issue_type === 1 ){
//               return {success:false,message:"Not allowed to add gift more than scheme allowed limit"}
//             }

//             if (inwardItem.qty < gift.qty) {
//                 return { success: false, message: "Not enough stock available" };
//             }
           
          
//             if (transformedData.issue_type === 1) {
//               await this.schemeAccountRepository.updateQty(data.id_scheme_account,totalQty);
//           }
 
//             const quan = Number(gift.qty)
//             await this.giftInwardsRepo.updateQty(inwardItem._id,quan);
//         }

//         const savedData = await this.giftIssuesRepository.addGiftIssue(transformedData);

//         if (!savedData) {
//             return { success: false, message: "Failed to issue gift" };
//         }

//         return { success: true, message: "Gift issued successfully" };
//     } catch (error) {
//         console.error(error);
//         return { success: false, message: "An error occurred while adding gift" };
//     }
// }
 //!ref code may restore later

async addGiftIssue(data) {
  try {
    const transformedData = {
      issue_type: data.issue_type,
      id_branch: this.isValidObjectId(data.id_branch),
      id_customer: this.isValidObjectId(data.id_customer),
      mobile: data.mobile,
      gifts: data.gift_issues.map((gift) => ({
        id_gift: this.isValidObjectId(gift.gift_id),
        gift_code: gift.gift_code,
        qty: Number(gift.qty),
      })),
      id_scheme_account: this.isValidObjectId(data.id_scheme_account),
    };
    
    const totalQty = transformedData.gifts.reduce((sum, gift) => sum + gift.qty, 0);

    if (data.id_scheme_account && data.issue_type === 1) {
      const schemeAccount = await this.schemeAccountRepository.find({_id: data.id_scheme_account});
      if (!schemeAccount || !schemeAccount.length) {
        return { success: false, message: "Scheme account not found" };
      }

    if(schemeAccount[0]?.id_scheme?.no_of_gifts == 0){
      return {success:false,message:"No gift allocated in the scheme"}
    }

      const allowedGifts = schemeAccount[0]?.id_scheme?.no_of_gifts || 0;
      const gift_minimum_paid_installment = schemeAccount[0]?.id_scheme?.gift_minimum_paid_installment || 1;
      const paid_installments = schemeAccount[0]?.paid_installments;
      const issuedGifts = schemeAccount[0]?.gift_issues || 0;
      
      const newTotal = Number(issuedGifts) + Number(totalQty);

      if(paid_installments < gift_minimum_paid_installment){
        return {
          success: false, 
          message: `Cannot issue gifts. Limit: ${gift_minimum_paid_installment} installments`
        };
      }
      
      if (newTotal > allowedGifts ) {
        return {
          success: false, 
          message: `Cannot issue ${totalQty} more gifts. Limit: ${allowedGifts}, Already issued: ${issuedGifts}, Available: ${allowedGifts - issuedGifts}`
        };
      }
    }

    for (const gift of transformedData.gifts) {
   
      const inwardItem = await this.giftInwardsRepo.findByGiftCode({
        gift_code: gift.gift_code,
        id_gift: gift.id_gift,
      });


      if (!inwardItem) {
        return { 
          success: false, 
          message: `No inward item found for giftcode: ${gift.gift_code}` 
        };
      }

      if (inwardItem.qty < gift.qty) {
        return { 
          success: false, 
          message: `Not enough stock available for giftcode: ${gift.gift_code}. Available: ${inwardItem.qty}, Requested: ${gift.qty}` 
        };
      }
    }
    
    
    const savedData = await this.giftIssuesRepository.addGiftIssue(transformedData);

    if (!savedData) {
      return { success: false, message: "Failed to issue gift" };
    }

    for (const gift of transformedData.gifts) {
      const inwardItem = await this.giftInwardsRepo.findByGiftCode({
        gift_code: gift.gift_code,
        id_gift: gift.id_gift,
      });
      
      
      const qty = Number(gift.qty);
      await this.giftInwardsRepo.updateQty(inwardItem._id, qty);
    }

    if (transformedData.issue_type === 1 && data.id_scheme_account) {
      await this.schemeAccountRepository.updateQty(data.id_scheme_account, totalQty);
    }

    return { success: true, message: "Gift issued successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "An error occurred while adding gift" };
  }
}


  async getGiftIssuesByBranch(branchId) {
    try {
      if (!isValidObjectId(branchId)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const fetchedData = await this.giftIssuesRepository.getGiftIssuesByBranch(branchId);

      if (!fetchedData || fetchedData.length === 0) {
        return { success: false, message: "No data found" };
      }


      return {
        success: true,
        message: "Gift data retrieved successfully",
        data: fetchedData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
  }

  async editGiftInward(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.giftInwardsRepo.findById(id);

      if (!exists) {
        return { success: false, message: "No gift data found" };
      }

      const normalizeValue = (value) => {
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        if (value instanceof mongoose.Types.Decimal128) {
          return parseFloat(value.toString());
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === "string") {
          return value;
        }
        if (typeof value === "number") {
          return value;
        }
        return value;
      };

      const normalizedExists = {};
      for (const key in exists) {
        normalizedExists[key] = normalizeValue(exists[key]);
      }

      const normalizedData = {};
      for (const key in data) {
        normalizedData[key] = normalizeValue(data[key]);
      }

      let fieldsToUpdate = {};
      for (const key in normalizedData) {
        if (
          [
            "_id",
            "createdAt",
            "updatedAt",
            "__v",
            "is_deleted",
            "created_by",
          ].includes(key)
        ) {
          continue;
        }

        const existingValue = normalizedExists[key];
        const newValue = normalizedData[key];

        if (
          existingValue !== newValue &&
          newValue !== undefined &&
          newValue !== null
        ) {
          fieldsToUpdate[key] = data[key];
        }
      }

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      }

      const savedData = await this.giftInwardsRepo.editGiftInward(
        id,
        fieldsToUpdate
      );

      if (!savedData) {
        return { success: false, message: "Failed to update gift" };
      }

      return {
        success: true,
        message: "Gift updated successfully",
        data: savedData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while updating the gift",
      };
    }
  }

  async deleteGiftIssue(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const metalRate = await this.giftIssuesRepository.findById(id);

      if (!metalRate) {
        return { success: false, message: "Inwards data not found" };
      }

      if (metalRate.is_deleted) {
        return { success: false, message: "Already deleted document" };
      }

      const newData = await this.giftIssuesRepository.deleteGiftIssue(id);

      if (newData) {
        return { success: true, message: "Gift issue deleted" };
      }

      return { success: false, message: "Failed to delete Gift issue" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while deleting gift issue",
      };
    }
  }

  async changeInwardsActiveStatus(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const exisits = await this.giftInwardsRepo.findById(id);

      if (!exisits) {
        return { success: false, message: "No data found" };
      }

      if (exisits.is_deleted) {
        return { success: false, message: "Already deleted document" };
      }

      const newData = await this.giftInwardsRepo.changeInwardsActiveStatus(id, exisits.active);

      if (!newData) {
        return { success: false, message: "Failed to change active status" };
      }

      let message = exisits.active ?
        'Gift inwards deactivated' :
        'Gift inwards activated'

      return { success: true, message: message }
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while deleting gift inwards",
      };
    }
  }

  async giftIssuesDataTable({ page, limit,search}) {
    try {

      const pageNum = page ? parseInt(page, 10) : 1;
      const pageSize = limit ? parseInt(limit, 10) : 10;

      const query = {
        is_deleted: false,
        ...search,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
      const data = await this.giftIssuesRepository.giftIssuesDataTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!data || data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: data,
        totalCount: data.totalCount,
        totalPages: Math.ceil(data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in giftInwardsDataTable use case:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }

  async getAllActiveIssues() {
    try {
      const newData = await this.giftIssuesRepository.getAllActiveIssues();

      if (newData) {
        return { success: true, message: "Issued data fetched successfully", data: newData };
      }

      return { success: false, message: "Failed to get Gift issue" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while deleting gift issue",
      };
    }
  }


async searchBarcode(branchId, search) {
  try {
    if (!isValidObjectId(branchId)) {
      return { success: false, message: "Branch id is not a valid object id" }
    }

    const newData = await this.giftInwardsRepo.searchBarcode(branchId, search);

    if (newData) {
      return { success: true, message: "Issued data fetched successfully", data: newData };
    }

    return { success: false, message: "No gifts found" };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "An error occured while deleting gift issue",
    };
  }
}


  async giftAccountCount(branchId) {
    try {
      if (!isValidObjectId(branchId)) {
        // return {success:false,message:"Branch id is not a valid object id"}
        const totalGiftResult = await this.giftIssuesRepository.getAllActiveIssues();
      }

      const totalGiftResult = await this.giftIssuesRepository.giftAccountCount(branchId);

      if (!totalGiftResult) {
        return { success: true, message: "No gift inwards found" };
      }

      let totalGift = totalGiftResult[0]?.total || 0;

      const chitAggregate = [
        {
          $match: {
            active: true,
            id_branch: new mongoose.Types.ObjectId(branchId),
            id_scheme_account: { $ne: null },
          }
        },
        { $unwind: "$gifts" },
        {
          $group: {
            _id: null,
            total: { $sum: "$gifts.qty" }
          }
        }
      ];

      const totalChitReceiveResult = await this.giftIssuesRepository.aggregate(chitAggregate)

      // if (!totalChitReceiveResult) {
      //   return { success: true, message:"No issued gift found"};
      // }

      let totalChitReceive = totalChitReceiveResult[0]?.total || 0;

      const nonChitAggregate = [
        { $match: { active: true, id_branch: branchId, id_scheme_account: 0 } },
        { $group: { _id: null, total: { $sum: '$qty' } } }
      ]

      const totalNonChitReceiveResult = await this.giftIssuesRepository.aggregate(nonChitAggregate)

      let totalNonChitReceive = totalNonChitReceiveResult[0]?.total || 0;

      let totalBalance = totalGift - (totalChitReceive + totalNonChitReceive);

      const giftissuescount = {
        total_gift: totalGift,
        total_schemegift: totalChitReceive,
        total_nonschemegift: totalNonChitReceive,
        total_balancegift: totalBalance
      };

      return { success: true, message: "No data found", data: giftissuescount };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while fetching  gift issue",
      };
    }
  }

  async getCardsData({ filters }) {
    try {
      const query = {
        is_deleted: false,
        active: true,
        ...filters,
      };
  
      const data = await this.giftIssuesRepository.getCardsData(query);
      if (!data || data.length === 0) {
        return { success: false, message: "No gift issue data found" };
      }

      const balance_gift = data.total_inward_qty - (data.scheme_qty + data.non_scheme_qty);

  
      const cardData = {
        chit_gift:data.scheme_qty,
        nonchit_gift: data.non_scheme_qty,
        scheme_count:data.scheme_count,
        non_scheme_count:data.non_scheme_count,
        total_gift: data.total_inward_qty,
        balance_gift,
      };
  
      return {
        success: true,
        message: "Card data fetched successfully",
        data: cardData,
      };
    } catch (error) {
      console.error("Error in giftcard use case:", error);
      return { success: false, message: "An error occurred while fetching data" };
    }
  }
  
   
  async giftIssueDataByschemeaccId({ page = 1, limit = 10, search, value }) {
    try {
      const searchterm = value || "";
  
      const query = {
        active: true,
        is_deleted: false,
      };
  
      if (!mongoose.Types.ObjectId.isValid(searchterm)) {
        return { success: false, message: "Invalid search ID format" };
      }
  
      const searchObjectId = new mongoose.Types.ObjectId(searchterm);
  
      const schemeAccount = await this.schemeAccountRepository.findById({ _id: searchObjectId });
  
      if (schemeAccount) {
        query.id_scheme_account = searchObjectId;
      } else {
        
        const customer = await this.customerRepository.findById({ _id: searchObjectId });
  
        if (customer) {
          query.id_customer = searchObjectId;
        } else {
          return { success: false, message: "No scheme account or customer found" };
        }
      }
  
      const pageNum = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);
      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;
  
      const data = await this.giftIssuesRepository.giftIssuesDataBySchId({
        query,
        documentskip,
        documentlimit,
      });
  
      if (!data || data.data.length === 0) {
        return { success: false, message: "No data found" };
      }
  
      return {
        success: true,
        message: "GiftIssues data retrieved successfully",
        data: data.data,
        giftsList: data.giftsList,
        totalCount: data.totalCount,
        totalPages: Math.ceil(data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
  }
  

}

export default GiftIssuesUseCase;