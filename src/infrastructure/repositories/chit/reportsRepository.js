import schemeAccountModel from "../../models/chit/schemeAccountModel.js";
import Scheme from "../../models/chit/schemeModel.js";
import SchemePayment from "../../models/chit/paymentModel.js";
import giftItemModel from "../../models/chit/giftItemModel.js";
import mongoose from "mongoose";
import paymentModel from "../../models/chit/paymentModel.js";
import referralListModel from "../../models/chit/referralListModel.js";
import schemeModel from "../../models/chit/schemeModel.js";

class ReportRepository {
  async overAllReport(filter, skip, pageSize, sort = {}, dateFilter) {

    const sortField = Object.keys(sort)[0] || "createdAt";
    const sortOrder = sort[sortField] === "asc" ? 1 : -1;
  
    try {
      const result = await Scheme.aggregate([
        { 
          $match: {
            ...filter,
            // ...dateFilter 
          } 
        },
  
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "_id",
            foreignField: "id_scheme",
            as: "SchemeAccount",
          },
        },
  
        {
          $addFields: {
            SchemeAccount: {
              $filter: {
                input: "$SchemeAccount",
                as: "account",
                cond: {
                  $and: [
                    dateFilter.createdAt?.$gte ? {
                      $gte: ["$$account.createdAt", dateFilter.createdAt.$gte]
                    } : true,
                    dateFilter.createdAt?.$lte ? {
                      $lte: ["$$account.createdAt", dateFilter.createdAt.$lte]
                    } : true
                  ]
                }
              }
            }
          }
        },
  
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "Branch",
          },
        },
        { $unwind: { path: "$Branch", preserveNullAndEmptyArrays: true } },
  
        {
          $addFields: {
            closedSchemeAccountIds: {
              $map: {
                input: {
                  $filter: {
                    input: "$SchemeAccount",
                    as: "account",
                    cond: { $eq: ["$$account.status", 1] },
                  },
                },
                as: "closedAccount",
                in: "$$closedAccount._id",
              },
            },
            refundSchemeAccountIds: {
              $map: {
                input: {
                  $filter: {
                    input: "$SchemeAccount",
                    as: "account",
                    cond: { $eq: ["$$account.status", 4] },
                  },
                },
                as: "refundAccount",
                in: "$$refundAccount._id",
              },
            },
            preCloseSchemeAccountIds: {
              $map: {
                input: {
                  $filter: {
                    input: "$SchemeAccount",
                    as: "account",
                    cond: { $eq: ["$$account.status", 3] },
                  },
                },
                as: "precloseAccount",
                in: "$$precloseAccount._id",
              },
            },
            openSchemeAccountIds: {
              $map: {
                input: {
                  $filter: {
                    input: "$SchemeAccount",
                    as: "account",
                    cond: { $eq: ["$$account.status", 0] },
                  },
                },
                as: "openAccount",
                in: "$$openAccount._id",
              },
            },
            totalOpenAccount: {
              $size: {
                $filter: {
                  input: "$SchemeAccount",
                  as: "account",
                  cond: { $eq: ["$$account.status", 0] },
                },
              },
            },
            totalCloseAccount: {
              $size: {
                $filter: {
                  input: "$SchemeAccount",
                  as: "account",
                  cond: { $eq: ["$$account.status", 1] },
                },
              },
            },
            totalPreCloseAccount: {
              $size: {
                $filter: {
                  input: "$SchemeAccount",
                  as: "account",
                  cond: { $eq: ["$$account.status", 3] },
                },
              },
            },
            totalRefundAccount: {
              $size: {
                $filter: {
                  input: "$SchemeAccount",
                  as: "account",
                  cond: { $eq: ["$$account.status", 4] },
                },
              },
            },
          },
        },
  
        // Payments lookups
        {
          $lookup: {
            from: "payments",
            localField: "closedSchemeAccountIds",
            foreignField: "id_scheme_account",
            as: "ClosedPayments",
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "refundSchemeAccountIds",
            foreignField: "id_scheme_account",
            as: "RefundPayments",
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "preCloseSchemeAccountIds",
            foreignField: "id_scheme_account",
            as: "PreClosePayments",
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "openSchemeAccountIds",
            foreignField: "id_scheme_account",
            as: "OpenPayments",
          },
        },
  
        // Add totals
        {
          $addFields: {
            totalCloseAmount: { $sum: "$ClosedPayments.payment_amount" },
            totalRefundAmount: { $sum: "$RefundPayments.payment_amount" },
            totalPreCloseAmount: { $sum: "$PreClosePayments.payment_amount" },
            totalOpenAmount: { $sum: "$OpenPayments.payment_amount" },
            closedWeight: { $sum: "$ClosedPayments.metal_weight" },
            totalPaidAccounts: {
              $size: {
                $ifNull: [
                  {
                    $setUnion: [
                      {
                        $map: {
                          input: "$OpenPayments",
                          as: "payment",
                          in: "$$payment.id_scheme_account",
                        },
                      },
                    ],
                  },
                  [],
                ],
              },
            },
          },
        },
  
