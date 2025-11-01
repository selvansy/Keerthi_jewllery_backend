import customerModel from "../../models/chit/customerModel.js";
import paymentModel from "../../models/chit/paymentModel.js";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js";
import topupModel from "../../models/chit/topupModel.js";

class DashboardRepository {
  // async getAllOver(filter) {
  //   try {
  //     const openAccountFilter = { ...filter, status: 0 };
  
  //     const [totalCustomers, payment, totalAccounts] =
  //       await Promise.all([
  //         customerModel.find(filter).countDocuments(),
  
  //         paymentModel.aggregate([
  //           { $match: { ...filter, payment_status: 1 } },
  //           {
  //             $lookup: {
  //               from: "schemes",
  //               localField: "id_scheme",
  //               foreignField: "_id",
  //               as: "Scheme",
  //             },
  //           },
  //           { $unwind: "$Scheme" },
  
  //           {
  //             $lookup: {
  //               from: "metals",
  //               localField: "Scheme.id_metal",
  //               foreignField: "_id",
  //               as: "Metal",
  //             },
  //           },
  //           { $unwind: "$Metal" },
  //           {
  //             $match: {
  //               // "Metal.metal_name": { $regex: /^gold$/i },
  //                 "Metal.metal_name": {
  //                   $in: [
  //                     /^gold$/i,
  //                     // /^silver$/i,
  //                     /^platinum$/i,
  //                     /^diamond$/i,
  //                     /^rose gold$/i
  //                   ]
  //               },                
  //               // "Scheme.scheme_type": { $nin: [0, 8, 13, 11, 1, 7] },
  //             },
  //           },
  
  //           {
  //             $group: {
  //               _id: null,
  //               totalMetalWeight: { $sum: "$metal_weight" },
  //               totalAmount: { $sum: "$payment_amount" },
  //             },
  //           },
  //           {
  //             $project: {
  //               _id: 0,
  //               totalMetalWeight: 1,
  //               totalAmount: 1,
  //             },
  //           },
  //         ]),
  
  //         schemeAccountModel.find(openAccountFilter).countDocuments(),
  
  //         schemeAccountModel.aggregate([
  //           { $match: openAccountFilter },
  //           {
  //             $lookup: {
  //               from: "schemes",
  //               localField: "id_scheme",
  //               foreignField: "_id",
  //               as: "Scheme",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "schemeclassifications",
  //               localField: "id_classification",
  //               foreignField: "_id",
  //               as: "Classification",
  //             },
  //           },
  //           {
  //             $lookup: {
  //               from: "customers",
  //               localField: "id_customer",
  //               foreignField: "_id",
  //               as: "Customer",
  //             },
  //           },
  //           { $unwind: "$Scheme" },
  //           { $unwind: "$Classification" },
  //           { $unwind: "$Customer" },
  
  //           {
  //             $addFields: {
  //               daysPassed: {
  //                 $add: [
  //                   {
  //                     $dateDiff: {
  //                       startDate: "$start_date",
  //                       endDate: new Date(),
  //                       unit: "day",
  //                     },
  //                   },
  //                   1,
  //                 ],
  //               },
  //               monthsPassed: {
  //                 $add: [
  //                   {
  //                     $dateDiff: {
  //                       startDate: "$start_date",
  //                       endDate: new Date(),
  //                       unit: "month",
  //                     },
  //                   },
  //                   1,
  //                 ],
  //               },
  //               yearsPassed: {
  //                 $add: [
  //                   {
  //                     $dateDiff: {
  //                       startDate: "$start_date",
  //                       endDate: new Date(),
  //                       unit: "year",
  //                     },
  //                   },
  //                   1,
  //                 ],
  //               },
  //             },
  //           },
  
