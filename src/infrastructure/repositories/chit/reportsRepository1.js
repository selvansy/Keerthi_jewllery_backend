import mongoose from "mongoose";
import Scheme from "../../models/chit/schemeModel.js";
import SchemeAccount from "../../models/chit/schemeAccountModel.js";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js";
import branchModel from "../../models/chit/branchModel.js";
import paymentModeModel from "../../models/chit/paymentModeModel.js";
import SchemePayment from "../../models/chit/paymentModel.js";
import customerModel from "../../models/chit/customerModel.js";
import paymentModel from "../../models/chit/paymentModel.js";
import giftItemModel from "../../models/chit/giftItemModel.js";

  
class ReportRepository {

  async accountSummary(query,search,skip, limit) {
    try {
      const handleSearch = search? {
        $or: [
          { "Customer.firstname": { $regex: search, $options: "i" } },
          { "Customer.lastname": { $regex: search, $options: "i" } },
          { "Customer.mobile": { $regex: search, $options: "i" } },
          { "Scheme.scheme_name": { $regex: search, $options: "i" } },
          { "Classification.name": { $regex: search, $options: "i" } },
          { "Status.status_name": { $regex: search, $options: "i" } },
          {totalChitValue:{$regex:search,$options:"i"}},
          {totalPaidAmount:{$regex:search,$options:"i"}},
          {totalDueAmount:{$regex:search,$options:"i"}},
          {totalPayableAmount:{$regex:search,$options:"i"}},
          {installementType:{$regex:search,$options:"i"}},
        ]
      }:{}
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
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$Classification",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$Customer",
            preserveNullAndEmptyArrays: true
          }
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
                { $or: [{ $eq: ["$lastPaidAmount", 0] }, { $eq: ["$lastPaidAmount", null] }] }
              ],
            },
            then: {
              $concat: [
                {
                  $toString: {
                    $multiply: ["$Scheme.min_amount", "$total_installments"],
                  },
                },
                " - ",
                {
                  $toString: {
                    $multiply: ["$Scheme.max_amount", "$total_installments"],
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
            then: { $subtract: ["$totalChitValue", "$totalPaidAmount"] },
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
                { $or: [{ $eq: ["$lastPaidAmount", 0] }, { $eq: ["$lastPaidAmount", null] }] }
              ],
            },
            then: {
              $concat: [
                {
                  $toString: {
                    $subtract: [
                      {
                        $multiply: ["$Scheme.min_amount", "$total_installments"],
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
                        $multiply: ["$Scheme.max_amount", "$total_installments"],
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
            $match:handleSearch
          },
     

        // Final projection
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: skip},
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
                                      $eq: ["$$mode._id", "$$payment.payment_mode"],
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
      // return accountSummary;
    } catch (err) {
      throw err;
    }
  }

  async pendingDuePayment(page, limit, query) {
    try {
      const dueData = await schemeAccountModel.aggregate([
        { $match: query},
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

        // Calculate days/months/years passed
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

        // Determine expected installments
        {
          $addFields: {
            expectedInstallments: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Scheme.installment_type", 1] },
                    then: "$monthsPassed",
                  }, // Monthly
                  {
                    case: { $eq: ["$Scheme.installment_type", 2] },
                    then: { $trunc: { $divide: ["$daysPassed", 7] } },
                  }, // Weekly
                  {
                    case: { $eq: ["$Scheme.installment_type", 3] },
                    then: "$daysPassed",
                  }, // Daily
                  {
                    case: { $eq: ["$Scheme.installment_type", 4] },
                    then: "$yearsPassed",
                  }, // Yearly
                ],
                default: 0,
              },
            },
          },
        },

        // Calculate installment due
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "paymentsData",
          },
        },
        {
          $addFields: {
            totalPaymentsMade: {
              $reduce: {
                input: "$paymentsData",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.paid_installments"] }
              }
            },
          },
        },
        {
          $addFields: {
            installmentDue: {
              $max: [
                { $subtract: ["$expectedInstallments", "$totalPaymentsMade"] },
                0,
              ],
            },
          },
        },

        { $match: { installmentDue: { $gt: 0 } } },

        // Calculate totalOverduePayment based on Classification
        {
          $addFields: {
            totalOverduePayment: {
              $cond: {
                if: { $eq: ["$Classification.name", "Fixed"] },
                then: { $multiply: ["$amount", "$installmentDue"] },
                else: null,
              },
            },
            minOverduePayment: {
              $cond: {
                if: { $eq: ["$Classification.name", "Flexi"] },
                then: { $multiply: ["$Scheme.min_amount", "$installmentDue"] },
                else: null,
              },
            },
            maxOverduePayment: {
              $cond: {
                if: { $eq: ["$Classification.name", "Flexi"] },
                then: { $multiply: ["$Scheme.max_amount", "$installmentDue"] },
                else: null,
              },
            },
          },
        },

        // Lookup last payment (optional)
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
        {
          $addFields: {
            totalOverduePayment: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$Classification.name", "Fixed"] },
                    then: { $multiply: ["$amount", "$installmentDue"] },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi"] },
                    then: {
                      $concat: [
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.min_amount",
                              "$installmentDue",
                            ],
                          },
                        },
                        " - ",
                        {
                          $toString: {
                            $multiply: [
                              "$Scheme.max_amount",
                              "$installmentDue",
                            ],
                          },
                        },
                      ],
                    },
                  },
                  {
                    case: { $eq: ["$Classification.name", "Flexi-Fixed"] },
                    then: { $multiply: ["$lastPaidAmount", "$installmentDue"] },
                  },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  scheme_name: "$Scheme.scheme_name",
                  classification_name: "$Classification.name",
                  customer_name: {
                    $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
                  },
                  customer_mobile: "$Customer.mobile",
                  installmentDue: 1,
                  totalOverduePayment: {
                    $cond: {
                      if: { $eq: ["$Classification.name", "Flexi"] },
                      then: {
                        $concat: [
                          { $toString: "$minOverduePayment" },
                          " - ",
                          { $toString: "$maxOverduePayment" },
                        ],
                      },
                      else: { $toString: "$totalOverduePayment" },
                    },
                  },
                },
              },
            ],
          },
        },
      ]);
  
      const totalDocuments = dueData[0]?.metadata[0]?.total || 0;
      const data = dueData[0]?.data || [];
      return { totalDocuments, data };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPaymentReport(page, limit, query) {
    try {
      const paymentReport = await SchemePayment.aggregate([
        { $match: {} },
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
        { $unwind: "$Scheme" },
        { $unwind: "$Customer" },
        { $unwind: "$PaymentMode" },
        {
          $project: {
            scheme_name: "$Scheme.scheme_name",
            classification_name: "$Classification.name",
            customer_name: {
              $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
            },
            customer_mobile: "$Customer.mobile",
            payment_mode: "$PaymentMode.mode_name",
            payment_amount: 1,
            payment_receipt: 1,
            total_amt: 1,
            date_payment: 1,
            otherCharges: {
              gst_amount: "$gst_amount",
              fine_amount: "$fine_amount",
            },
          },
        },
      ]);

      return paymentReport;
    } catch (err) {
      throw err;
    }
  }

  async getPreCloseReport(query,page, limit ) {
    try {
      query.status=3
      const preCloseData = await schemeAccountModel.aggregate([
        { $match:query },
        {
          $addFields: {
            statusString: { $toString: "$status" },
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
        { $unwind: { path: "$Scheme", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "Classification",
          },
        },
        { $unwind: { path: "$Classification", preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "Customers",
          },
        },
        { $unwind: { path: "$Customers", preserveNullAndEmptyArrays: true } },

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

        {
          $project: {
            scheme_name: "$Scheme.scheme_name",
            classification_name: "$Classification.name",
            customer_name: {
              $concat: ["$Customers.firstname", " ", "$Customers.lastname"],
            },
            customer_mobile: "$Customers.mobile",
            closed_date: "$CloseBill.createdAt",
            closedBy: {
              $concat: ["$Employee.firstname", " ", "$Employee.lastname"],
            },
            totalChitValue: 1,
            totalPaidAmount: 1,
          },
        },
      ]);

      return preCloseData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getRedeemptionReport(page, limit, query) {
    try {
      const redeemption = await schemeAccountModel.aggregate([
        { $match: { status: 1 } },

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
          $lookup: {
            from: "closeaccbills",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "CloseBill",
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
        { $unwind: "$Scheme" },
        { $unwind: "$Classification" },
        { $unwind: "$Customer" },
        { $unwind: "$CloseBill" },
        { $unwind: "$Payment" },
        {
          $addFields: {
            total_paid: { $sum: "$Payment.total_amt" },
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
        { $unwind: "$Employee" },

        {
          $project: {
            scheme_name: "$Scheme.scheme_name",
            classification_name: "$Classification.name",
            customer_name: {
              $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
            },
            customer_mobile: "$Customer.mobile",
            redeemptionDate: "$CloseBill.createdAt",
            gift_issues: 1,
            closedBy: {
              $concat: ["$Employee.firstname", " ", "$Employee.lastname"],
            },
            total_paid: 1,
          },
        },
      ]);

      return redeemption;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getRefundReport(page, limit, query) {
    try {
      const refundReport = await schemeAccountModel.aggregate([
        { $match: { status: 4 } },

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
          $lookup: {
            from: "closeaccbills",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "CloseBill",
          },
        },
        { $unwind: "$Scheme" },
        { $unwind: "$Classification" },
        { $unwind: "$Customer" },
        { $unwind: "$CloseBill" },

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
        {
          $project: {
            scheme_name: "$Scheme.scheme_name",
            classification_name: "$Classification.name",
            customer_name: {
              $concat: ["$Customer.firstname", " ", "$Customer.lastname"],
            },
            customer_mobile: "$Customer.mobile",
            refundDate: "$CloseBill.createdAt",
            totalPaidAmount: 1,
            totalChitValue: 1,
          },
        },
      ]);

      return refundReport;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async overAllReport(filter, skip, pageSize) {
    try {
      const overAllData = await Scheme.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "_id",
            foreignField: "id_scheme",
            as: "SchemeAccount",
          },
        },
  
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "Branch",
          },
        },
        { $unwind: "$Branch" },
  
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
            totalAccounts: { $size: "$SchemeAccount" },
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
  
        // Add sums
        {
          $addFields: {
            totalCloseAmount: { $sum: "$ClosedPayments.payment_amount" },
            totalRefundAmount: { $sum: "$RefundPayments.payment_amount" },
            totalPreCloseAmount: { $sum: "$PreClosePayments.payment_amount" },
            totalOpenAmount: { $sum: "$OpenPayments.payment_amount" },
          },
        },
  
        // Final result
        {
          $project: {
            scheme_name: 1,
            Branch_name: "$Branch.branch_name",
            totalAccounts: 1,
            totalOpenAccount: 1,
            totalCloseAccount: 1,
            totalPreCloseAccount: 1,
            totalRefundAccount: 1,
            totalCloseAmount: 1,
            totalRefundAmount: 1,
            totalPreCloseAmount: 1,
            totalOpenAmount: 1,
          },
        },
      ]);

      return overAllData;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
  

  async paymentReport(filter, skip, pageSize) {
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
  

  async countSchemes(query) {
    return await Scheme.countDocuments(query);
  }

  async countSchemeAccounts(filter) {
    try {
      const docCount = await SchemeAccount.countDocuments(filter);

      return docCount;
    } catch (error) {
      console.error(error);
    }
  }

  async getOutstandingReport(query, skip, limit) {
    return Scheme.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "schemeaccounts",
          localField: "_id",
          foreignField: "id_scheme",
          as: "schemeDetails",
        },
      },
      { $unwind: "$schemeDetails" },
      {
        $lookup: {
          from: "payments",
          localField: "schemeDetails._id",
          foreignField: "id_scheme_account",
          as: "payments",
        },
      },
      {
        $group: {
          _id: "$_id",
          scheme_name: { $first: "$scheme_name" },
          totalPayments: {
            $sum: {
              $sum: "$payments.total_amt",
            },
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ["$metadata.total", 0] },
          data: 1,
        },
      },
    ]).exec();
  }

  async outstandingWeight(query, skip, limit) {
    return Scheme.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "schemeaccounts",
          localField: "_id",
          foreignField: "id_scheme",
          as: "schemeDetails",
        },
      },
      { $unwind: "$schemeDetails" },
      {
        $lookup: {
          from: "payments",
          localField: "schemeDetails._id",
          foreignField: "id_scheme_account",
          as: "payments",
        },
      },
      {
        $group: {
          _id: "$_id",
          scheme_name: { $first: "$scheme_name" },
          totalPayments: {
            $sum: {
              $sum: "$payments.total_amt",
            },
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $sort: { _id: -1 } }, { $skip: skip }, { $limit: limit }],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ["$metadata.total", 0] },
          data: 1,
        },
      },
    ]).exec();
  }

  async getOutstandingReportCount(query) {
    return paymentModel.countDocuments(query);
  }

  async paymenCounts(query) {
    try {
      const count = await paymentModel.countDocuments(query);

      const totalAmtResult = await paymentModel.find(query).select("total_amt");
      const total_amt = totalAmtResult.reduce(
        (sum, doc) => sum + (doc.total_amt || 0),
        0
      );

      return { count, total_amt };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch payment counts");
    }
  }

  async schemeAccountAggregate(query) {
    try {
      const schemeData = await schemeAccountModel.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "payments",
          },
        },
        { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            total_amt: { $sum: "$payments.total_amt" },
            total_weight: { $sum: "$payments.metal_weight" },
          },
        },
      ]);

      if (schemeData.length > 0) {
        return schemeData[0];
      }

      return 0;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch payment counts");
    }
  }

  async schemeData(page, limit, query) {
    try {
      const documents = await Scheme.countDocuments(query);
      const schemeData = await Scheme.find(query)
        .skip(page)
        .limit(limit)
        .sort({ _id: 1 });

      return { schemeData, documents };
    } catch (error) {
      console.error(error);
    }
  }

  async schemeAccountData(page, limit, query) {
    try {
      const documents = await Scheme.countDocuments(query);
      const schemeData = await Scheme.find(query)
        .skip(page)
        .limit(limit)
        .sort({ _id: 1 });

      return { schemeData, documents };
    } catch (error) {
      console.error(error);
    }
  }

  async brnachName(branchId) {
    try {
      const branchData = await branchModel
        .findById(branchId)
        .select("branch_name");

      if (branchData) {
        return branchData;
      }

      return "All";
    } catch (error) {
      console.error(error);
    }
  }

  async paymentMode(query) {
    try {
      const modeData = await paymentModeModel.findOne(query).select("_id");

      if (modeData) {
        return modeData;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  // async pendingDuePayment(page, limit, query) {
  //   try {
  //     const dueData = await schemeAccountModel.aggregate([
  //       { $match: query },

  //       // Lookup related data
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

  //       // Calculate days/months/years passed
  //       {
  //         $addFields: {
  //           daysPassed: {
  //             $add: [
  //               {
  //                 $dateDiff: {
  //                   startDate: "$start_date",
  //                   endDate: new Date(),
  //                   unit: "day",
  //                 },
  //               },
  //               1,
  //             ],
  //           },
  //           monthsPassed: {
  //             $add: [
  //               {
  //                 $dateDiff: {
  //                   startDate: "$start_date",
  //                   endDate: new Date(),
  //                   unit: "month",
  //                 },
  //               },
  //               1,
  //             ],
  //           },
  //           yearsPassed: {
  //             $add: [
  //               {
  //                 $dateDiff: {
  //                   startDate: "$start_date",
  //                   endDate: new Date(),
  //                   unit: "year",
  //                 },
  //               },
  //               1,
  //             ],
  //           },
  //         },
  //       },

  //       // Determine expected installments
  //       {
  //         $addFields: {
  //           expectedInstallments: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 1] },
  //                   then: "$monthsPassed",
  //                 }, // Monthly
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 2] },
  //                   then: { $trunc: { $divide: ["$daysPassed", 7] } },
  //                 }, // Weekly
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 3] },
  //                   then: "$daysPassed",
  //                 }, // Daily
  //                 {
  //                   case: { $eq: ["$Scheme.installment_type", 4] },
  //                   then: "$yearsPassed",
  //                 }, // Yearly
  //               ],
  //               default: 0,
  //             },
  //           },
  //         },
  //       },

  //       // Calculate installment due
  //       {
  //         $lookup: {
  //           from: "payments",
  //           localField: "_id",
  //           foreignField: "id_scheme_account",
  //           as: "paymentsData",
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalPaymentsMade: { $size: "$paymentsData" },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           installmentDue: {
  //             $max: [
  //               { $subtract: ["$expectedInstallments", "$totalPaymentsMade"] },
  //               0,
  //             ],
  //           },
  //         },
  //       },

  //       { $match: { installmentDue: { $gt: 0 } } },

  //       // Calculate totalOverduePayment based on Classification
  //       {
  //         $addFields: {
  //           totalOverduePayment: {
  //             $cond: {
  //               if: { $eq: ["$Classification.name", "Fixed"] },
  //               then: { $multiply: ["$amount", "$installmentDue"] },
  //               else: null,
  //             },
  //           },
  //           minOverduePayment: {
  //             $cond: {
  //               if: { $eq: ["$Classification.name", "Flexi"] },
  //               then: { $multiply: ["$Scheme.min_amount", "$installmentDue"] },
  //               else: null,
  //             },
  //           },
  //           maxOverduePayment: {
  //             $cond: {
  //               if: { $eq: ["$Classification.name", "Flexi"] },
  //               then: { $multiply: ["$Scheme.max_amount", "$installmentDue"] },
  //               else: null,
  //             },
  //           },
  //         },
  //       },

  //       // Lookup last payment (optional)
  //       {
  //         $lookup: {
  //           from: "payments",
  //           let: { schemeAccountId: "$_id", customerId: "$id_customer" },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $and: [
  //                     { $eq: ["$id_scheme_account", "$$schemeAccountId"] },
  //                     { $eq: ["$id_customer", "$$customerId"] },
  //                   ],
  //                 },
  //               },
  //             },
  //             { $sort: { payment_date: -1 } },
  //             { $limit: 1 },
  //           ],
  //           as: "lastPayment",
  //         },
  //       },
  //       {
  //         $addFields: {
  //           lastPaidAmount: {
  //             $ifNull: [
  //               { $arrayElemAt: ["$lastPayment.payment_amount", 0] },
  //               0,
  //             ],
  //           },
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalOverduePayment: {
  //             $switch: {
  //               branches: [
  //                 {
  //                   case: { $eq: ["$Classification.name", "Fixed"] },
  //                   then: { $multiply: ["$amount", "$installmentDue"] },
  //                 },
  //                 {
  //                   case: { $eq: ["$Classification.name", "Flexi"] },
  //                   then: {
  //                     $concat: [
  //                       {
  //                         $toString: {
  //                           $multiply: [
  //                             "$Scheme.min_amount",
  //                             "$installmentDue",
  //                           ],
  //                         },
  //                       },
  //                       " - ",
  //                       {
  //                         $toString: {
  //                           $multiply: [
  //                             "$Scheme.max_amount",
  //                             "$installmentDue",
  //                           ],
  //                         },
  //                       },
  //                     ],
  //                   },
  //                 },
  //                 {
  //                   case: { $eq: ["$Classification.name", "Flexi-Fixed"] },
  //                   then: { $multiply: ["$lastPaidAmount", "$installmentDue"] },
  //                 },
  //               ],
  //               default: 0,
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           scheme_name: "$Scheme.scheme_name",
  //           classification_name:"$Classification.name",
  //           customer_name: { $concat: ["$Customer.firstname", " ", "$Customer.lastname"] },
  //           customer_mobile:"Customer.mobile",
  //           installmentDue: 1,
  //           totalOverduePayment: {
  //             $cond: {
  //               if: { $eq: ["$Classification.name", "Flexi"] },
  //               then: {
  //                 $concat: [
  //                   { $toString: "$minOverduePayment" },
  //                   " - ",
  //                   { $toString: "$maxOverduePayment" },
  //                 ],
  //               },
  //               else: { $toString: "$totalOverduePayment" },
  //             },
  //           },
  //         },
  //       },
  //     ]);
  //     return dueData.length > 0 ? dueData : null;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  async employeeReferralReport(page, limit, query) {
    try {
      const dueData = await schemeAccountModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$referral_id",
            referralCount: { $sum: 1 },
            referral_type: { $first: "$referral_type" },
          },
        },
        { $match: { referral_type: "Employee" } },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "employeeData",
          },
        },
        { $unwind: "$employeeData" },
        {
          $lookup: {
            from: "branches",
            localField: "employeeData.id_branch",
            foreignField: "_id",
            as: "branchData",
          },
        },
        { $unwind: "$branchData" },
        {
          $lookup: {
            from: "schemeaccounts",
            let: { referralId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$referral_id", "$$referralId"] },
                },
              },
            ],
            as: "schemeAccounts",
          },
        },
        {
          $lookup: {
            from: "payments",
            let: { schemeAccountIds: "$schemeAccounts._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$id_scheme_account", "$$schemeAccountIds"],
                  },
                },
              },
            ],
            as: "paymentData",
          },
        },
        {
          $addFields: {
            totalPayment: {
              $sum: "$paymentData.total_amt",
            },
            totalWeight: {
              $sum: "$paymentData.metal_weight",
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                {
                  firstname: "$employeeData.firstname",
                  lastname: "$employeeData.lastname",
                  branchname: "$branchData.branch_name",
                  referralCount: "$referralCount",
                  paymentAmount: {
                    $ifNull: ["$totalPayment", 0],
                  },
                  paymentWeight: {
                    $ifNull: ["$totalWeight", 0],
                  },
                },
              ],
            },
          },
        },
        { $sort: { referralCount: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);

      if (dueData.length > 0) {
        return dueData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // async customerReferralReport(page, limit, query) {
  //   try {
  //     const dueData = await schemeAccountModel.aggregate([
  //       { $match: query },
  //       {
  //         $group: {
  //           _id: '$referral_id',
  //           referralCount: { $sum: 1 },
  //           referral_type: { $first: '$referral_type' },
  //         },
  //       },
  //       { $match: { referral_type: "Customer" } },
  //       {
  //         $lookup: {
  //           from: 'customers',
  //           localField: '_id',
  //           foreignField: '_id',
  //           as: 'customerData',
  //         },
  //       },
  //       { $unwind: '$customerData' },
  //       {
  //         $lookup: {
  //           from: 'branches',
  //           localField: 'customerData.id_branch',
  //           foreignField: '_id',
  //           as: 'branchData',
  //         },
  //       },
  //       { $unwind: '$branchData' },
  //       {
  //         $lookup: {
  //           from: 'schemeaccounts',
  //           let: { referralId: '$_id' },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: { $eq: ['$referral_id', '$$referralId'] },
  //               },
  //             },
  //           ],
  //           as: 'schemeAccounts',
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: 'payments',
  //           let: { schemeAccountIds: '$schemeAccounts._id' },
  //           pipeline: [
  //             {
  //               $match: {
  //                 $expr: {
  //                   $in: ['$id_scheme_account', '$$schemeAccountIds'],
  //                 },
  //               },
  //             },
  //           ],
  //           as: 'paymentData',
  //         },
  //       },
  //       {
  //         $addFields: {
  //           totalPayment: {
  //             $sum: '$paymentData.total_amt',
  //           },
  //           totalWeight: {
  //             $sum: '$paymentData.metal_weight',
  //           },
  //         },
  //       },
  //       {
  //         $replaceRoot: {
  //           newRoot: {
  //             $mergeObjects: [
  //               {
  //                 firstname: '$customerData.firstname',
  //                 lastname: '$customerData.lastname',
  //                 branchname: '$branchData.branch_name',
  //                 referralCount: '$referralCount',
  //                 paymentAmount: {
  //                   $ifNull: ['$totalPayment', 0],
  //                 },
  //                 paymentWeight: {
  //                   $ifNull: ['$totalWeight', 0],
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       },
  //       { $sort: { referralCount: -1 } },
  //       { $skip: (page - 1) * limit },
  //       { $limit: limit },
  //     ]);

  //     if (dueData.length > 0) {
  //       return dueData;
  //     }

  //     return null;
  //   } catch (error) {
  //     console.error(error);
  //     throw error;
  //   }
  // }

  async customerReferralReport({ query, documentskip, documentlimit }) {
    try {
      const dueData = await schemeAccountModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$referral_id",
            referralCount: { $sum: 1 },
            referral_type: { $first: "$referral_type" },
          },
        },
        { $match: { referral_type: "Customer" } },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customerData",
          },
        },
        { $unwind: "$customerData" },
        {
          $lookup: {
            from: "branches",
            localField: "customerData.id_branch",
            foreignField: "_id",
            as: "branchData",
          },
        },
        { $unwind: "$branchData" },
        {
          $lookup: {
            from: "referrallists",
            localField: "_id",
            foreignField: "id_customer",
            as: "referralListData",
          },
        },
        {
          $unwind: {
            path: "$referralListData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            total_rewards_earned: {
              $ifNull: [{ $sum: "$referralListData.credited_amount" }, 0],
            },
          },
        },
        {
          $group: {
            _id: "$_id",
            referralCount: { $first: "$referralCount" },
            firstname: { $first: "$customerData.firstname" },
            lastname: { $first: "$customerData.lastname" },
            branchname: { $first: "$branchData.branch_name" },
            total_rewards_earned: { $first: "$total_rewards_earned" },
          },
        },
        { $skip: documentskip },
        { $limit: documentlimit },
        {$sort:{_id:-1}}
      ]);

      if (dueData.length > 0) {
        return dueData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  async getGiftReport({query, documentskip, documentlimit}) {
    try {

      if (query.id_branch && typeof query.id_branch === "string") {
        query.id_branch = new mongoose.Types.ObjectId(query.id_branch);
      }
    
      const documents = await giftItemModel.countDocuments(query);

      const result = await giftItemModel.aggregate([
        { $match: query }, 
        {
          $lookup: {
            from: "giftinwards",
            localField: "_id",
            foreignField: "id_gift",
            as: "purchaseGifts",
          },
        },
        { $unwind: { path: "$purchaseGifts", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "giftissues",
            localField: "_id",
            foreignField: "gifts.id_gift",
            as: "handoveredGifts",
          },
        },
        { $unwind: { path: "$handoveredGifts", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$handoveredGifts.gifts", preserveNullAndEmptyArrays: true } },
  
        {
          $match: {
            $or: [
              { $expr: { $eq: ["$_id", "$handoveredGifts.gifts.id_gift"] } },
              { "handoveredGifts.gifts.id_gift": { $exists: false } },
            ],
          },
        },
  
        {
          $group: {
            _id: "$_id",
            name: { $first: "$gift_name" },
  
            totalPurchased: {
              $sum: { $ifNull: ["$purchaseGifts.qty", 0] },
            },
            totalHandovered: {
              $sum: { $ifNull: ["$handoveredGifts.gifts.qty", 0] },
            },
          },
        },
  
        {
          $addFields: {
            pendingGifts: { $subtract: ["$totalPurchased", "$totalHandovered"] },
          },
        },
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
  
}

export default ReportRepository;
