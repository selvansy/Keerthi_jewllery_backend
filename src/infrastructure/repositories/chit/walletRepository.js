import walletListModel from '../../models/chit/walletListModel.js';
import walletRateModel from '../../models/chit/walletRateModel.js';
import walletModel from '../../models/chit/walletModel.js'
import referralListModel from '../../models/chit/referralListModel.js';
import paymentModel from '../../models/chit/paymentModel.js';
import mongoose, { ObjectId } from "mongoose";
import customerModel from '../../models/chit/customerModel.js';


class WalletRepository {

    async findData(query) {
        try {
            const data = await walletRateModel.findOne(query)

        if (data) {
            return data;
        }

        return null;
        } catch (error) {
            console.error(error)
        }
    }

    // async findLatestActiveWalletRate() {
    //     try {
    //         const exists = await walletRateModel.findOne(
    //             { is_deleted: false, active: true }
    //         ).sort({ createdAt: -1 });

    //         if (!exists) {
    //             return null;
    //         }

    //         return exists;
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }



    // async addWalletRate(data) {
    //     return await walletRateModel.create(data);
    // }

    async addWalletHistory(data) {
        try {
            const createdData = await walletListModel.create(data);

            if (createdData) {
                return createdData;
            }

            return null;
        } catch (error) {
            console.error(error)
        }
    }

    async findWallet(dataId) {
        try {
            const walletData = await walletModel.findOne(dataId)

            if (walletData) {
                return walletData
            }

            return null;
        } catch (error) {
            console.error(error)
        }
    }


    // async getCustomerWalletDetails(customerId) {
    //     try {
    //       const idCustomer = new mongoose.Types.ObjectId(customerId);
      
    //       const result = await walletModel.aggregate([
    //         {
    //           $match: {
    //             id_customer: idCustomer
    //           }
    //         },
    //         {
    //           $lookup: {
    //             from: "customers",
    //             localField: "id_customer",
    //             foreignField: "_id",
    //             as: "customer"
    //           }
    //         },
    //         {
    //             $lookup: {
    //               from: "schemeaccounts",
    //               localField: "id_customer",
    //               foreignField: "id_customer",
    //               as: "schemeaccount"
    //             }
    //           },
    //         {
    //             $project: {
    //               _id: 0,
    //               balance_amt: 1,
    //               firstname: { $arrayElemAt: ["$customer.firstname", 0] },
    //               lastname: {
    //                 $cond: {
    //                   if: { $ne: [ { $arrayElemAt: ["$customer.lastname", 0] }, null ] },
    //                   then: { $arrayElemAt: ["$customer.lastname", 0] },
    //                   else: "$$REMOVE"
    //                 }
    //               },
    //               address:{ $arrayElemAt: ["$customer.address", 0] },
    //             }
    //           }
    //       ]);
      
    //       return result.length > 0 ? result[0] : 0;
    //     } catch (error) {
    //       console.error(error);
    //       throw new Error("Failed to get customer wallet details");
    //     }
    //   }
    async getCustomerWalletDetails(customerId) {
        try {
          const idCustomer = new mongoose.Types.ObjectId(customerId);
      
          const result = await customerModel.aggregate([
            {
              $match: { _id: idCustomer }
            },
            {
                $lookup: {
                  from: "wallets",
                  let: { customerMobile: { $toString: "$mobile" } },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ["$mobile", "$$customerMobile"]
                        }
                      }
                    }
                  ],
                  as: "wallets"
                }
              },           
            {
              $lookup: {
                from: "schemeaccounts",
                localField: "_id",
                foreignField: "id_customer",
                as: "schemeaccount"
              }
            },
            {
              $addFields: {
                activeSchemeCount: {
                  $size: {
                    $filter: {
                      input: "$schemeaccount",
                      as: "scheme",
                      cond: { $eq: ["$$scheme.status", 0] }
                    }
                  }
                },
                closedSchemeCount: {
                  $size: {
                    $filter: {
                      input: "$schemeaccount",
                      as: "scheme",
                      cond: { $eq: ["$$scheme.status", 1] }
                    }
                  }
                },
                completedSchemeCount: {
                  $size: {
                    $filter: {
                      input: "$schemeaccount",
                      as: "scheme",
                      cond: { $eq: ["$$scheme.status", 2] }
                    }
                  }
                },
                balance_amt: {
                  $ifNull: [{ $arrayElemAt: ["$wallets.balance_amt", 0] }, 0]
                }
              }
            },
            {
              $project: {
                _id: 0,
                balance_amt: 1,
                firstname: 1,
                lastname: {
                  $cond: {
                    if: { $ne: ["$lastname", null] },
                    then: "$lastname",
                    else: "$$REMOVE"
                  }
                },
                address: 1,
                active_scheme_count: "$activeSchemeCount",
                closedSchemeCount: "$closedSchemeCount",
                completedSchemeCount: "$completedSchemeCount"
              }
            }
          ]);
      
          return result.length > 0 ? result[0] : 0;
        } catch (error) {
          console.error(error);
          throw new Error("Failed to get customer wallet details");
        }
      }
      
      
      
    async aggregateWallets(pipeline) {
        return await walletListModel.aggregate(pipeline);
    }

    async aggregateWalletModel(pipeline) {
        return await walletModel.aggregate(pipeline);
    }

    async getAllWallets({ query, documentskip, documentlimit }) {
        try {
            const baseMatch = {
                is_deleted: false,
                active: true,
            };
    
            if (query.updatedAt) {
                baseMatch.updatedAt = query.updatedAt;
            }
    
            const searchTerm = query.search || "";
            const pipeline = [
                { $match: baseMatch },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                { $unwind: { path: "$id_customer", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "id_employee"
                    }
                },
                { $unwind: { path: "$id_employee", preserveNullAndEmptyArrays: true } },

                {
                    $match: {
                        $or: [
                            { "id_customer.firstname": { $regex: searchTerm, $options: "i" } },
                            { "id_customer.lastname": { $regex: searchTerm, $options: "i" } },
                            { "id_customer.mobile": { $regex: searchTerm, $options: "i" } },
                            { "id_employee.firstname": { $regex: searchTerm, $options: "i" } },
                            { "id_employee.lastname": { $regex: searchTerm, $options: "i" } },
                            { "id_employee.mobile": { $regex: searchTerm, $options: "i" } }
                        ]
                    }
                },
    
                {
                    $facet: {
                        metadata: [{ $count: "total" }],
                        data: [
                            { $sort: { _id: -1 } },
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ]
                    }
                }
            ];
            const result = await walletModel.aggregate(pipeline);
    
            const data = result[0]?.data || [];
            const totalCount = result[0]?.metadata[0]?.total || 0;

            const aggregationPipeline = [
                { $match: baseMatch },
                {
                    $group: {
                        _id: null,
                        totalRewardAmt: {
                            $sum: {
                                $cond: [{ $ifNull: ["$total_reward_amt", false] }, "$total_reward_amt", 0]
                            }
                        },
                        totalRedeemedAmt: {
                            $sum: {
                                $cond: [{ $ifNull: ["$redeem_amt", false] }, "$redeem_amt", 0]
                            }
                        },
                        totalBalanceAmt: {
                            $sum: {
                                $cond: [{ $ifNull: ["$balance_amt", false] }, "$balance_amt", 0]
                            }
                        }
                    }
                }
            ];
    
            const totals = await walletModel.aggregate(aggregationPipeline);
            const totalData = totals[0] || {
                totalRewardAmt: 0,
                totalRedeemedAmt: 0,
                totalBalanceAmt: 0
            };
    
            return {
                data,
                totalCount,
                totalRewardAmt: totalData.totalRewardAmt,
                totalRedeemedAmt: totalData.totalRedeemedAmt,
                totalBalanceAmt: totalData.totalBalanceAmt,
            };
        } catch (error) {
            console.error("Error in getAllWallets:", error);
            throw new Error("Database error occurred while fetching wallet data.");
        }
    }
    


    async getRedeem({ query, documentskip, documentlimit }) {
        try {
            const baseMatch = {
                is_deleted: false,
                active: true,
            };
    
            if (query.updatedAt) {
                baseMatch.updatedAt = query.updatedAt;
            }
    
            const pipeline = [
                { $match: baseMatch },
                {
                    $lookup: {
                        from: "wallets",
                        let: { walletId: "$wallet_id" },
                        pipeline: [
                            { $match: { $expr: { $eq: ["$_id", "$$walletId"] } } },
                            {
                                $project: {
                                    wallet_no: 1,
                                    total_reward_amt: 1,
                                    redeem_amt: 1,
                                    balance_amt: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                    id_customer: 1,
                                    id_employee: 1,
                                    wallet_type: {
                                        $cond: [
                                            { $gt: ["$id_customer", null] },
                                            "customer",
                                            "employee"
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "wallet"
                    }
                },
                {
                    $addFields: {
                        wallet: { $arrayElemAt: ["$wallet", 0] }
                    }
                },
                {
                    $addFields: {
                        user_id: {
                            $cond: [
                                { $eq: ["$wallet.wallet_type", "customer"] },
                                "$wallet.id_customer",
                                "$wallet.id_employee"
                            ]
                        },
                        wallet_type: "$wallet.wallet_type"
                    }
                },

                {
                    $lookup: {
                        from: "customers",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "customer"
                    }
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "employee"
                    }
                },
                {
                    $addFields: {
                        user: {
                            $cond: [
                                { $eq: ["$wallet_type", "customer"] },
                                { $arrayElemAt: ["$customer", 0] },
                                { $arrayElemAt: ["$employee", 0] }
                            ]
                        }
                    }
                },
                {
                    $addFields: {
                        "user.mobileStr": { $toString: "$user.mobile" },
                        user_branch_id: "$user.id_branch"
                    }
                },
                {
                    $lookup: {
                        from: "branches",
                        localField: "user_branch_id",
                        foreignField: "_id",
                        as: "branch"
                    }
                },
                {
                    $project: {
                        customer: 0,
                        employee: 0,
                        wallet_type: 0,
                        user_branch_id: 0
                    }
                },
                ...(query.search && query.search.trim() !== ""
                    ? [{
                        $match: {
                            user: { $ne: null },
                            $or: [
                                { "user.firstname": { $regex: query.search, $options: "i" } },
                                { "user.lastname": { $regex: query.search, $options: "i" } },
                                { "user.mobileStr": { $regex: query.search, $options: "i" } },
                                { bill_no: { $regex: query.search, $options: "i" } }
                            ]
                        }
                    }]
                    : []),
    
                {
                    $facet: {
                        data: [
                            { $sort: { _id: -1 } },
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ]
                    }
                }
            ];
            const data = await walletListModel.aggregate(pipeline);

            const totalCount = data[0]?.totalCount[0]?.count || 0;
    
            return {
                data: data[0]?.data || [],
                totalCount,
            };
        } catch (error) {
            console.error("Error in getRedeem:", error);
            throw new Error("Database error occurred while fetching wallet redeem history.");
        }
    }
    


    async findWalletById(id) {
        try {
            const walletData = await walletModel.findById(id)

            if (walletData) {
                return walletData;
            }

            return null;
        } catch (error) {
            console.error(error)
        }
    }

    async findWalletRate(branchId) {
        return await walletRateModel.findOne({ id_branch: branchId });
    }

   

    async activateWallet(id, active) {
        try {
            const updatedData = await walletModel.updateOne({ _id: id },
                { $set: { active: !active } }
            );

            if (updatedData.modifiedCount === 0) {
                return null;
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }

    async addWallet(data) {
        try {
            const savedData = await walletModel.create(data);

            if (!savedData) {
                return null;
            }

            return savedData;
        } catch (error) {
            console.error(error)
        }
    }

    async updateWallet(dataId, data) {
        try {
            const updatedData = await walletModel.updateOne(dataId, { $set: data }, { new: true });

            if (updatedData.modifiedCount !== 0) {
                return updatedData;
            }

            return null;
        } catch (error) {
            console.error(error)
        }
    }

    async deletedWallet(id) {
        try {
            const data = await walletListModel.updateOne(
                { _id: id },
                { $set: { is_deleted: true, active: fasle } }
            );

            if (data.modifiedCount === 0) {
                return null;
            }

            return data;
        } catch (error) {
            console.error(error)
        }
    }


    async getWalletDataByMobile(query) {
        try {
          const pipeline = [
            { $match: query },
            {
              $lookup: {
                from: "customers",
                let: { customerId: "$id_customer" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } }
                ],
                as: "customer"
              }
            },
            {
              $lookup: {
                from: "employees",
                let: { employeeId: "$id_employee" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$_id", "$$employeeId"] } } }
                ],
                as: "employee"
              }
            },
            {
              $addFields: {
                customer: { $arrayElemAt: ["$customer", 0] },
                employee: { $arrayElemAt: ["$employee", 0] }
              }
            }
          ];
      
          const walletData = await walletModel.aggregate(pipeline);
          return walletData[0] || null;
        } catch (error) {
          console.error("Error in getWalletDataByMobile:", error);
          return null;
        }
      }
      

    async getRedeemByUser({ query, documentskip = 0, documentlimit = 10 }) {
        try {
            const walletMatch = query.wallet_id
                ? { _id: new mongoose.Types.ObjectId(query.wallet_id) }
                : {};
    
            const walletData = await walletModel.aggregate([
                { $match: walletMatch },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "id_employee"
                    }
                },
                {
                    $addFields: {
                        user: {
                            $cond: [
                                { $gt: [{ $size: "$id_customer" }, 0] },
                                { $arrayElemAt: ["$id_customer", 0] },
                                { $arrayElemAt: ["$id_employee", 0] }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        id_customer: 0,
                        id_employee: 0
                    }
                }
            ]);
    
            if (!walletData.length) return null;
    
            const walletIds = walletData.map(w => w._id);

            const result = await walletListModel.aggregate([
                {
                    $match: {
                        wallet_id: { $in: walletIds },
                        credited_amount: { $lt: 0 }
                    }
                },
                {
                    $facet: {
                        data: [
                            { $sort: { _id: -1 } },
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ],
                        totalCount: [{ $count: "count" }]
                    }
                }
            ]);

            const data = result[0].data;
            const totalCount = result[0].totalCount[0]?.count || 0;
    
            return {
                walletData,
                data,
                totalCount
            };
        } catch (error) {
            console.error("Error in getRedeemByUser:", error);
            throw new Error("Database error occurred while fetching wallet data.");
        }
    }
    

    // async getRefferalListByUser({ query, documentskip, documentlimit }) {
    //     try {
    //         const filter = { ...query };
    //         delete filter.wallet_id;
    
    //         const walletMatchStage = query.wallet_id
    //             ? {
    //                 $match: {
    //                     $expr: {
    //                         $or: [
    //                             { $eq: ["$id_customer", new mongoose.Types.ObjectId(query.wallet_id)] },
    //                             { $eq: ["$id_employee", new mongoose.Types.ObjectId(query.wallet_id)] }
    //                         ]
    //                     }
    //                 }
    //             }
    //             : null;
    
    //         const walletPipeline = [
    //             ...(walletMatchStage ? [walletMatchStage] : []),
    //             {
    //                 $lookup: {
    //                     from: "customers",
    //                     localField: "id_customer",
    //                     foreignField: "_id",
    //                     as: "id_customer"
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "employees",
    //                     localField: "id_employee",
    //                     foreignField: "_id",
    //                     as: "id_employee"
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     id_customer: { $arrayElemAt: ["$id_customer", 0] },
    //                     id_employee: { $arrayElemAt: ["$id_employee", 0] }
    //                 }
    //             },
    //             {
    //                 $sort: { _id: -1 }
    //             },
    //             {
    //                 $skip: documentskip
    //             },
    //             {
    //                 $limit: documentlimit
    //             },
    //             {
    //                 $project: {
    //                     id_customer: {
    //                         firstname: 1,
    //                         lastname: 1,
    //                         mobile: 1,
    //                         id_branch: 1
    //                     },
    //                     id_employee: {
    //                         firstname: 1,
    //                         lastname: 1,
    //                         mobile: 1,
    //                         id_branch: 1
    //                     },
    //                     bill_no: 1,
    //                     total_reward_amt: 1,
    //                     redeem_amt: 1,
    //                     balance_amt: 1,
    //                     createdAt: 1,
    //                     updatedAt: 1
    //                 }
    //             }
    //         ];
    
    //         const walletData = await walletModel.aggregate(walletPipeline);
    
    //         const referralPipeline = [
    //             ...(walletMatchStage ? [walletMatchStage] : []),
    //             {
    //                 $lookup: {
    //                     from: "customers",
    //                     localField: "id_customer",
    //                     foreignField: "_id",
    //                     as: "id_customer"
    //                 }
    //             },
    //             { $unwind: { path: "$id_customer", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "employees",
    //                     localField: "id_employee",
    //                     foreignField: "_id",
    //                     as: "id_employee"
    //                 }
    //             },
    //             { $unwind: { path: "$id_employee", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "schemeaccounts",
    //                     localField: "id_scheme_account",
    //                     foreignField: "_id",
    //                     as: "id_scheme_account"
    //                 }
    //             },
    //             { $unwind: { path: "$id_scheme_account", preserveNullAndEmptyArrays: true } },
    //             {
    //                 $lookup: {
    //                     from: "customers",
    //                     localField: "id_scheme_account.id_customer",
    //                     foreignField: "_id",
    //                     as: "scheme_account_customer"
    //                 }
    //             },
    //             {
    //                 $set: {
    //                     scheme_account_customer: {
    //                         $let: {
    //                             vars: { cust: { $arrayElemAt: ["$scheme_account_customer", 0] } },
    //                             in: {
    //                                 firstname: "$$cust.firstname",
    //                                 lastname: "$$cust.lastname",
    //                                 mobile: "$$cust.mobile",
    //                                 id_branch: "$$cust.id_branch"
    //                             }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $set: {
    //                     id_scheme_account: {
    //                         $mergeObjects: ["$id_scheme_account", "$scheme_account_customer"]
    //                     }
    //                 }
    //             },
    //             { $unset: "scheme_account_customer" },
    //             {
    //                 $lookup: {
    //                     from: "schemes",
    //                     localField: "id_scheme_account.id_scheme",
    //                     foreignField: "_id",
    //                     as: "id_scheme"
    //                 }
    //             },
    //             {
    //                 $set: {
    //                     id_scheme: { $arrayElemAt: ["$id_scheme", 0] }
    //                 }
    //             },
    //             {
    //                 $lookup: {
    //                     from: "payments",
    //                     let: { customerId: "$id_scheme_account.id_customer" },
    //                     pipeline: [
    //                         {
    //                             $match: {
    //                                 $expr: {
    //                                     $and: [
    //                                         { $eq: ["$id_customer", "$$customerId"] },
    //                                         { $eq: ["$is_deleted", false] }
    //                                     ]
    //                                 }
    //                             }
    //                         },
    //                         { $sort: { createdAt: -1 } }
    //                     ],
    //                     as: "payment"
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     payment: {
    //                         $cond: {
    //                             if: { $isArray: "$payment" },
    //                             then: {
    //                                 $map: {
    //                                     input: "$payment",
    //                                     as: "pay",
    //                                     in: {
    //                                         $mergeObjects: [
    //                                             "$$pay",
    //                                             {
    //                                                 referral_amount: {
    //                                                     $round: [
    //                                                         {
    //                                                             $multiply: [
    //                                                                 {
    //                                                                     $divide: [
    //                                                                         { $ifNull: ["$id_scheme.referralPercentage", 0] },
    //                                                                         100
    //                                                                     ]
    //                                                                 },
    //                                                                 { $ifNull: ["$$pay.payment_amount", 0] }
    //                                                             ]
    //                                                         },
    //                                                         2
    //                                                     ]
    //                                                 }
    //                                             }
    //                                         ]
    //                                     }
    //                                 }
    //                             },
    //                             else: []
    //                         }
    //                     }
    //                 }
    //             },
    
    //             // 📌 Grouping by id_scheme_account to merge multiple referrals
    //             {
    //                 $group: {
    //                     _id: "$id_scheme_account._id",
    //                     doc: { $first: "$$ROOT" },
    //                     total_credited_amount: { $sum: "$credited_amount" },
    //                     referral_payments: { $push: "$payment" }
    //                 }
    //             },
    //             {
    //                 $addFields: {
    //                     "doc.credited_amount": "$total_credited_amount",
    //                     "doc.payment": {
    //                         $reduce: {
    //                             input: "$referral_payments",
    //                             initialValue: [],
    //                             in: { $concatArrays: ["$$value", "$$this"] }
    //                         }
    //                     }
    //                 }
    //             },
    //             {
    //                 $replaceRoot: { newRoot: "$doc" }
    //             },
    //             {
    //                 $project: {
    //                     id_customer: {
    //                         firstname: 1,
    //                         lastname: 1,
    //                         mobile: 1,
    //                         id_branch: 1
    //                     },
    //                     id_employee: {
    //                         firstname: 1,
    //                         lastname: 1,
    //                         mobile: 1,
    //                         id_branch: 1
    //                     },
    //                     id_scheme_account: {
    //                         _id: 1,
    //                         scheme_acc_number: 1,
    //                         total_installments: 1,
    //                         paymentcount: 1,
    //                         start_date: 1,
    //                         maturity_date: 1,
    //                         firstname: 1,
    //                         lastname: 1,
    //                         mobile: 1,
    //                         id_branch: 1
    //                     },
    //                     id_scheme: {
    //                         scheme_name: 1,
    //                         description: 1,
    //                         code: 1,
    //                         maturity_period: 1,
    //                         referralPercentage: 1
    //                     },
    //                     payment: {
    //                         paid_installments: 1,
    //                         payment_amount: 1,
    //                         total_amt: 1,
    //                         metal_rate: 1,
    //                         metal_weight: 1,
    //                         payment_mode: 1,
    //                         createdAt: 1,
    //                         referral_amount: 1
    //                     },
    //                     credited_amount: 1,
    //                     reward_mode: 1,
    //                     bill_no: 1,
    //                     total_reward_amt: 1,
    //                     redeem_amt: 1,
    //                     balance_amt: 1,
    //                     createdAt: 1,
    //                     updatedAt: 1
    //                 }
    //             },
    //             {
    //                 $sort: { _id: -1 }
    //             },
    //             {
    //                 $facet: {
    //                     data: [
    //                         { $skip: documentskip },
    //                         { $limit: documentlimit }
    //                     ],
    //                     totalCount: [{ $count: "count" }]
    //                 }
    //             }
    //         ];
    
    //         const result = await referralListModel.aggregate(referralPipeline);
    //         const data = result[0]?.data || [];
    //         const totalCount = result[0]?.totalCount?.[0]?.count || 0;
    
    //         return {
    //             data: {
    //                 data,
    //                 walletData,
    //                 totalCount
    //             }
    //         };
    //     } catch (error) {
    //         console.error("Error in getRefferal:", error);
    //         throw new Error("Database error occurred while fetching referral list.");
    //     }
    // }
    async getRefferalListByUser({ query, documentskip, documentlimit }) {
        try {
            const filter = { ...query };
            delete filter.wallet_id;
    
            // First find the wallet document that matches the mobile number
            const walletDoc = await walletModel.findOne({ mobile: query.mobile });
            
            if (!walletDoc) {
                return {
                    data: {
                        data: [],
                        walletData: [],
                        totalCount: 0
                    }
                };
            }
    
            // Determine the ID to use for filtering (either id_customer or id_employee)
            const filterId = walletDoc.id_customer || walletDoc.id_employee;
            if (!filterId) {
                return {
                    data: {
                        data: [],
                        walletData: [],
                        totalCount: 0
                    }
                };
            }
    
            // Modify the wallet pipeline to only include documents for this user
            const walletPipeline = [
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $eq: ["$id_customer", filterId] },
                                { $eq: ["$id_employee", filterId] }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "id_employee"
                    }
                },
                {
                    $addFields: {
                        id_customer: { $arrayElemAt: ["$id_customer", 0] },
                        id_employee: { $arrayElemAt: ["$id_employee", 0] }
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $skip: documentskip
                },
                {
                    $limit: documentlimit
                },
                {
                    $project: {
                        id_customer: {
                            firstname: 1,
                            lastname: 1,
                            mobile: 1,
                            id_branch: 1
                        },
                        id_employee: {
                            firstname: 1,
                            lastname: 1,
                            mobile: 1,
                            id_branch: 1
                        },
                        bill_no: 1,
                        total_reward_amt: 1,
                        redeem_amt: 1,
                        balance_amt: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                }
            ];
    
            const walletData = await walletModel.aggregate(walletPipeline);
    
            // Modify the referral pipeline to only include documents for this user
            const referralPipeline = [
                {
                    $match: {
                        $expr: {
                            $or: [
                                { $eq: ["$id_customer", filterId] },
                                { $eq: ["$id_employee", filterId] }
                            ]
                        }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_customer",
                        foreignField: "_id",
                        as: "id_customer"
                    }
                },
                { $unwind: { path: "$id_customer", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "employees",
                        localField: "id_employee",
                        foreignField: "_id",
                        as: "id_employee"
                    }
                },
                { $unwind: { path: "$id_employee", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "schemeaccounts",
                        localField: "id_scheme_account",
                        foreignField: "_id",
                        as: "id_scheme_account"
                    }
                },
                { $unwind: { path: "$id_scheme_account", preserveNullAndEmptyArrays: true } },
                {
                    $lookup: {
                        from: "customers",
                        localField: "id_scheme_account.id_customer",
                        foreignField: "_id",
                        as: "scheme_account_customer"
                    }
                },
                {
                    $set: {
                        scheme_account_customer: {
                            $let: {
                                vars: { cust: { $arrayElemAt: ["$scheme_account_customer", 0] } },
                                in: {
                                    firstname: "$$cust.firstname",
                                    lastname: "$$cust.lastname",
                                    mobile: "$$cust.mobile",
                                    id_branch: "$$cust.id_branch"
                                }
                            }
                        }
                    }
                },
                {
                    $set: {
                        id_scheme_account: {
                            $mergeObjects: ["$id_scheme_account", "$scheme_account_customer"]
                        }
                    }
                },
                { $unset: "scheme_account_customer" },
                {
                    $lookup: {
                        from: "schemes",
                        localField: "id_scheme_account.id_scheme",
                        foreignField: "_id",
                        as: "id_scheme"
                    }
                },
                {
                    $set: {
                        id_scheme: { $arrayElemAt: ["$id_scheme", 0] }
                    }
                },
                {
                    $lookup: {
                        from: "payments",
                        let: { customerId: "$id_scheme_account.id_customer" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$id_customer", "$$customerId"] },
                                            { $eq: ["$is_deleted", false] }
                                        ]
                                    }
                                }
                            },
                            { $sort: { createdAt: -1 } }
                        ],
                        as: "payment"
                    }
                },
                {
                    $addFields: {
                        payment: {
                            $cond: {
                                if: { $isArray: "$payment" },
                                then: {
                                    $map: {
                                        input: "$payment",
                                        as: "pay",
                                        in: {
                                            $mergeObjects: [
                                                "$$pay",
                                                {
                                                    referral_amount: {
                                                        $round: [
                                                            {
                                                                $multiply: [
                                                                    {
                                                                        $divide: [
                                                                            { $ifNull: ["$id_scheme.referralPercentage", 0] },
                                                                            100
                                                                        ]
                                                                    },
                                                                    { $ifNull: ["$$pay.payment_amount", 0] }
                                                                ]
                                                            },
                                                            2
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                },
                                else: []
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$id_scheme_account._id",
                        doc: { $first: "$$ROOT" },
                        total_credited_amount: { $sum: "$credited_amount" },
                        referral_payments: { $push: "$payment" }
                    }
                },
                {
                    $addFields: {
                        "doc.credited_amount": "$total_credited_amount",
                        "doc.payment": {
                            $reduce: {
                                input: "$referral_payments",
                                initialValue: [],
                                in: { $concatArrays: ["$$value", "$$this"] }
                            }
                        }
                    }
                },
                {
                    $replaceRoot: { newRoot: "$doc" }
                },
                {
                    $project: {
                        id_customer: {
                            firstname: 1,
                            lastname: 1,
                            mobile: 1,
                            id_branch: 1
                        },
                        id_employee: {
                            firstname: 1,
                            lastname: 1,
                            mobile: 1,
                            id_branch: 1
                        },
                        id_scheme_account: {
                            _id: 1,
                            scheme_acc_number: 1,
                            total_installments: 1,
                            paymentcount: 1,
                            start_date: 1,
                            maturity_date: 1,
                            firstname: 1,
                            lastname: 1,
                            mobile: 1,
                            id_branch: 1
                        },
                        id_scheme: {
                            scheme_name: 1,
                            description: 1,
                            code: 1,
                            maturity_period: 1,
                            referralPercentage: 1
                        },
                        payment: {
                            paid_installments: 1,
                            payment_amount: 1,
                            total_amt: 1,
                            metal_rate: 1,
                            metal_weight: 1,
                            payment_mode: 1,
                            createdAt: 1,
                            referral_amount: 1
                        },
                        credited_amount: 1,
                        reward_mode: 1,
                        bill_no: 1,
                        total_reward_amt: 1,
                        redeem_amt: 1,
                        balance_amt: 1,
                        createdAt: 1,
                        updatedAt: 1
                    }
                },
                {
                    $sort: { _id: -1 }
                },
                {
                    $facet: {
                        data: [
                            { $skip: documentskip },
                            { $limit: documentlimit }
                        ],
                        totalCount: [{ $count: "count" }]
                    }
                }
            ];
    
            const result = await referralListModel.aggregate(referralPipeline);
            const data = result[0]?.data || [];
            const totalCount = result[0]?.totalCount?.[0]?.count || 0;
    
            return {
                data: {
                    data,
                    walletData,
                    totalCount
                }
            };
        } catch (error) {
            console.error("Error in getRefferal:", error);
            throw new Error("Database error occurred while fetching referral list.");
        }
    }
    

    async getRefferalPayment({ query, documentskip, documentlimit }) {
        try {
          if (!query?.id_scheme_account) {
            return {
              success: false,
              message: "id_scheme_account is required to fetch referral payments.",
            };
          }
      
          const referralPipeline = [
            { $match: query },
      
            // Lookup customer who referred
            {
              $lookup: {
                from: "customers",
                localField: "id_customer",
                foreignField: "_id",
                as: "id_customer",
              },
            },
            { $unwind: { path: "$id_customer", preserveNullAndEmptyArrays: true } },
      
            // Lookup employee
            {
              $lookup: {
                from: "employees",
                localField: "id_employee",
                foreignField: "_id",
                as: "id_employee",
              },
            },
            { $unwind: { path: "$id_employee", preserveNullAndEmptyArrays: true } },
      
            // Lookup scheme account
            {
              $lookup: {
                from: "schemeaccounts",
                localField: "id_scheme_account",
                foreignField: "_id",
                as: "id_scheme_account",
              },
            },
            {
              $unwind: {
                path: "$id_scheme_account",
                preserveNullAndEmptyArrays: true,
              },
            },
      
            // Lookup the customer under the scheme account
            {
              $lookup: {
                from: "customers",
                localField: "id_scheme_account.id_customer",
                foreignField: "_id",
                as: "id_scheme_account.id_customer",
              },
            },
            {
              $addFields: {
                "id_scheme_account.id_customer": {
                  $arrayElemAt: ["$id_scheme_account.id_customer", 0],
                },
              },
            },
      
            // Lookup the scheme
            {
              $lookup: {
                from: "schemes",
                localField: "id_scheme",
                foreignField: "_id",
                as: "id_scheme",
              },
            },
            {
              $addFields: {
                id_scheme: { $arrayElemAt: ["$id_scheme", 0] },
              },
            },
      
            // Add referral_amount field
            {
              $addFields: {
                referral_amount: {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $ifNull: ["$id_scheme.referralPercentage", 0] },
                            100,
                          ],
                        },
                        { $ifNull: ["$payment_amount", 0] },
                      ],
                    },
                    2,
                  ],
                },
              },
            },
      
            // Final projection
            {
              $project: {
                id_customer: {
                  firstname: 1,
                  lastname: 1,
                  mobile: 1,
                  id_branch: 1,
                },
                id_employee: {
                  firstname: 1,
                  lastname: 1,
                  mobile: 1,
                  id_branch: 1,
                },
                id_scheme_account: {
                  _id: 1,
                  scheme_acc_number: 1,
                  total_installments: 1,
                  paymentcount: 1,
                  start_date: 1,
                  maturity_date: 1,
                  paid_installments: 1, // ✅ pull from schemeaccount
                },
                id_scheme: {
                  scheme_name: 1,
                  description: 1,
                  scheme_type: 1,
                  code: 1,
                  maturity_period: 1,
                  referralPercentage: 1,
                },
                payment_receipt: 1,
                payment_amount: 1,
                total_amt: 1,
                metal_rate: 1,
                metal_weight: 1,
                payment_mode: 1,
                createdAt: 1,
                referral_amount: 1,
                payment_status: 1,
                remarks: 1,
              },
            },
      
            {
              $facet: {
                data: [
                  { $sort: { _id: -1 } },
                  { $skip: documentskip },
                  { $limit: documentlimit },
                ],
                totalCount: [{ $count: "count" }],
              },
            },
          ];
      
          const result = await paymentModel.aggregate(referralPipeline);
          const data = result[0]?.data || [];
          const totalCount = result[0]?.totalCount[0]?.count || 0;
      
          return {
            data: {
              data,
              totalCount,
            },
          };
        } catch (error) {
          console.error("Error in getRefferalpayment:", error);
          throw new Error(
            "Database error occurred while fetching referralpayment list."
          );
        }
      }
      

      async getWalletData(query) {
        try {
            const walletData = await walletModel.aggregate([
                {
                    $match: {
                        mobile: String(query.mobile)
                    }
                },
                {
                    $project: {
                        total_reward_amt: 1,
                        redeem_amt: 1,
                        id_customer: 1
                    }
                },
                {
                    $lookup: {
                        from: "walletlists",
                        let: { walletId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$wallet_id", "$$walletId"] }
                                }
                            },
                            {
                                $project: {
                                    credited_amount: 1,
                                    createdAt: 1,
                                    type: { $literal: "wallet" } // Add type identifier
                                }
                            }
                        ],
                        as: "wallethistory"
                    }
                },
                {
                    $lookup: {
                        from: "referrallists",
                        let: { customerId: "$id_customer" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ["$id_customer", "$$customerId"] }
                                }
                            },
                            {
                                $lookup: {
                                    from: "schemeaccounts",
                                    let: { schemeId: "$id_scheme_account" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ["$_id", "$$schemeId"] }
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: "customers",
                                                let: { customerId: "$id_customer" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: { $eq: ["$_id", "$$customerId"] }
                                                        }
                                                    },
                                                    {
                                                        $project: {
                                                            firstname: 1
                                                        }
                                                    }
                                                ],
                                                as: "customer"
                                            }
                                        },
                                        {
                                            $unwind: "$customer"
                                        },
                                        {
                                            $project: {
                                                "customer.firstname": 1
                                            }
                                        }
                                    ],
                                    as: "schemeAccount"
                                }
                            },
                            {
                                $unwind: "$schemeAccount"
                            },
                            {
                                $project: {
                                    credited_amount: 1,
                                    referredCustomerFirstName: "$schemeAccount.customer.firstname",
                                    createdAt: 1,
                                    type: { $literal: "referral" } // Add type identifier
                                }
                            }
                        ],
                        as: "referralData"
                    }
                },
                {
                    $project: {
                        total_reward_amt: 1,
                        redeem_amt: 1,
                        transactionHistory: {
                            $concatArrays: ["$wallethistory", "$referralData"]
                        }
                    }
                },
                {
                    $addFields: {
                        transactionHistory: {
                            $sortArray: {
                                input: "$transactionHistory",
                                sortBy: { createdAt: -1 }
                            }
                        }
                    }
                }
            ]);
    
            return walletData.length > 0 ? walletData[0] : null;
    
        } catch (error) {
            console.error("Error in getWalletData:", error.message);
            return null;
        }
    }
    
    async creditAmount(id,data) {
        try {
           const updatedData =await walletModel.updateOne(
            { _id: id },
            { $inc: { balance_amt: data,total_reward_amt:data } }
          );
    
          if(updatedData.modifiedCount === 0){
            return null
          }
    
          return true
        } catch (error) {
            console.error("Error in getWalletData:", error.message);
            return null;
        }
    } 
    
}

export default WalletRepository;