  //           {
  //             $addFields: {
  //               expectedInstallments: {
  //                 $switch: {
  //                   branches: [
  //                     {
  //                       case: { $eq: ["$Scheme.installment_type", 1] },
  //                       then: "$monthsPassed",
  //                     },
  //                     {
  //                       case: { $eq: ["$Scheme.installment_type", 2] },
  //                       then: { $trunc: { $divide: ["$daysPassed", 7] } },
  //                     },
  //                     {
  //                       case: { $eq: ["$Scheme.installment_type", 3] },
  //                       then: "$daysPassed",
  //                     },
  //                     {
  //                       case: { $eq: ["$Scheme.installment_type", 4] },
  //                       then: "$yearsPassed",
  //                     },
  //                   ],
  //                   default: 0,
  //                 },
  //               },
  //             },
  //           },
  
  //           {
  //             $addFields: {
  //               totalPaidInstallments: { $sum: "$paid_installments" },
  //             },
  //           },
  //           {
  //             $addFields: {
  //               installmentDue: {
  //                 $max: [
  //                   {
  //                     $subtract: [
  //                       "$expectedInstallments",
  //                       "$totalPaidInstallments",
  //                     ],
  //                   },
  //                   0,
  //                 ],
  //               },
  //             },
  //           },
  //           { $match: { installmentDue: { $gt: 0 } } },
  //           { $count: "overdueCount" },
  //         ]),
  //       ]);
  
  //     const data = {
  //       totalAccounts,
  //       totalCustomers,
  //       totalGoldSave: payment[0]?.totalMetalWeight || 0,
  //       totalAmount: payment[0]?.totalAmount || 0,
  //     };
  
