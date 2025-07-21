import giftInwardsModel from "../../models/chit/giftInwardsModel.js";
import giftIssuesModel from "../../models/chit/giftIssuesModel.js";

class GiftIssuesRepository { 

  async addGiftIssue(data) {
    try {
      return await giftIssuesModel.create(data);
    } catch (error) {
      console.error(error);
    }
  }

  async findById(id) {
    try {
      return await giftIssuesModel.findById(id);
    } catch (error) {
      console.error(error);
    }
  }

  async aggregate(querry) {
    try {
      const giftData = await giftIssuesModel.aggregate(querry);

      if (giftData.length > 0) {
        return giftData;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteGiftIssue(id) {
    try {
      const giftData = await giftIssuesModel.updateOne(
        { _id: id },
        { $set: { is_deleted: true, active: false } }
      );

      if (giftData.matchedCount !== 0) {
        return giftData;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  async getGiftIssuesByBranch(id) {
    try {
      const giftData = await giftIssuesModel.find({ id_branch: id });

      if (giftData.length > 0) {
        return giftData;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllActiveIssues() {
    try {
      const giftData = await giftIssuesModel
        .find({ active: true, is_deleted: false })
        .populate("id_gift")
        .lean();

      return giftData.length > 0 ? giftData : [];
    } catch (error) {
      console.error("Error fetching active issues:", error);
      throw new Error("Error fetching active issues");
    }
  }


  async giftIssuesDataTable({
    query = {},
    documentskip = 0,
    documentlimit = 10,
    filter = {},
  }) {
    try {
      const combinedQuery = {
        ...query,
        ...Object.fromEntries(
          Object.entries(filter).filter(([key, value]) => value != null)
        ),
      };

      const totalCount = await giftIssuesModel.countDocuments(combinedQuery);

      const data = await giftIssuesModel
        .find(combinedQuery)
        .skip(documentskip)
        .limit(documentlimit)
        .populate("id_customer")
        .populate("id_branch")
        .populate("id_scheme_account")
        .populate("gifts.id_gift")
        .sort({ _id: -1 })
        .lean();

      return {
        data,
        totalCount,
      };
    } catch (error) {
      console.error("Error in giftInwardsDataTable repository layer:", error);
      throw new Error("Database error occurred while fetching data");
    }
  }

  async aggregate(querry) {
    try {
      const giftData = await giftIssuesModel.aggregate(querry);

      if (giftData.length > 0) {
        return giftData;
      }

      return [];
    } catch (error) {
      console.error(error);
    }
  }

  async getCardsData(query) {
    try {
      const [issuesData, inwardsData] = await Promise.all([
        giftIssuesModel.aggregate([
          { $match: query },
          { $unwind: '$gifts' },
          {
            $facet: {
              non_scheme: [
                {
                  $match: {
                    issue_type: 2,
                    id_scheme_account: null
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_qty: { $sum: '$gifts.qty' },
                    count: { $sum: 1 }
                  }
                }
              ],
              scheme: [
                {
                  $match: {
                    $or: [
                      { issue_type: { $ne: 2 } },
                      { id_scheme_account: { $ne: null } }
                    ]
                  }
                },
                {
                  $group: {
                    _id: null,
                    total_qty: { $sum: '$gifts.qty' },
                    count: { $sum: 1 }
                  }
                }
              ]
            }
          },
          {
            $project: {
              non_scheme_count: { $ifNull: [{ $arrayElemAt: ['$non_scheme.count', 0] }, 0] },
              non_scheme_qty: { $ifNull: [{ $arrayElemAt: ['$non_scheme.total_qty', 0] }, 0] },
              scheme_count: { $ifNull: [{ $arrayElemAt: ['$scheme.count', 0] }, 0] },
              scheme_qty: { $ifNull: [{ $arrayElemAt: ['$scheme.total_qty', 0] }, 0] }
            }
          }
        ]),
        giftInwardsModel.aggregate([
          {
            $group: {
              _id: null,
              total_inward_qty: { $sum: '$inward_qty' }
            }
          }
        ])
      ]);
  
      const result = issuesData[0] || {
        non_scheme_count: 0,
        non_scheme_qty: 0,
        scheme_count: 0,
        scheme_qty: 0
      };
  
      result.total_inward_qty = inwardsData[0]?.total_inward_qty || 0;
  
      return result;
    } catch (error) {
      console.error("Error in gift issues repository layer:", error);
      throw new Error("Database error occurred while fetching data");
    }
  }
  
  

  async giftIssuesDataBySchId({
    search = "",
    documentskip = 0,
    documentlimit = 10,
    query,
  }) {
    
    try {
      
      const aggregatePipeline = [
        { $match: query },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "id_customer",
          },
        },
        { $unwind: "$id_customer" },

        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "schemeAccountData",
          },
        },
        {
          $unwind: {
            path: "$schemeAccountData",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $unwind: {
            path: "$gifts",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "giftitems",
            localField: "gifts.id_gift",
            foreignField: "_id",
            as: "giftData",
          },
        },
        {
          $unwind: {
            path: "$giftData",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $addFields: {
            "gifts.id_gift": "$giftData",
          },
        },

        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" },
            gifts: { $push: "$gifts" },
          },
        },

        {
          $addFields: {
            "doc.gifts": "$gifts",
          },
        },
        {
          $replaceRoot: {
            newRoot: "$doc",
          },
        },

        { $sort: { _id: -1 } },
        {
          $facet: {
            data: [
              { $skip: documentskip },
              { $limit: documentlimit },
            ],
            totalCount: [
              { $count: "count" },
            ],
          },
        },
      ];

      const result = await giftIssuesModel.aggregate(aggregatePipeline);

      const data = result[0]?.data || [];
      const giftsList = data.flatMap(e => (
        e.gifts.map(gift => ({
          ...gift,
          giftIssueDate: e.createdAt, 
        }))
      ));
      
      const totalCount = result[0]?.totalCount?.[0]?.count || 0;

      return {
        data,
        giftsList,
        totalCount,
      };
    } catch (error) {
      console.error("Error in giftIssuesAggregateSearch:", error);
      throw new Error("Aggregation error occurred while fetching data");
    }
  }







}

export default GiftIssuesRepository;