        {
          $facet: {
            paginatedData: [
              { $sort: { [sortField]: sortOrder } }, // sort first
              { $skip: skip },
              { $limit: pageSize },
              {
                $project: {
                  scheme_name: 1,
                  Branch_name: "$Branch.branch_name",
                  totalOpenAccount: 1,
                  totalPaidAccounts: 1,
                  closedWeight: 1,
                  totalCloseAccount: 1,
                  totalPreCloseAccount: 1,
                  totalRefundAccount: 1,
                  totalCloseAmount: 1,
                  totalRefundAmount: 1,
                  totalPreCloseAmount: 1,
                  totalOpenAmount: 1,
                  code: 1,
                },
              },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
      ]);
      console.dir(result,"kd")
  
      const data = result[0].paginatedData;
      const totalDocs = result[0].totalCount[0]?.count || 0;
      const totalPages = Math.ceil(totalDocs / pageSize);
  
      return { data, totalDocs, totalPages };
    } catch (err) {
      throw err;
    }
  }

  // async pendingDuePayment(page, limit, query, sort = {}) {
  //   try {
  //     console.log(query
        
  //     )
  //     const sortField = Object.keys(sort)[0] || "_id";
  //     const sortOrder = sort[sortField] === "desc" ? -1 : 1;
  //     const currentDate = new Date();

  //     const dueData = await schemeAccountModel.aggregate([
  //       { $match: query },

  //       {
  //         $lookup: {
  //           from: "schemes",
  //           localField: "id_scheme",
  //           foreignField: "_id",
  //           as: "Scheme",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "schemeclassifications",
  //           localField: "id_classification",
  //           foreignField: "_id",
  //           as: "Classification",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "customers",
  //           localField: "id_customer",
  //           foreignField: "_id",
  //           as: "Customer",
  //         },
  //       },
  //       { $unwind: "$Scheme" },
  //       { $unwind: "$Classification" },
  //       { $unwind: "$Customer" },
  //       {
  //         $addFields: {
  //           schemeAccountIdStr: { $toString: "$_id" },
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "payments",
  //           let: { schemeAccountId: "$schemeAccountIdStr" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
  //               },
  //             },
  //             { $sort: { createdAt: -1 } },
  //           ],
  //           as: "paymentsData",
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalPaidAmount: { $sum: "$paymentsData.payment_amount" },
  //           totalPaidWeight: { $sum: "$paymentsData.metal_weight" },
  //           // totalPaidInstallment: {
  //           //   $sum: "$paymentsData.paid_installments"
  //           // },
  //           lastPaymentCreatedAt: { $first: "$paymentsData.createdAt" },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           referenceDate: {
  //             $ifNull: ["$lastPaymentCreatedAt", "$start_date"],
  //           },
  //           daysSinceLastPayment: {
  //             $dateDiff: {
  //               startDate: {
  //                 $ifNull: ["$lastPaymentCreatedAt", "$start_date"],
  //               },
  //               endDate: currentDate,
  //               unit: "day",
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           expectedInstallmentsSinceLastPayment: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 1] },
  //                   then: {
  //                     $dateDiff: {
  //                       startDate: "$referenceDate",
  //                       endDate: currentDate,
  //                       unit: "month",
  //                     },
  //                   },
  //                 },
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 2] },
  //                   then: {
  //                     $floor: {
  //                       $divide: [
  //                         {
  //                           $dateDiff: {
  //                             startDate: "$referenceDate",
  //                             endDate: currentDate,
  //                             unit: "day",
  //                           },
  //                         },
  //                         7,
  //                       ],
  //                     },
  //                   },
  //                 },
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 3] }, // Daily
  //                   then: {
  //                     $dateDiff: {
  //                       startDate: "$referenceDate",
  //                       endDate: currentDate,
  //                       unit: "day",
  //                     },
  //                   },
  //                 },
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 4] }, // Yearly
  //                   then: {
  //                     $dateDiff: {
  //                       startDate: "$referenceDate",
  //                       endDate: currentDate,
  //                       unit: "year",
  //                     },
  //                   },
  //                 },
  //               ],
  //               default: 0,
  //             },
  //           },
  //         },
  //       },

  //       // Overdue calculation
  //       {
  //         $addFields: {
  //           installmentDue: {
  //             $max: [
  //               {
  //                 $subtract: [
  //                   "$expectedInstallmentsSinceLastPayment",
  //                   {
  //                     $cond: [{ $eq: ["$lastPaymentCreatedAt", null] }, 0, 1],
  //                   },
  //                 ],
  //               },
  //               0,
  //             ],
  //           },
  //           isOverdue: {
  //             $gt: [
  //               {
  //                 $subtract: [
  //                   "$expectedInstallmentsSinceLastPayment",
  //                   {
  //                     $cond: [{ $eq: ["$lastPaymentCreatedAt", null] }, 0, 1],
  //                   },
  //                 ],
  //               },
  //               0,
  //             ],
  //           },
  //         },
  //       },

  //       // Filter only overdue
  //       { $match: { isOverdue: true } },

  //       // Pagination and output
  //       {
  //         $facet: {
  //           metadata: [{ $count: "total" }],
  //           data: [
  //             { $skip: (page - 1) * limit },
  //             { $limit: limit },
  //             { $sort: { [sortField]: sortOrder } },
  //             {
  //               $project: {
  //                 _id: 1,
  //                 scheme_name: "$Scheme.scheme_name",
  //                 classification_name: "$Classification.name",
  //                 customer_name: {
  //                   $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
  //                 },
  //                 customer_mobile: "$Customer.mobile",
  //                 lastPaidDate: "$lastPaymentCreatedAt",
  //                 daysSinceLastPayment: 1,
  //                 installmentDue: 1,
  //                 paid_installments: 1,
  //                 total_installments: 1,
  //                 scheme_acc_number: 1,
  //                 account_name: 1,
  //                 maturity_date: 1,
  //                 createdAt: 1,
  //                 totalPaidAmount: 1,
  //                 totalPaidWeight: 1,
  //                 isOverdue: 1,
  //                 amount: 1,
  //                 weight: 1,
  //               },
  //             },
  //           ],
  //         },
  //       },
  //     ]);

  //     const totalDocuments = dueData[0]?.metadata[0]?.total || 0;
  //     const data = dueData[0]?.data || [];
  //     return { totalDocuments, data };
  //   } catch (error) {
  //     console.error("Error in pendingDuePayment:", error);
  //     throw error;
  //   }
  // }
  async pendingDuePayment(page, limit, query, sort = {}) {
    try {
      const sortField = Object.keys(sort)[0] || "_id";
      const sortOrder = sort[sortField] === "desc" ? -1 : 1;
      const currentDate = new Date();

      const modifiedQuery = {
        ...query,
        status: 0,
        active: true
      };

      const dueData = await schemeAccountModel.aggregate([
        { $match: modifiedQuery },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: "$Scheme" },
        { $match: { "Scheme.scheme_type": { $nin: [10, 14] } } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: "$Classification" },
        { $unwind: "$Customer" },
        {
          $addFields: {
            schemeAccountIdStr: { $toString: "$_id" },
          },
        },
        {
          $lookup: {
            from: "payments",
            let: { schemeAccountId: "$schemeAccountIdStr" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
                },
              },
              { $sort: { createdAt: -1 } },
            ],
            as: "paymentsData",
          },
        },
        {
          $addFields: {
            totalPaidAmount: { $sum: "$paymentsData.payment_amount" },
            totalPaidWeight: { $sum: "$paymentsData.metal_weight" },
            lastPaymentCreatedAt: { $first: "$paymentsData.createdAt" },
            hasPayments: { $gt: [{ $size: "$paymentsData" }, 0] },
          },
        },
        {
          $addFields: {
            referenceDate: {
              $ifNull: ["$lastPaymentCreatedAt", "$start_date"],
            },
            daysSinceLastPayment: {
              $dateDiff: {
                startDate: {
                  $ifNull: ["$lastPaymentCreatedAt", "$start_date"],
                },
                endDate: currentDate,
                unit: "day",
              },
            },
          },
        },
        {
          $addFields: {
            expectedInstallmentsSinceLastPayment: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Scheme.installment_type", 1] }, // Monthly
                    then: {
                      $dateDiff: {
                        startDate: "$referenceDate",
                        endDate: currentDate,
                        unit: "month",
                      },
                    },
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 2] }, // Weekly
                    then: {
                      $floor: {
                        $divide: [
                          {
                            $dateDiff: {
                              startDate: "$referenceDate",
                              endDate: currentDate,
                              unit: "day",
                            },
                          },
                          7,
                        ],
                      },
                    },
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 3] }, // Daily
                    then: {
                      $dateDiff: {
                        startDate: "$referenceDate",
                        endDate: currentDate,
                        unit: "day",
                      },
                    },
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 4] }, // Yearly
                    then: {
                      $dateDiff: {
                        startDate: "$referenceDate",
                        endDate: currentDate,
                        unit: "year",
                      },
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            installmentDue: {
              $max: [
                {
                  $subtract: [
                    "$expectedInstallmentsSinceLastPayment",
                    { $cond: ["$hasPayments", 1, 0] }
                  ],
                },
                0,
              ],
            },
            isOverdue: {
              $or: [
                { $eq: ["$hasPayments", false] },
                {
                  $gt: [
                    {
                      $subtract: [
                        "$expectedInstallmentsSinceLastPayment",
                        { $cond: ["$hasPayments", 1, 0] }
                      ],
                    },
                    0,
                  ],
                },
              ],
            },
          },
        },
        { $match: { isOverdue: true } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              { $sort: { [sortField]: sortOrder } },
              {
                $project: {
                  _id: 1,
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  lastPaidDate: "$lastPaymentCreatedAt",
                  daysSinceLastPayment: 1,
                  installmentDue: 1,
                  paid_installments: 1,
                  total_installments: 1,
                  scheme_acc_number: 1,
                  account_name: 1,
                  maturity_date: 1,
                  createdAt: 1,
                  totalPaidAmount: 1,
                  totalPaidWeight: 1,
                  isOverdue: 1,
                  amount: 1,
                  weight: 1,
                  hasPayments: 1,
                },
              },
            ],
          },
        },
      ]);

      const totalDocuments = dueData[0]?.metadata[0]?.total || 0;
      const data = dueData[0]?.data || [];
     const  totalPages= Math.ceil(totalDocuments / limit)
      const currentPage= page
      
      return { totalDocuments,totalPages,currentPage, data };
    } catch (error) {
      console.error("Error in pendingDuePayment:", error);
      throw error;
    }
  }

  async accountSummary(query, search, skip, limit) {
    try {
      const handleSearch = search
        ? {
            $or: [
              { "Customer.firstname": { $regex: search, $options: "i" } },
              { "Customer.lastname": { $regex: search, $options: "i" } },
              { "Customer.mobile": { $regex: search, $options: "i" } },
              { "Scheme.scheme_name": { $regex: search, $options: "i" } },
              { "Classification.name": { $regex: search, $options: "i" } },
              { "Status.status_name": { $regex: search, $options: "i" } },
              { totalChitValue: { $regex: search, $options: "i" } },
              { totalPaidAmount: { $regex: search, $options: "i" } },
              { totalDueAmount: { $regex: search, $options: "i" } },
              { totalPayableAmount: { $regex: search, $options: "i" } },
              { installementType: { $regex: search, $options: "i" } },
            ],
          }
        : {};
      const accountSummary = await schemeAccountModel.aggregate([
        { $match: query },

        // Lookup related data
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },

        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },

        {
          $unwind: {
            path: "$Scheme",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$Customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Lookup scheme status
        {
          $addFields: {
            statusString: { $toString: "$status" },
          },
        },
        {
          $lookup: {
            from: "schemestatuses",
            localField: "statusString",
            foreignField: "id_status",
            as: "Status",
          },
        },
        {
          $unwind: {
            path: "$Status",
            preserveNullAndEmptyArrays: true,
          },
        },

        // get installment type eg monthly daily yearly
        {
          $addFields: {
            schemeInstallmentType: "$Scheme.installment_type",
          },
        },
        {
          $lookup: {
            from: "installmenttypes",
            localField: "schemeInstallmentType",
            foreignField: "installment_type",
            as: "Installment_type",
          },
        },
        {
          $unwind: {
            path: "$Installment_type",
            preserveNullAndEmptyArrays: true,
          },
        },

        // Lookup last payment for "Flexi-Fixed" classification
        {
          $lookup: {
            from: "payments",
            let: { schemeAccountId: "$_id", customerId: "$id_customer" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
                      { $eq: ["$id_customer", "$$customerId"] },
                    ],
                  },
                },
              },
              { $sort: { payment_date: -1 } },
              { $limit: 1 },
            ],
            as: "lastPayment",
          },
        },
        {
          $addFields: {
            lastPaidAmount: {
              $ifNull: [
                { $arrayElemAt: ["$lastPayment.payment_amount", 0] },
                0,
              ],
            },
          },
        },

        // Lookup all payments to calculate total paid amount
        {
          $lookup: {
            from: "payments",
            let: { schemeAccountId: "$_id", customerId: "$id_customer" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
                      { $eq: ["$id_customer", "$$customerId"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$id_scheme_account",
                  totalPaidAmount: { $sum: "$payment_amount" },
                },
              },
            ],
            as: "totalPayments",
          },
        },
        {
          $addFields: {
            totalPaidAmount: {
              $ifNull: [
                { $arrayElemAt: ["$totalPayments.totalPaidAmount", 0] },
                0,
              ],
            },
          },
        },

        // Compute total chit value based on classification

        {
          $addFields: {
            totalChitValue: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Classification.name", "Fixed"] },
                    then: { $multiply: ["$amount", "$total_installments"] },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi"] },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.min_amount",
                              "$total_installments",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.max_amount",
                              "$total_installments",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$Classification.name", "Flexi-Fixed"] },
                        {
                          $or: [
                            { $eq: ["$lastPaidAmount", 0] },
                            { $eq: ["$lastPaidAmount", null] },
                          ],
                        },
                      ],
                    },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.min_amount",
                              "$total_installments",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.max_amount",
                              "$total_installments",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi-Fixed"] },
                    then: {
                      $multiply: ["$lastPaidAmount", "$total_installments"],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },

        // Compute total due amount
        {
          $addFields: {
            totalDueAmount: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Classification.name", "Fixed"] },
                    then: {
                      $subtract: ["$totalChitValue", "$totalPaidAmount"],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi"] },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.min_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.max_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: {
                      $and: [
                        { $eq: ["$Classification.name", "Flexi-Fixed"] },
                        {
                          $or: [
                            { $eq: ["$lastPaidAmount", 0] },
                            { $eq: ["$lastPaidAmount", null] },
                          ],
                        },
                      ],
                    },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.min_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.max_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },

        // Compute total due amount based on classification
        {
          $addFields: {
            totalDueAmount: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Classification.name", "Fixed"] },
                    then: {
                      $subtract: ["$totalChitValue", "$totalPaidAmount"],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi"] },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.min_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.max_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi-Fixed"] },
                    then: {
                      $subtract: ["$totalChitValue", "$totalPaidAmount"],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },

        // Total payable amount
        {
          $addFields: {
            totalPayableAmount: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Classification.name", "Fixed"] },
                    then: {
                      $subtract: ["$totalChitValue", "$totalPaidAmount"],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi"] },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.min_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $subtract: [
                              {
                                $multiply: [
                                  "$Scheme.max_amount",
                                  "$total_installments",
                                ],
                              },
                              "$totalPaidAmount",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi-Fixed"] },
                    then: {
                      $subtract: ["$totalChitValue", "$totalPaidAmount"],
                    },
                  },
                ],
                default: 0,
              },
            },
          },
        },

        // Lookup payment history
        {
          $lookup: {
            from: "payments",
            let: { schemeAccountId: "$_id", customerId: "$id_customer" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
                      { $eq: ["$id_customer", "$$customerId"] },
                    ],
                  },
                },
              },
              { $sort: { payment_date: -1 } }, // Sort by recent payments
            ],
            as: "paymentHistory",
          },
        },

        {
          $lookup: {
            from: "paymentmodes",
            localField: "paymentHistory.payment_mode",
            foreignField: "_id",
            as: "PaymnetMode",
          },
        },

        {
          $match: handleSearch,
        },

        // Final projection
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  Status: "$Status.status_name",
                  installementType: "$Installment_type.installment_name",
                  totalChitValue: 1,
                  totalPaidAmount: 1,
                  totalDueAmount: 1,
                  totalPayableAmount: 1,
                  paymentHistory: {
                    $map: {
                      input: "$paymentHistory",
                      as: "payment",
                      in: {
                        date_payment: "$$payment.date_payment",
                        payment_amount: "$$payment.payment_amount",
                        payment_mode: {
                          $arrayElemAt: [
                            {
                              $map: {
                                input: {
                                  $filter: {
                                    input: "$PaymnetMode",
                                    as: "mode",
                                    cond: {
                                      $eq: [
                                        "$$mode._id",
                                        "$$payment.payment_mode",
                                      ],
                                    },
                                  },
                                },
                                as: "filteredMode",
                                in: "$$filteredMode.mode_name",
                              },
                            },
                            0,
                          ],
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ]);

      const totalDocuments = accountSummary[0]?.metadata[0]?.total || 0;
      const data = accountSummary[0]?.data || [];
      return { totalDocuments, data };
    } catch (err) {
      throw err;
    }
  }

  async getPaymentReport(query = {}, skip, limit, sort = {}) {
    try {
      const sortField = (sort && Object.keys(sort)[0]) || "createdAt";
      const sortOrder = sort && sort[sortField] === "asc" ? 1 : -1;

      const paymentReport = await SchemePayment.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        {
          $lookup: {
            from: "paymentmodes",
            foreignField: "_id",
            localField: "payment_mode",
            as: "PaymentMode",
          },
        },
        {
          $lookup: {
            from: "paymentorders",
            foreignField: "orderId",
            localField: "id_transaction",
            as: "paymentOrders",
          },
        },
        { $unwind: { path: "$PaymentMode", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$paymentOrders", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "Scheme.id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "SchemeAccount",
          },
        },
        {
          $unwind: {
            path: "$SchemeAccount",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Add this new stage to handle the id_transaction logic
        {
          $addFields: {
            id_transaction: {
              $cond: {
                if: { $ifNull: ["$paymentOrders.cf_payment_id", false] },
                then: "$paymentOrders.cf_payment_id",
                else: "$id_transaction"
              }
            },
            totalPaidInstallment: "$paid_installments", // just aliasing for consistency
          },
        },
        {
          $facet: {
            metadata: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  totalPaidInstallments: { $sum: "$paid_installments" },
                },
              },
            ],
            data: [
              { $sort: { [sortField]: sortOrder } },
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  scheme_name: "$Scheme.scheme_name",
                  schemeType:"$Scheme.scheme_type",
                  classification_name: "$Classification.name",
                  customer_name: {
                    $cond: {
                      if: { $ne: ["$Customer.lastname", null] },
                      then: {
                        $concat: [
                          "$Customer.firstname",
                          " ",
                          "$Customer.lastname",
                        ],
                      },
                      else: "$Customer.firstname",
                    },
                  },
                  customer_mobile: "$Customer.mobile",
                  payment_mode: "$PaymentMode.mode_name",
                  accounter_name: "$SchemeAccount.account_name",
                  total_installments: "$SchemeAccount.total_installments",
                  schemeAccNo: "$SchemeAccount.scheme_acc_number",
                  payment_amount: 1,
                  id_transaction: 1,
                  payment_receipt: 1,
                  createdAt: 1,
                  totalPaidInstallment: "$installment",
                },
              },
            ],
          },
        },
      ]);

      const meta = paymentReport[0]?.metadata[0] || {};
      const totalDocuments = meta.total || 0;
      const totalPaidInstallments = meta.totalPaidInstallments || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = paymentReport[0]?.data || [];

      return { totalDocuments, totalPages, totalPaidInstallments, data };
    } catch (err) {
      throw err;
    }
  }

  // async getPaymentLedger(query = {}, skip = 0, limit = 10) {
  //   try {
  //     const basePipeline = [
  //       { $match: query },
  //       {
  //         $lookup: {
  //           from: "schemes",
  //           localField: "id_scheme",
  //           foreignField: "_id",
  //           as: "Scheme",
  //         },
  //       },
  //       { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: "paymentmodes",
  //           foreignField: "_id",
  //           localField: "payment_mode",
  //           as: "PaymentMode",
  //         },
  //       },
  //       { $unwind: { path: "$PaymentMode", preserveNullAndEmptyArrays: true } },
  //     ];

  //     // Create data pipeline
  //     const dataPipeline = [...basePipeline];
      
  //     if (query.payment_mode) {
  //       dataPipeline.push(
  //         {
  //           $group: {
  //             _id: {
  //               schemeId: "$id_scheme",
  //               schemeName: "$Scheme.scheme_name",
  //             },
  //             totalAmount: { $sum: "$payment_amount" },
  //             paymentCount: { $sum: 1 },
  //             paymentMode: { $first: "$PaymentMode" },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             schemeId: "$_id.schemeId",
  //             schemeName: "$_id.schemeName",
  //             totalAmount: 1,
  //             paymentCount: 1,
  //             paymentMode: {
  //               modeId: "$paymentMode._id",
  //               modeName: "$paymentMode.mode_name",
  //             },
  //           },
  //         },
  //         { $sort: { totalAmount: -1 } },
  //         { $skip: skip },
  //         { $limit: limit }
  //       );
  //     } else {
  //       dataPipeline.push(
  //         {
  //           $group: {
  //             _id: {
  //               schemeId: "$id_scheme",
  //               schemeName: "$Scheme.scheme_name",
  //               paymentModeId: "$payment_mode",
  //               paymentModeName: "$PaymentMode.mode_name",
  //             },
  //             totalAmount: { $sum: "$payment_amount" },
  //             paymentCount: { $sum: 1 },
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: {
  //               schemeId: "$_id.schemeId",
  //               schemeName: "$_id.schemeName",
  //             },
  //             paymentModes: {
  //               $push: {
  //                 modeId: "$_id.paymentModeId",
  //                 modeName: "$_id.paymentModeName",
  //                 totalAmount: "$totalAmount",
  //                 paymentCount: "$paymentCount",
  //               },
  //             },
  //             grandTotal: { $sum: "$totalAmount" },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             schemeId: "$_id.schemeId",
  //             schemeName: "$_id.schemeName",
  //             paymentModes: 1,
  //             grandTotal: 1,
  //           },
  //         },
  //         { $sort: { grandTotal: -1 } },
  //         { $skip: skip },
  //         { $limit: limit }
  //       );
  //     }

  //     // Create count pipeline that matches the final grouped structure
  //     const countPipeline = [...basePipeline];
  //     if (query.payment_mode) {
  //       countPipeline.push(
  //         {
  //           $group: {
  //             _id: {
  //               schemeId: "$id_scheme",
  //               schemeName: "$Scheme.scheme_name",
  //             },
  //           },
  //         },
  //         { $count: "totalDocuments" }
  //       );
  //     } else {
  //       countPipeline.push(
  //         {
  //           $group: {
  //             _id: {
  //               schemeId: "$id_scheme",
  //               schemeName: "$Scheme.scheme_name",
  //             },
  //           },
  //         },
  //         { $count: "totalDocuments" }
  //       );
  //     }

  //     const [data, countResult] = await Promise.all([
  //       SchemePayment.aggregate(dataPipeline),
  //       SchemePayment.aggregate(countPipeline)
  //     ]);

  //     const totalDocuments = countResult[0]?.totalDocuments || 0;
  //     const totalPages = Math.ceil(totalDocuments / limit);
  //     const currentPage = Math.floor(skip / limit) + 1;
  //     console.log(data)

  //     return {
  //       data,
  //       totalDocuments,
  //       totalPages,
  //       currentPage,
  //       limit,
  //       hasMore: skip + limit < totalDocuments,
  //     };
  //   } catch (err) {
  //     console.error(err)
  //     throw err;
  //   }
  // }
  async getPaymentLedger(query = {}, skip = 0, limit = 10) {
    try {
      const basePipeline = [
        { $match: query },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "paymentmodes",
            foreignField: "_id",
            localField: "payment_mode",
            as: "PaymentMode",
          },
        },
        { $unwind: { path: "$PaymentMode", preserveNullAndEmptyArrays: true } },
      ];

      // Create data pipeline
      const dataPipeline = [...basePipeline];
      
      if (query.payment_mode) {
        dataPipeline.push(
          {
            $group: {
              _id: {
                schemeId: "$id_scheme",
                schemeName: "$Scheme.scheme_name",
              },
              grandTotal: { $sum: "$payment_amount" },
              paymentModes: {
                $push: {
                  modeId: "$payment_mode",
                  modeName: "$PaymentMode.mode_name",
                  totalAmount: "$payment_amount",
                  paymentCount: 1,
                }
              },
              paymentCount: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              schemeId: "$_id.schemeId",
              schemeName: "$_id.schemeName",
              paymentModes: 1,
              grandTotal: 1,
            },
          },
          { $sort: { grandTotal: -1 } },
          { $skip: skip },
          { $limit: limit }
        );
      } else {
        dataPipeline.push(
          {
            $group: {
              _id: {
                schemeId: "$id_scheme",
                schemeName: "$Scheme.scheme_name",
                paymentModeId: "$payment_mode",
                paymentModeName: "$PaymentMode.mode_name",
              },
              totalAmount: { $sum: "$payment_amount" },
              paymentCount: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: {
                schemeId: "$_id.schemeId",
                schemeName: "$_id.schemeName",
              },
              paymentModes: {
                $push: {
                  modeId: "$_id.paymentModeId",
                  modeName: "$_id.paymentModeName",
                  totalAmount: "$totalAmount",
                  paymentCount: "$paymentCount",
                },
              },
              grandTotal: { $sum: "$totalAmount" },
            },
          },
          {
            $project: {
              _id: 0,
              schemeId: "$_id.schemeId",
              schemeName: "$_id.schemeName",
              paymentModes: 1,
              grandTotal: 1,
            },
          },
          { $sort: { grandTotal: -1 } },
          { $skip: skip },
          { $limit: limit }
        );
      }

      // Create count pipeline that matches the final grouped structure
      const countPipeline = [...basePipeline];
      if (query.payment_mode) {
        countPipeline.push(
          {
            $group: {
              _id: {
                schemeId: "$id_scheme",
                schemeName: "$Scheme.scheme_name",
              },
            },
          },
          { $count: "totalDocuments" }
        );
      } else {
        countPipeline.push(
          {
            $group: {
              _id: {
                schemeId: "$id_scheme",
                schemeName: "$Scheme.scheme_name",
              },
            },
          },
          { $count: "totalDocuments" }
        );
      }

      const [data, countResult] = await Promise.all([
        SchemePayment.aggregate(dataPipeline),
        SchemePayment.aggregate(countPipeline)
      ]);

      const totalDocuments = countResult[0]?.totalDocuments || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      return {
        data,
        totalDocuments,
        totalPages,
        currentPage,
        limit,
        hasMore: skip + limit < totalDocuments,
      };
    } catch (err) {
      console.error(err)
      throw err;
    }
  }

  async getCompletedAccount(skip, limit, query = {}, sort = {}) {
    try {
      const sortField = (sort && Object.keys(sort)[0]) || "createdAt";
      const sortOrder = sort && sort[sortField] === "asc" ? 1 : -1;
      query.status = 2;
      const account = await schemeAccountModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },

        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payment",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $addFields: {
            // totalPaidAmount: {
            //   $sum: "$Payment.payment_amount",
            // },
            totalPaidAmount: "$amount",
            totalPaidWeight: "$weight",
          },
        },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { [sortField]: sortOrder } },
              { $skip: Number(skip) },
              { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  createdAt: 1,
                  gift_issues: 1,
                  completedDate: "$last_paid_date",
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  maturity_date: 1,
                  totalPaidAmount: 1,
                  totalPaidWeight: 1,
                  added_by: {
                    $switch: {
                      branches: [
                        { case: { $eq: ["$added_by", 0] }, then: "Web Admin" },
                        { case: { $eq: ["$added_by", 1] }, then: "Android" },
                        { case: { $eq: ["$added_by", 2] }, then: "iOS" },
                      ],
                      default: "Unknown",
                    },
                  },
                },
              },
            ],
          },
        },
      ]);

      const totalDocuments = account[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = account[0]?.data || [];

      return { totalDocuments, totalPages, data };
    } catch (err) {
    console.error(err);
      throw new Error("Failed to get completed Account data");
    }
  }

  async getPreCloseReport(query, skip, limit, sort = {}) {
    try {
      query.status = 3;
      const sortField = (sort && Object.keys(sort)[0]) || "createdAt";
      const sortOrder = sort && sort[sortField] === "asc" ? 1 : -1;

      const preCloseData = await schemeAccountModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            total_paid_installments: { $sum: "$Payments.paid_installments" },
            totalPaidAmount: { $sum: "$Payments.payment_amount" },
            totalPaidWeight: { $sum: "$Payments.metal_weight" },
          },
        },
        {
          $lookup: {
            from: "closeaccbills",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "CloseBill",
          },
        },
        { $unwind: { path: "$CloseBill", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "employees",
            localField: "CloseBill.closed_by",
            foreignField: "_id",
            as: "Employee",
          },
        },
        { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: true } },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { [sortField]: sortOrder } },
              { $skip: Number(skip) },
              { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  last_paid_date: 1,
                  maturity_date: 1,
                  gift_issues: 1,
                  createdAt: 1,
                  total_installments: 1,
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  classification_name: "$Classification.name",
                  scheme_name: "$Scheme.scheme_name",
                  total_paid_installments: "$paid_installments",
                  totalPaidAmount: "$amount",
                  totalPaidWeight: "$weight",
                  closed_date: "$CloseBill.createdAt",
                  close_amount: "$CloseBill.amount",
                  bill_no: "$CloseBill.bill_no",
                  bill_date: "$CloseBill.bill_date",
                  closed_by: {
                    $ifNull: [
                      {
                        $concat: [
                          "$Employee.firstname",
                          " ",
                          "$Employee.lastname",
                        ],
                      },
                      "Unknown",
                    ],
                  },
                  closedDate: "$closed_date",
                },
              },
            ],
          },
        },
      ]);

      const totalDocuments = preCloseData[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = preCloseData[0]?.data || [];

      return { totalDocuments, totalPages, data };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getCloseReport(query, skip, limit, sort = {}) {
    try {
      query.status = 1;
      const sortField = (sort && Object.keys(sort)[0]) || "createdAt";
      const sortOrder = sort && sort[sortField] === "asc" ? 1 : -1;

      const preCloseData = await schemeAccountModel.aggregate([
        { $match: query },

        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        {
          $unwind: {
            path: "$Customer",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $unwind: {
            path: "$Scheme",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            total_paid_installments: {
              $sum: "$Payments.paid_installments",
            },
            totalPaidAmount: {
              $sum: "$Payments.payment_amount",
            },
            totalPaidWeight: {
              $sum: "$Payments.metal_weight",
            },
          },
        },

        {
          $lookup: {
            from: "closeaccbills",
            let: { accId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$id_scheme_account", "$$accId"] } } },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "CloseBill",
          },
        },
        {
          $unwind: {
            path: "$CloseBill",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "employees",
            localField: "CloseBill.closed_by",
            foreignField: "_id",
            as: "Employee",
          },
        },
        {
          $unwind: {
            path: "$Employee",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { [sortField]: sortOrder } },
              { $skip: Number(skip) },
              { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  last_paid_date: 1,
                  maturity_date: 1,
                  gift_issues: 1,
                  createdAt: 1,
                  total_installments: {
                    $cond: {
                      if: { $in: ["$Scheme.scheme_type", [10, 14]] },
                      then: "$Scheme.noOfDays",
                      else: "$Scheme.total_installments",
                    },
                  },
                  customer_name: {
                    $concat: [
                      "$Customer.firstname",
                      " ",
                      { $ifNull: ["$Customer.lastname", ""] },
                    ],
                  },
                  customer_mobile: "$Customer.mobile",
                  classification_name: "$Classification.name",
                  scheme_name: "$Scheme.scheme_name",
                  // total_paid_installments: 1,
                  total_paid_installments: "$paid_installments",
                  // totalPaidAmount: 1,
                  // totalPaidWeight: 1,
                  totalPaidAmount: "$amount",
                  totalPaidWeight: "$weight",
                  closed_date: "$CloseBill.createdAt",
                  close_amount: "$CloseBill.amount",
                  bill_no: "$CloseBill.bill_no",
                  bill_date: "$CloseBill.bill_date",
                  closed_by: {
                    $concat: ["$Employee.firstname", " ", "$Employee.lastname"],
                  },
                },
              },
            ],
          },
        },
      ]);

      const totalDocuments = preCloseData[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = preCloseData[0]?.data || [];

      return { totalDocuments, totalPages, data };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getRefendSummary(query, skip, limit, sort = {}) {
    try {
      query.status = 4;
      const sortField = (sort && Object.keys(sort)[0]) || "createdAt";
      const sortOrder = sort && sort[sortField] === "asc" ? 1 : -1;

      const refundData = await schemeAccountModel.aggregate([
        { $match: query },

        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },

        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },

        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },

        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            total_paid_installments: {
              $sum: "$Payments.paid_installments",
            },
            totalPaidAmount: {
              $sum: "$Payments.payment_amount",
            },
            totalPaidWeight: {
              $sum: "$Payments.metal_weight",
            },
          },
        },
        {
          $lookup: {
            from: "closeaccbills",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "CloseBill",
          },
        },
        {
          $unwind: {
            path: "$CloseBill",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "closeaccbills",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "CloseBill",
          },
        },
        {
          $unwind: {
            path: "$CloseBill",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: "employees",
            localField: "CloseBill.closed_by",
            foreignField: "_id",
            as: "Employee",
          },
        },
        {
          $unwind: {
            path: "$Employee",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { [sortField]: sortOrder } },
              { $skip: Number(skip) },
              { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  last_paid_date: 1,
                  maturity_date: 1,
                  gift_issues: 1,
                  createdAt: 1,
                  total_installments: 1,
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  classification_name: "$Classification.name",
                  scheme_name: "$Scheme.scheme_name",
                  // total_paid_installments: 1,
                  // totalPaidAmount: 1,
                  // totalPaidWeight: 1,
                  total_paid_installments: "$paid_installments",
                  totalPaidAmount: "$amount",
                  totalPaidWeight: "$weight",
                  closed_date: "$closed_date",
                  close_amount: "$CloseBill.amount",
                  bill_no: "$CloseBill.bill_no",
                  bill_date: "$CloseBill.bill_date",
                  closed_by: {
                    $concat: ["$Employee.firstname", " ", "$Employee.lastname"],
                  },
                },
              },
            ],
          },
        },
      ]);
      const totalDocuments = refundData[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = refundData[0]?.data || [];

      return { totalDocuments, totalPages, data };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getGiftReport({ query, documentskip, documentlimit }) {
    try {
      if (query.id_branch && typeof query.id_branch === "string") {
        query.id_branch = new mongoose.Types.ObjectId(query.id_branch);
      }

      const documents = await giftItemModel.countDocuments(query);

      const result = await giftItemModel.aggregate([
        // 1. Match based on query
        { $match: query },

        // 2. Lookup purchase records from giftinwards
        {
          $lookup: {
            from: "giftinwards",
            localField: "_id", // giftItemModel._id
            foreignField: "id_gift", // giftinwards.id_gift
            as: "purchaseGifts",
          },
        },

        // 3. Calculate total purchased quantity
        {
          $addFields: {
            totalPurchased: {
              $sum: {
                $map: {
                  input: "$purchaseGifts",
                  as: "g",
                  in: {
                    $ifNull: ["$$g.inward_qty", 0], // Ensure nulls are treated as 0
                  },
                },
              },
            },
          },
        },

        // 4. Lookup total issued quantity from giftissues.gifts subarray
        {
          $lookup: {
            from: "giftissues",
            let: { giftId: "$_id" },
            pipeline: [
              { $unwind: "$gifts" },
              {
                $match: {
                  $expr: {
                    $eq: ["$gifts.id_gift", "$$giftId"],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $ifNull: ["$gifts.qty", 0],
                    },
                  },
                },
              },
            ],
            as: "handoverData",
          },
        },

        // 5. Extract total handover quantity
        {
          $addFields: {
            totalHandovered: {
              $ifNull: [{ $arrayElemAt: ["$handoverData.total", 0] }, 0],
            },
          },
        },

        // 6. Final projection
        {
          $project: {
            _id: 1,
            name: "$gift_name",
            gift_code: 1,
            totalPurchased: 1,
            totalHandovered: 1,
            pendingGifts: {
              $subtract: ["$totalPurchased", "$totalHandovered"],
            },
          },
        },

        // 7. Sort and paginate
        { $sort: { _id: -1 } },
        { $skip: documentskip },
        { $limit: documentlimit },
      ]);

      if (result.length !== 0) {
        return { success: true, result, documents };
      }

      return { success: false, message: "Gift report not found" };
    } catch (error) {
      console.error("Error generating gift report:", error);
      return { success: false, message: "Internal server error", error };
    }
  }

  async paymentReportEdger(filter, skip, limit) {
    try {
      const paymentLedger = await paymentModel.aggregate([
        { $match: filter },

        // Join with schemes to get scheme_name
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },

        // Join with paymentmodes to get mode_name
        {
          $lookup: {
            from: "paymentmodes",
            localField: "payment_mode",
            foreignField: "_id",
            as: "PaymentMode",
          },
        },
        { $unwind: { path: "$PaymentMode", preserveNullAndEmptyArrays: true } },

        // Group by scheme_name and payment_mode
        {
          $group: {
            _id: {
              scheme_name: "$Scheme.scheme_name",
              payment_mode: "$PaymentMode.mode_name",
            },
            totalAmount: { $sum: "$payment_amount" },
          },
        },

        // Format final output
        {
          $project: {
            _id: 0,
            scheme_name: "$_id.scheme_name",
            payment_mode: "$_id.payment_mode",
            totalAmount: 1,
          },
        },
      ]);
      return {
        data: paymentLedger,
      };
    } catch (err) {
      throw err;
    }
  }

  async getAmountPayble(filter, skip, limit) {
    try {
      filter = {
        status: { $in: [0] },
        $or: [{ weight: { $exists: false } }, { weight: null }, { weight: 0 }],
      };

      const amountPaybleData = await schemeAccountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },

        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },

        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payment",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $addFields: {
            totalPaidAmount: {
              $sum: "$Payment.payment_amount",
            },
            totalPaidCount: {
              $sum: "$Payment.paid_installments",
            },
          },
        },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              // { $sort: { [sortField]: sortOrder } },
              // { $skip: Number(skip) },
              // { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  createdAt: 1,
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  maturity_date: 1,
                  totalPaidAmount: 1,
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  totalPaidCount: 1,
                  total_installments: 1,
                },
              },
            ],
          },
        },
      ]);
      const totalDocuments = amountPaybleData[0]?.metadata[0]?.total || 0;
      const totalPages = Math.ceil(totalDocuments / limit);
      const data = amountPaybleData[0]?.data || [];

      return {
        totalDocuments,
        totalPages,
        data,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get Amount payble report");
    }
  }

  async getWeightPayble(filter, skip, limit) {
    try {
      filter = {
        status: { $in: [0, 2] },
        weight: { $gte: 1 },
      };

      const amountPaybleData = await schemeAccountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },

        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },

        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payment",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $unwind: { path: "$Payment", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            totalPaidAmount: {
              $sum: "$Payment.payment_amount",
            },
            totalPaidWeight: {
              $sum: "$Payment.metal_weight",
            },
          },
        },

        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              // { $sort: { [sortField]: sortOrder } },
              // { $skip: Number(skip) },
              // { $limit: Number(limit) },
              {
                $project: {
                  account_name: 1,
                  scheme_acc_number: 1,
                  createdAt: 1,
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  maturity_date: 1,
                  totalPaidAmount: 1,
                  totalPaidWeight: 1,
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                },
              },
            ],
          },
        },
      ]);

      // const totalDocuments = amountPaybleData[0]?.metadata[0]?.total || 0;
      // const totalPages = Math.ceil(totalDocuments / limit);
      // const data = amountPaybleData[0]?.data || [];

      return {
        data: amountPaybleData,
      };
    } catch (err) {
      console.error(err);
      throw new Error("Failed to get Amount payble report");
    }
  }

  async getEmployeeRefferal(filter, skip, limit) {
    try {
      const matchStage = {
        $match: {
          ...filter,
          referred_by: "Employee",
          id_employee: { $exists: true, $ne: null },
        },
      };

      const pipeline = [
        matchStage,
        {
          $lookup: {
            from: "employees",
            localField: "id_employee",
            foreignField: "_id",
            as: "Employee",
          },
        },
        { $unwind: { path: "$Employee", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "SchemeAccount",
          },
        },
        {
          $unwind: { path: "$SchemeAccount", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "customers",
            localField: "SchemeAccount.id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "payments",
            localField: "SchemeAccount._id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $facet: {
            data: [
              {
                $project: {
                  employee_name: {
                    $concat: ["$Employee.firstname", " ", "$Employee.lastname"],
                  },
                  employeeId: "$Employee.employeeId",
                  customer_name: {
                    $concat: [
                      "$Customer.firstname",
                      " ",
                      { $ifNull: ["$Customer.lastname", ""] },
                    ],
                  },
                  customerMobile: "$Customer.mobile",
                  referredDate: "$SchemeAccount.createdAt",
                  ReferralBonuses:"$credited_amount"
                  //  {
                  //   $map: {
                  //     input: "$Payments",
                  //     as: "payment",
                  //     in: {
                  //       amount: {
                  //         $round: [
                  //           { $multiply: ["$$payment.payment_amount", 0.05] },
                  //           2,
                  //         ],
                  //       },
                  //       payment_date: "$$payment.createdAt",
                  //       payment_id: "$$payment._id",
                  //     },
                  //   },
                  // }
                  ,
                  totalBonus:"$credited_amount",
                  //  {
                  //   $round: [
                  //     {
                  //       $reduce: {
                  //         input: "$Payments",
                  //         initialValue: 0,
                  //         in: {
                  //           $add: [
                  //             "$$value",
                  //             { $multiply: ["$$this.payment_amount", 0.05] },
                  //           ],
                  //         },
                  //       },
                  //     },
                  //     2,
                  //   ],
                  // },
                },
              },
              { $skip: skip || 0 },
              { $limit: limit || 50 },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
        {
          $project: {
            data: 1,
            totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          },
        },
      ];

      const result = await referralListModel.aggregate(pipeline);
      return {
        data: result[0]?.data || [],
        totalCount: result[0]?.totalCount || 0,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //amount payable
  async getAmountPayable(filter, skip = 0, limit = 10, type) {
    try {
      if (type === "weight") {
        filter["scheme_type"] = { $in: [12, 3, 4, 2, 5, 6, 10, 14] };
      }
      else {
        filter["scheme_type"] = { $nin: [12, 3, 4, 2, 5, 6, 10, 14] };
      }

      delete filter.createdAt;

      const schemes = await schemeModel.aggregate([
        { $match: { ...filter } },
        {
          $project: {
            _id: 1,
            schemeName: "$name",
            classificationId: "$classification_id",
          },
        },
      ]);

      if (!schemes.length) {
        return { success: false, message: "No schemes found" };
      }

      const fieldToSum = type === 'weight' ? "metal_weight" : "payment_amount";

      // Main aggregation pipeline
      const result = await schemeAccountModel.aggregate([
        {
          $match: {
            id_scheme: { $in: schemes.map((scheme) => scheme._id) },
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            totalCollectedAmount: {
              $sum: `$Payments.${fieldToSum}`
            }
          },
        },
        {
          $match: {
            totalCollectedAmount: { $gt: 0 }
          }
        },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "scheme",
          },
        },
        { $unwind: "$scheme" },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "scheme.id_classification",
            foreignField: "_id",
            as: "classification",
          },
        },
        { $unwind: "$classification" },
        {
          $project: {
            schemeId: "$scheme._id",
            schemeName: "$scheme.scheme_name",
            classificationName: "$classification.name",
            totalCollectedAmount: 1,
          },
        },
        {
          $group: {
            _id: "$schemeId",
            schemeName: { $first: "$schemeName" },
            classificationName: { $first: "$classificationName" },
            totalCollectedAmount: { $sum: "$totalCollectedAmount" },
          },
        },
        {
          $match: {
            totalCollectedAmount: { $gt: 0 }
          }
        },
        { $skip: skip },
        { $limit: limit },
      ]);

      // For total count aggregation - modified to match the same criteria as the main query
      const totalCountAgg = await schemeAccountModel.aggregate([
        {
          $match: {
            id_scheme: { $in: schemes.map((scheme) => scheme._id) },
          },
        },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            totalCollectedAmount: {
              $sum: `$Payments.${fieldToSum}`
            }
          },
        },
        {
          $match: {
            totalCollectedAmount: { $gt: 0 }
          }
        },
        {
          $group: {
            _id: "$id_scheme"
          }
        },
        {
          $count: "totalCount"
        }
      ]);

      const totalCount = totalCountAgg[0]?.totalCount || 0;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const currentPage = Math.floor(skip / limit) + 1;

      return {
        success: true,
        data: result,
        totalPages,
        totalCount,
        currentPage,
      };
    } catch (err) {
      console.error("Error in getAmountPayable:", err);
      throw err;
    }
  }

  async getCustomerRefferal(filter, skip, limit) {
    try {
      const matchStage = {
        $match: {
          ...filter,
          referred_by: "Customer",
          id_customer: { $exists: true, $ne: null },
        },
      };

      const pipeline = [
        matchStage,
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "SchemeAccount",
          },
        },
        {
          $unwind: { path: "$SchemeAccount", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "schemes",
            localField: "SchemeAccount.id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        {
          $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "customers",
            localField: "SchemeAccount.id_customer",
            foreignField: "_id",
            as: "referredCustomer",
          },
        },
        {
          $unwind: {
            path: "$referredCustomer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
            $lookup: {
                from: "payments",
                localField: "SchemeAccount._id",
                foreignField: "id_scheme_account",
                as: "Payments",
                pipeline: [
                    { $match: { status: 1 } }, // Only consider successful payments
                    { $sort: { createdAt: 1 } } // Sort payments by date
                ]
            },
        },
        {
          $project: {
            // employee_name: null, // Since this is customer referral
            customer_name: {
              $concat: [
                "$Customer.firstname",
                " ",
                { $ifNull: ["$Customer.lastname", ""] },
              ],
            },
            customerMobile: "$Customer.mobile",
            referredCusName: {
              $concat: [
                "$referredCustomer.firstname",
                " ",
                { $ifNull: ["$referredCustomer.lastname", ""] },
              ],
            },
            referredCusMobile: "$referredCustomer.mobile",
            referredDate: "$SchemeAccount.createdAt",
            schemeName: "$Scheme.scheme_name",
            minAmount: "$Scheme.min_amount",
            maxAmount: "$Scheme.max_amount",
            mixWeight: "$Scheme.min_weight",
            maxWeight: "$Scheme.max_weight",
            schemeType: "$Scheme.scheme_type",
            ReferralBonuses: {
              $map: {
                input: "$Payments",
                as: "payment",
                in: {
                  amount: {
                    $round: [
                      { $multiply: ["$$payment.payment_amount", 0.05] },
                      2,
                    ],
                  },
                  payment_date: "$$payment.createdAt",
                  payment_id: "$$payment._id",
                  original_payment_amount: "$$payment.payment_amount",
                  original_payment_date: "$$payment.payment_date",
                },
              },
            },
            totalBonus: {
              $round: [
                {
                  $sum: {
                    $map: {
                      input: "$Payments",
                      as: "payment",
                      in: { $multiply: ["$$payment.payment_amount", 0.05] },
                    },
                  },
                },
                2,
              ],
            },
          },
        },
        { $match: { ReferralBonuses: { $ne: [] } } },
        {
          $facet: {
            data: [{ $skip: skip || 0 }, { $limit: limit || 50 }],
            totalCount: [{ $count: "count" }],
          },
        },
      ];

      const result = await referralListModel.aggregate(pipeline);

      return {
        success: true,
        message: "Employee referral details fetched successfully",
        data: result[0]?.data || [],
        totalCount: result[0]?.totalCount || [{ count: 0 }],
        totalPages: limit
          ? Math.ceil((result[0]?.totalCount[0]?.count || 0) / limit)
          : null,
        currentPage: skip && limit ? Math.floor(skip / limit) + 1 : 1,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  //! drill down api
  async getSchemeDetailedView(filter, skip = 0, limit = 10, schemeId) {
    try {
      const today = new Date();
      const totalCountAgg = await schemeAccountModel.aggregate([
        {
          $match: {
            id_scheme: new mongoose.Types.ObjectId(schemeId),
            ...filter,
          },
        },
        {
          $count: "totalCount",
        },
      ]);

      const totalCount = totalCountAgg[0]?.totalCount || 0;
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(skip / limit) + 1;

      const schemeDetails = await schemeAccountModel.aggregate([
        {
          $match: {
            id_scheme: new mongoose.Types.ObjectId(schemeId),
            ...filter,
          },
        },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "Payments",
          },
        },
        {
          $addFields: {
            lastPayment: { $max: "$Payments.createdAt" },
          },
        },
        {
          $project: {
            id: "$Customer._id",
            accounter_fname: "$Customer.firstname",
            accounter_lname: "$Customer.lastname",
            customer_mobile: "$Customer.mobile",
            lastPayment: 1,
            scheme_acc_name: "$scheme_acc_name",
            startDate: "$start_date",
            maturityDate: "$maturity_date",
            schemeAccNumber: "$scheme_acc_number",
            paidInstallments: "$paid_installments",
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);

      const data = schemeDetails.map((doc) => {
        let dueMonths = 0;
        if (doc.lastPayment) {
          const lastPaymentDate = new Date(doc.lastPayment);
          dueMonths =
            (today.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
            (today.getMonth() - lastPaymentDate.getMonth());
        } else {
          dueMonths = 0;
        }

        return {
          _id: doc.id,
          accounter_fname: doc.accounter_fname,
          accounter_lname: doc.accounter_lname,
          customerName: `${doc?.accounter_fname} ${doc?.accounter_lname}`,
          customer_mobile: doc.customer_mobile,
          schemeAccName: doc.scheme_acc_name,
          startDate: doc.startDate,
          maturityDate: doc.maturityDate,
          schemeAccNumber: doc.schemeAccNumber,
          last_payment_date: doc.lastPayment,
          due_months: dueMonths,
          paidInstallments: doc.paidInstallments,
        };
      });

      // Step 4: Return structured result
      return {
        data,
        totalPages,
        totalCount,
        currentPage,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // async getAmountDetailedView(filter, skip = 0, limit = 10, schemeId,type) {
  //   try { console.log(filter)
  //     const totalCountAgg = await schemeAccountModel.aggregate([
  //       {
  //         $match: {
  //           id_scheme: new mongoose.Types.ObjectId(schemeId),
  //           ...filter,
  //         },
  //       },
  //       {
  //         $count: "totalCount",
  //       },
  //     ]);

  //     const totalCount = totalCountAgg[0]?.totalCount || 0;
  //     const totalPages = Math.ceil(totalCount / limit);
  //     const currentPage = Math.floor(skip / limit) + 1;

  //     const fieldToSum = type === 'weight' ? "$metal_weight" : "$payment_amount";
  
  //     const schemeDetails = await schemeAccountModel.aggregate([
  //       {
  //         $match: {
  //           id_scheme: new mongoose.Types.ObjectId(schemeId),
  //           ...filter,
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "customers",
  //           localField: "id_customer",
  //           foreignField: "_id",
  //           as: "Customer",
  //         },
  //       },
  //       { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
  //       {
  //         $lookup: {
  //           from: "payments",
  //           localField: "_id",
  //           foreignField: "id_scheme_account",
  //           pipeline: [
  //             { 
  //               $group: {
  //                 _id: null,
  //                 totalValue: { $sum: fieldToSum }
  //               }
  //             }
  //           ],
  //           as: "PaymentSummary",
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalValue: { 
  //             $ifNull: [{ $arrayElemAt: ["$PaymentSummary.totalValue", 0] }, 0] 
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: 0,
  //           customer: "$account_name",
  //           mobile: "$Customer.mobile",
  //           accounter_fname: "$Customer.firstname",
  //           accounter_lname: "$Customer.lastname",
  //           schemeAccNumber: "$scheme_acc_number",
  //           joinedDate: "$start_date",
  //           maturityDate: "$maturity_date",
  //           paidInstallments: "$paid_installments",
  //           totalValue:1 ,
  //         },
  //       },
  //       { $skip: skip },
  //       { $limit: limit },
  //     ]);
  
  //     return {
  //       data: schemeDetails,
  //       totalPages,
  //       totalCount,
  //       currentPage,
  //     };
  //   } catch (err) {
  //     console.error(err);
  //     throw err;
  //   }
  // }
  async getAmountDetailedView(filter, skip = 0, limit = 10, schemeId, type,from_date,to_date) {
    try {
      console.log(from_date,to_date)
        const paymentMatch = {};
        if (from_date) paymentMatch.createdAt = { $gte: from_date};
        if (to_date) paymentMatch.createdAt = { ...paymentMatch.createdAt, $lte: to_date };

        const fieldToSum = type === 'weight' ? "metal_weight" : "payment_amount";

        const aggregationPipeline = [
            {
                $match: {
                    id_scheme: new mongoose.Types.ObjectId(schemeId),
                    ...filter
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "id_customer",
                    foreignField: "_id",
                    as: "Customer"
                }
            },
            { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "payments",
                    let: { schemeAccountId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
                                ...paymentMatch
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                totalValue: { $sum: `$${fieldToSum}` }
                            }
                        }
                    ],
                    as: "PaymentSummary"
                }
            },
            {
                $addFields: {
                    totalValue: { $ifNull: [{ $arrayElemAt: ["$PaymentSummary.totalValue", 0] }, 0] }
                }
            },
            {
                $project: {
                    _id: 0,
                    customer: "$account_name",
                    mobile: "$Customer.mobile",
                    accounter_fname: "$Customer.firstname",
                    accounter_lname: "$Customer.lastname",
                    schemeAccNumber: "$scheme_acc_number",
                    joinedDate: "$start_date",
                    maturityDate: "$maturity_date",
                    paidInstallments: "$paid_installments",
                    totalValue: 1,
                    customerId:"$Customer._id"
                }
            },
            { $skip: skip },
            { $limit: limit }
        ];

        // Get paginated results
        const schemeDetails = await schemeAccountModel.aggregate(aggregationPipeline);
        console.log(schemeDetails,"d")

       
        const totalCount = await schemeAccountModel.countDocuments({
            id_scheme: new mongoose.Types.ObjectId(schemeId),
            filter
        });
        console.log(totalCount)

        const totalPages = Math.ceil(totalCount / limit);
        const currentPage = Math.floor(skip / limit) + 1;

        return {
            data: schemeDetails,
            totalPages,
            totalCount,
            currentPage
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
}

  async getActiveAccounts(filter, skip = 0, limit = 4) {
    try {
      const result = await schemeAccountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Added due date calculation section
        {
          $addFields: {
            daysPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "day",
                  },
                },
                1,
              ],
            },
            monthsPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "month",
                  },
                },
                1,
              ],
            },
            yearsPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "year",
                  },
                },
                1,
              ],
            },
          },
        },
        {
          $addFields: {
            expectedInstallments: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Scheme.installment_type", 1] },
                    then: "$monthsPassed",
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 2] },
                    then: { $trunc: { $divide: ["$daysPassed", 7] } },
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 3] },
                    then: "$daysPassed",
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 4] },
                    then: "$yearsPassed",
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            totalPaidInstallments: {
              $sum: "$paid_installments",
            },
          },
        },
        {
          $addFields: {
            installmentDue: {
              $max: [
                {
                  $subtract: [
                    "$expectedInstallments",
                    "$totalPaidInstallments",
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              {
                $project: {
                  _id: 1,
                  account_name: "$account_name",
                  scheme_acc_number: "$scheme_acc_number",
                  last_paid_date: "$last_paid_date",
                  gift_issues: "$gift_issues",
                  startDate: "$start_date",
                  maturityDate: "$maturity_date",
                  schemeType:"$Scheme.scheme_type",
                  total_installments: {
                    $cond: {
                      if: { $eq: ["$total_installments", 0] },
                      then: "$Scheme.noOfDays",
                      else: "$total_installments",
                    },
                  },
                  paid_installments: "$paid_installments",
                  amountPaid: "$amount",
                  weightPaid: "$weight",
                  scheme_name: "$Scheme.scheme_name",
                  installmentDue: "$installmentDue",
                  flexFixed: {
                    $cond: {
                      if: { $eq: ["flexFixed", null] },
                      then: 0,
                      else: "$flexFixed",
                    },
                  }
                },
              },
              {$sort: { _id: -1 }},
              { $skip: skip },
              { $limit: limit },
            ],
          },
        },
      ]);

      const metadata = result[0].metadata[0] || { total: 0 };
      return {
        data: result[0].data,
        totalCount: metadata.total,
      };
    } catch (err) {
      console.error("Error in getActiveAccounts:", err);
      throw err;
    }
  }

  async getRedeemedAccounts(filter, skip = 0, limit = 4) {
    try {
      const result = await schemeAccountModel.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customer",
          },
        },
        { $unwind: { path: "$Customer", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Added due date calculation section
        {
          $addFields: {
            daysPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "day",
                  },
                },
                1,
              ],
            },
            monthsPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "month",
                  },
                },
                1,
              ],
            },
            yearsPassed: {
              $add: [
                {
                  $dateDiff: {
                    startDate: "$start_date",
                    endDate: new Date(),
                    unit: "year",
                  },
                },
                1,
              ],
            },
          },
        },
        {
          $addFields: {
            expectedInstallments: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Scheme.installment_type", 1] },
                    then: "$monthsPassed",
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 2] },
                    then: { $trunc: { $divide: ["$daysPassed", 7] } },
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 3] },
                    then: "$daysPassed",
                  },
                  {
                    case: { $eq: ["$Scheme.installment_type", 4] },
                    then: "$yearsPassed",
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $addFields: {
            totalPaidInstallments: {
              $sum: "$paid_installments",
            },
          },
        },
        {
          $addFields: {
            installmentDue: {
              $max: [
                {
                  $subtract: [
                    "$expectedInstallments",
                    "$totalPaidInstallments",
                  ],
                },
                0,
              ],
            },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              {
                $project: {
                  _id: 1,
                  account_name: "$account_name",
                  scheme_acc_number: "$scheme_acc_number",
                  last_paid_date: "$last_paid_date",
                  gift_issues: "$gift_issues",
                  startDate: "$start_date",
                  maturityDate: "$maturity_date",
                  total_installments: {
                    $cond: {
                      if: { $eq: ["$total_installments", 0] },
                      then: "$Scheme.noOfDays",
                      else: "$total_installments",
                    },
                  },
                  paid_installments: "$paid_installments",
                  amountPaid: "$amount",
                  scheme_name: "$Scheme.scheme_name",
                  closedDate:"$closed_date",
                  // installmentDue: "$installmentDue",
                  // flexFixed: {
                  //   $cond: {
                  //     if: { $eq: ["flexFixed", null] },
                  //     then: 0,
                  //     else: "$flexFixed",
                  //   },
                  // }
                },
              },
              { $skip: skip },
              { $limit: limit },
            ],
          },
        },
      ]);

      const metadata = result[0].metadata[0] || { total: 0 };
      return {
        data: result[0].data,
        totalCount: metadata.total,
      };
    } catch (err) {
      console.error("Error in getActiveAccounts:", err);
      throw err;
    }
  }
}
export default ReportRepository;