  //     return data;
  //   } catch (err) {
  //     console.error(err);
  //     throw new Error("Error fetching dashboard data");
  //   }
  // }  


//  async getAllOver(filter) {
//   try {
//     const openAccountFilter = { ...filter, status: 0 };

//     const goldMetals = [
//       /^gold$/i,
//       /^platinum$/i,
//       /^diamond$/i,
//       /^rose gold$/i,
//     ];

//     const silverMetals = [
//       /^silver$/i,
//     ];

//     const [
//       totalCustomers,
//       Payment,
//       silverPayment,
//       totalPayment, 
//       totalAccounts,
//       overdueAccounts,
//     ] = await Promise.all([
//       customerModel.find(filter).countDocuments(),

//       paymentModel.aggregate([
//         { $match: { ...filter, payment_status: 1 } },
//         {
//           $lookup: {
//             from: "schemes",
//             localField: "id_scheme",
//             foreignField: "_id",
//             as: "Scheme",
//           },
//         },
//         { $unwind: "$Scheme" },
//         {
//           $lookup: {
//             from: "metals",
//             localField: "Scheme.id_metal",
//             foreignField: "_id",
//             as: "Metal",
//           },
//         },
//         { $unwind: "$Metal" },
//         { $match: { "Metal.metal_name": { $in: goldMetals } } },
//         {
//           $group: {
//             _id: null,
//             totalMetalWeight: { $sum: "$metal_weight" },
//             totalAmount: { $sum: "$payment_amount" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             totalMetalWeight: 1,
//             totalAmount: 1,
//           },
//         },
//       ]),

//       paymentModel.aggregate([
//         { $match: { ...filter, payment_status: 1 } },
//         {
//           $lookup: {
//             from: "schemes",
//             localField: "id_scheme",
//             foreignField: "_id",
//             as: "Scheme",
//           },
//         },
//         { $unwind: "$Scheme" },
//         {
//           $lookup: {
//             from: "metals",
//             localField: "Scheme.id_metal",
//             foreignField: "_id",
//             as: "Metal",
//           },
//         },
//         { $unwind: "$Metal" },
//         { $match: { "Metal.metal_name": { $in: silverMetals } } },
//         {
//           $group: {
//             _id: null,
//             totalSilverWeight: { $sum: "$metal_weight" },
//             totalSilverAmount: { $sum: "$payment_amount" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             totalSilverWeight: 1,
//             totalSilverAmount: 1,
//           },
//         },
//       ]),

//       paymentModel.aggregate([
//         { $match: { ...filter, payment_status: 1 } },
//         {
//           $lookup: {
//             from: "schemes",
//             localField: "id_scheme",
//             foreignField: "_id",
//             as: "Scheme",
//           },
//         },
//         { $unwind: "$Scheme" },
//         {
//           $lookup: {
//             from: "metals",
//             localField: "Scheme.id_metal",
//             foreignField: "_id",
//             as: "Metal",
//           },
//         },
//         { $unwind: "$Metal" },
//         {
//           $group: {
//             _id: null,
//             totalCombinedAmount: { $sum: "$payment_amount" },
//             totalCombinedWeight: { $sum: "$metal_weight" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             totalCombinedAmount: 1,
//             totalCombinedWeight: 1,
//           },
//         },
//       ]),

//       schemeAccountModel.find(openAccountFilter).countDocuments(),

//       schemeAccountModel.aggregate([
//         { $match: openAccountFilter },
//         {
//           $lookup: {
//             from: "schemes",
//             localField: "id_scheme",
//             foreignField: "_id",
//             as: "Scheme",
//           },
//         },
//         {
//           $lookup: {
//             from: "schemeclassifications",
//             localField: "id_classification",
//             foreignField: "_id",
//             as: "Classification",
//           },
//         },
//         {
//           $lookup: {
//             from: "customers",
//             localField: "id_customer",
//             foreignField: "_id",
//             as: "Customer",
//           },
//         },
//         { $unwind: "$Scheme" },
//         { $unwind: "$Classification" },
//         { $unwind: "$Customer" },
//         {
//           $addFields: {
//             daysPassed: {
//               $add: [
//                 {
//                   $dateDiff: {
//                     startDate: "$start_date",
//                     endDate: new Date(),
//                     unit: "day",
//                   },
//                 },
//                 1,
//               ],
//             },
//             monthsPassed: {
//               $add: [
//                 {
//                   $dateDiff: {
//                     startDate: "$start_date",
//                     endDate: new Date(),
//                     unit: "month",
//                   },
//                 },
//                 1,
//               ],
//             },
//             yearsPassed: {
//               $add: [
//                 {
//                   $dateDiff: {
//                     startDate: "$start_date",
//                     endDate: new Date(),
//                     unit: "year",
//                   },
//                 },
//                 1,
//               ],
//             },
//           },
//         },
//         {
//           $addFields: {
//             expectedInstallments: {
//               $switch: {
//                 branches: [
//                   {
//                     case: { $eq: ["$Scheme.installment_type", 1] },
//                     then: "$monthsPassed",
//                   },
//                   {
//                     case: { $eq: ["$Scheme.installment_type", 2] },
//                     then: { $trunc: { $divide: ["$daysPassed", 7] } },
//                   },
//                   {
//                     case: { $eq: ["$Scheme.installment_type", 3] },
//                     then: "$daysPassed",
//                   },
//                   {
//                     case: { $eq: ["$Scheme.installment_type", 4] },
//                     then: "$yearsPassed",
//                   },
//                 ],
//                 default: 0,
//               },
//             },
//           },
//         },
//         {
//           $addFields: {
//             totalPaidInstallments: { $sum: "$paid_installments" },
//           },
//         },
//         {
//           $addFields: {
//             installmentDue: {
//               $max: [
//                 {
//                   $subtract: [
//                     "$expectedInstallments",
//                     "$totalPaidInstallments",
//                   ],
//                 },
//                 0,
//               ],
//             },
//           },
//         },
//         { $match: { installmentDue: { $gt: 0 } } },
//         { $count: "overdueCount" },
//       ]),
//     ]);

//     return {
//       totalAccounts,
//       totalCustomers,
//       totalGoldSave: Payment[0]?.totalMetalWeight || 0,
//       totalGoldAmount: Payment[0]?.totalAmount || 0,
//       totalSilverSave: silverPayment[0]?.totalSilverWeight || 0,
//       totalSilverAmount: silverPayment[0]?.totalSilverAmount || 0,
//       totalAmount: totalPayment[0]?.totalCombinedAmount || 0, 
//       totalCombinedWeight: totalPayment[0]?.totalCombinedWeight || 0, 
//       overdueAccounts: overdueAccounts[0]?.overdueCount || 0,
//     };

//   } catch (err) {
//     console.error(err);
//     throw new Error("Error fetching dashboard data");
//   }
// }

async getAllOver(filter) {
  try {
    const openAccountFilter = { ...filter };

    const [totalCustomers, payment, totalAccounts, overdueAccounts] =
      await Promise.all([
        customerModel.find(filter).countDocuments(),

        paymentModel.aggregate([
          { $match: { ...filter, payment_status: 1 } },
          {
            $lookup: {
              from: "schemes",
              localField: "id_scheme",
              foreignField: "_id",
              as: "Scheme",
            },
          },
          { $unwind: "$Scheme" },

          {
            $lookup: {
              from: "metals",
              localField: "Scheme.id_metal",
              foreignField: "_id",
              as: "Metal",
            },
          },
          { $unwind: "$Metal" },
          {
            $match: {
              "Metal.metal_name": {
                $in: [
                  /^gold$/i,
                  /^silver$/i, 
                  /^platinum$/i,
                  /^diamond$/i,
                  /^rose gold$/i
                ]
              }, 
               // "Scheme.scheme_type": { $nin: [0, 8, 13, 11, 1, 7] },               
            },
          },

          {
            $group: {
              _id: "$Metal.metal_name",
              totalMetalWeight: { $sum: "$metal_weight" },
              totalAmount: { $sum: "$payment_amount" },
            },
          },
          {
            $project: {
              _id: 0,
              metalName: "$_id",
              totalMetalWeight: 1,
              totalAmount: 1,
            },
          },
        ]),

        schemeAccountModel.find(openAccountFilter).countDocuments(),

        schemeAccountModel.aggregate([
          { $match: openAccountFilter },
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
          { $unwind: "$Scheme" },
          { $unwind: "$Classification" },
          { $unwind: "$Customer" },

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
              totalPaidInstallments: { $sum: "$paid_installments" },
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
          { $match: { installmentDue: { $gt: 0 } } },
          { $count: "overdueCount" },
        ]),
      ]);

    let totalGoldSave = 0;
    let totalSilverSave = 0;
    let totalAmount = 0;

    payment.forEach(p => {
      const metalName = p.metalName.toLowerCase();
      if (metalName === 'gold') {
        totalGoldSave = p.totalMetalWeight || 0;
      } else if (metalName === 'silver') {
        totalSilverSave = p.totalMetalWeight || 0;
      }
      totalAmount += p.totalAmount || 0;
    });

    const data = {
      totalAccounts,
      totalCustomers,
      totalGoldSave,
      totalSilverSave,
      totalAmount,
      overdueAccounts: overdueAccounts[0]?.overdueCount || 0,
    };

    return data;
  } catch (err) {
    console.error(err);
    throw new Error("Error fetching dashboard data");
  }
}




  async overdueCalculation() {
    try {
      const result = await schemeAccountModel.aggregate([
        {
          $match: {
            status: 0,
            active: true,
            is_deleted: false
          }
        },
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "scheme"
          }
        },
        { $unwind: "$scheme" },
        {
          $addFields: {
            currentDate: new Date(),
            startDateObj: "$start_date",
            schemeInstallmentType: "$scheme.installment_type"
          }
        },
        {
          $addFields: {
            expectedDueDates: {
              $let: {
                vars: {
                  startDate: "$startDateObj",
                  totalInstallments: "$total_installments",
                  installmentType: "$schemeInstallmentType"
                },
                in: {
                  $map: {
                    input: { $range: [0, "$$totalInstallments"] },
                    as: "i",
                    in: {
                      $dateAdd: {
                        startDate: "$$startDate",
                        unit: {
                          $switch: {
                            branches: [
                              { case: { $eq: ["$$installmentType", 1] }, then: "month" },
                              { case: { $eq: ["$$installmentType", 2] }, then: "week" },
                              { case: { $eq: ["$$installmentType", 3] }, then: "day" },
                              { case: { $eq: ["$$installmentType", 4] }, then: "year" }
                            ],
                            default: "month"
                          }
                        },
                        amount: "$$i"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        {
          $addFields: {
            expectedInstallmentCount: {
              $size: {
                $filter: {
                  input: "$expectedDueDates",
                  as: "dueDate",
                  cond: { $lte: ["$$dueDate", "$currentDate"] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            overdueInstallments: {
              $cond: {
                if: { $gt: ["$expectedInstallmentCount", "$paid_installments"] },
                then: { $subtract: ["$expectedInstallmentCount", "$paid_installments"] },
                else: 0
              }
            }
          }
        },
        {
          $match: {
            overdueInstallments: { $gt: 0 }
          }
        },
        {
          $count: "totalOverdueAccounts"
        }
      ]);
  
      const count = result.length > 0 ? result[0].totalOverdueAccounts : 0;
      return { totalOverdueAccounts: count };
  
    } catch (error) {
      console.error("Error in overdueCalculation:", error);
      throw error;
    }
  }
  

  async getAccountStat(customFilter) {
    try {
      const [newCustomer, paymentData, schemeData] = await Promise.all([
        await customerModel.countDocuments(customFilter),
        await paymentModel.aggregate([
          { $match: {...customFilter,payment_status:1} },
          {
            $group: {
              _id: null,
              totalMetalWeight: { $sum: "$metal_weight" },
              totalAmount: { $sum: "$payment_amount" },
            },
          },
          { $project: { _id: 0, totalMetalWeight: 1, totalAmount: 1 } },
        ]),
        await schemeAccountModel.aggregate([
          { $match: customFilter },
          {
            $facet: {
              totalAccounts: [{ $count: "count" }],
              completedAccounts: [
                { $match: { status: 2 } },
                { $count: "count" },
              ],
              closedAccounts: [{ $match: { status: 1 } }, { $count: "count" }],
            },
          },
          {
            $project: {
              total: {
                $ifNull: [{ $arrayElemAt: ["$totalAccounts.count", 0] }, 0],
              },
              completed: {
                $ifNull: [{ $arrayElemAt: ["$completedAccounts.count", 0] }, 0],
              },
              closed: {
                $ifNull: [{ $arrayElemAt: ["$closedAccounts.count", 0] }, 0],
              },
            },
          },
        ]),
      ]);

      return {
        newCustomer: newCustomer,
        receivedWeights: paymentData[0]?.totalMetalWeight || 0,
        receivedAmounts: paymentData[0]?.totalAmount || 0,
        newAccounts: schemeData[0].total,
        completedAccount: schemeData[0].completed,
        closedAccount: schemeData[0].closed,
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async getAccountData(customFilter) {
    try {

      const result = await schemeAccountModel.aggregate([
        { $match: customFilter },
      
        // Join with Scheme to access scheme_type
        {
          $lookup: {
            from: "schemes",
            localField: "id_scheme",
            foreignField: "_id",
            as: "Scheme",
          },
        },
        { $unwind: "$Scheme" },
      
        {
          $facet: {
            totalAccounts: [
              { $count: "count" }
            ],
      
            digiGoldAccounts: [
              { $match: { "Scheme.scheme_type": 10 } },
              { $count: "count" }
            ],
      
            digiSilverAccounts: [
              { $match: { "Scheme.scheme_type": 11 } },
              { $count: "count" }
            ],
      
            openAccounts: [
              { $match: { status: 0 } },
              { $count: "count" }
            ],
      
            closeAccounts: [
              { $match: { status: 1 } },
              { $count: "count" }
            ],
      
            completedAccounts: [
              { $match: { status: 2 } },
              { $count: "count" }
            ],
      
            preclosedAccounts: [
              { $match: { status: 3 } },
              { $count: "count" }
            ],
      
            refundAccounts: [
              { $match: { status: 4 } },
              { $count: "count" }
            ]
          }
        },
      
        // Flatten all results with default 0 if no data
        {
          $project: {
            totalAccounts: { $ifNull: [{ $arrayElemAt: ["$totalAccounts.count", 0] }, 0] },
            digiGoldAccounts: { $ifNull: [{ $arrayElemAt: ["$digiGoldAccounts.count", 0] }, 0] },
            digiSilverAccounts: { $ifNull: [{ $arrayElemAt: ["$digiSilverAccounts.count", 0] }, 0] },
            openAccounts: { $ifNull: [{ $arrayElemAt: ["$openAccounts.count", 0] }, 0] },
            closeAccounts: { $ifNull: [{ $arrayElemAt: ["$closeAccounts.count", 0] }, 0] },
            completedAccounts: { $ifNull: [{ $arrayElemAt: ["$completedAccounts.count", 0] }, 0] },
            preclosedAccounts: { $ifNull: [{ $arrayElemAt: ["$preclosedAccounts.count", 0] }, 0] },
            refundAccounts: { $ifNull: [{ $arrayElemAt: ["$refundAccounts.count", 0] }, 0] },
          }
        }
      ]);
      
      return result[0]
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching dashboard data");
    }
  }

   async paymentReportEdger(filter, skip, pageSize) {
        try {
          const allPaymentModes = await paymentModel.db
            .collection("paymentmodes")
            .find({})
            .toArray();
      
          const paymentData = await paymentModel.aggregate([
            { 
              $match: filter
            },
      
            {
              $lookup: {
                from: "paymentmodes",
                localField: "payment_mode",
                foreignField: "_id",
                as: "PaymentData"
              }
            },
            { $unwind: { path: "$PaymentData", preserveNullAndEmptyArrays: true } },
      
            {
              $addFields: {
                total_amt: { $ifNull: ["$total_amt", 0] }
              }
            },
      
            {
              $group: {
                _id: "$PaymentData._id",
                mode_name: { $first: "$PaymentData.mode_name" },
                totalAmount: { $sum: "$total_amt" }
              }
            }
          ]);
      
          const mergedData = allPaymentModes.map((mode) => {
            const found = paymentData.find((data) => String(data._id) === String(mode._id));
            return {
              _id: mode._id,
              mode_name: mode.mode_name,
              totalAmount: found ? found.totalAmount : 0
            };
          });
      
          // Pagination details
          const totalDocuments = mergedData.length;
          const totalPages = Math.ceil(totalDocuments / pageSize);
          const currentPage = Math.floor(skip / pageSize) + 1;
      
          const paginatedData = mergedData.slice(skip, skip + pageSize);
          return {
            data: paginatedData,
            totalDocuments,
            totalPages,
            currentPage
          };
        } catch (err) {
          throw err;
        }
  }

  async getPaymentHistory(skip, pageSize,filter) {
    try {
      const paymentData = await paymentModel
        .find(filter)
        .populate({
          path: 'id_customer',
          select: 'firstname lastname'  
        })
        .populate({
          path: 'id_scheme',
          select: 'scheme_name'
        })
        .sort({ createdAt: -1 })      
        .skip(skip)                  
        .limit(pageSize);            
  
      const total = await paymentModel.countDocuments(filter);
  
      return {
        data: paymentData,
        total,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  
  async getNotificationCount (id_branch){
    try{

      // const count = 

    }catch(err){
      console.error(err)
      throw err
    }
  }


  async paymentModeData(filter){
    try{
      const Data = await paymentModel.aggregate([
        { $match: {...filter,payment_status:1} },
      
        {
          $lookup: {
            from: "paymentmodes",
            localField: "payment_mode",
            foreignField: "_id",
            as: "payment_mode_info",
          },
        },
        {
          $unwind: {path:"$payment_mode_info",preserveNullAndEmptyArrays:true}
        },
      
        {
          $group: {
            _id: "$payment_mode_info.mode_name", // assuming `name` is the field in PaymentMode
            totalAmount: { $sum: "$payment_amount" },
          },
        },
      
        {
          $project: {
            _id: 0,
            payment_mode: "$_id",
            totalAmount: 1,
          },
        },
      ]);
      
      return Data
    }catch(err){
      throw err
    }
  }

 
}

export default DashboardRepository;
