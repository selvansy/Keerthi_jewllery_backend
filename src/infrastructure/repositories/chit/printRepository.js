import mongoose from "mongoose";
import paymentModel from "../../models/chit/paymentModel.js";
import branchModel from "../../models/chit/branchModel.js";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js";

class PrintRepository {
  async getReceipt(filter) {
    try {
      const pipeline = [
        { $match: { payment_status: 1 } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "schemeaccounts",
          },
        },
        {
          $unwind: {
            path: "$schemeaccounts",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      if (filter?.accountNumber) {
        pipeline.push({
          $match: {
            "schemeaccounts.scheme_acc_number": {
              $regex: `^${filter.accountNumber}$`,
              $options: "i",
            },
          },
        });
      }
      pipeline.push({
        $project: {
          _id: 1,
          payment_receipt: 1,
          paid_installments: 1,
          createdAt: 1,
          payment_amount: 1,
        },
      });

      const result = await paymentModel.aggregate(pipeline);
      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get",
      };
    }
  }

  async getReceiptByPaymentId(paymentIds) {
    try {
      // Convert string IDs to ObjectId
      const objectIds = paymentIds.map((id) => new mongoose.Types.ObjectId(id));

      const result = await paymentModel.aggregate([
        {
          $match: {
            _id: { $in: objectIds },
          },
        },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "schemeaccounts",
          },
        },
        {
          $unwind: {
            path: "$schemeaccounts",
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
          $project: {
            receiptNo: "$payment_receipt",
            paymentModeName: 1,
            date: "$createdAt",
            amount: "$payment_amount",
            metalRate: "$metal_rate",
            installmentNo: {
              $concat: [
                { $toString: "$installment" },
                "/",
                { $toString: "$Scheme.total_installments" },
              ],
            },
            metal_weight: 1,
          },
        },
      ]);

      return result;
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get payments",
      };
    }
  }

  async findSchemeInfoByPaymentId(paymentId) {
    try {
      const objectId = new mongoose.Types.ObjectId(paymentId);
      const result = await paymentModel.aggregate([
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "schemeaccounts",
          },
        },
        {
          $unwind: {
            path: "$schemeaccounts",
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
            from: "customers",
            localField: "id_customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            total_weight: "$schemeaccounts.weight",
            total_amt: "$schemeaccounts.amount",
            customerName: "$customer.firstname",
            mobile: "$customer.mobile",
            schemeName: "$Scheme.scheme_name",
            accounterName: "$schemeaccounts.account_name",
            schemeCode: "$schemeaccounts.scheme_acc_number",
            scheme_type: "$Scheme.scheme_type",
          },
        },
      ]);
      return result[0];
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get payments",
      };
    }
  }

  async findCompanyDetails(branchId) {
    try {
      const findCompanyData = await branchModel
        .findById(branchId)
        .populate("id_city")
        .populate("id_state");
      return {
        branch_name: findCompanyData?.branch_name,
        address: [
          findCompanyData?.address,
          findCompanyData?.id_city?.city_name,
          findCompanyData?.id_state?.state_name,
        ]
          .filter(Boolean) // removes undefined, null, empty string
          .join(", "), // join with commas only when values exist
        phone: [
          findCompanyData?.branch_landline &&
            `Cell ${findCompanyData?.branch_landline}`,
          findCompanyData?.mobile && findCompanyData?.mobile,
        ]
          .filter(Boolean)
          .join(", "),
      };
    } catch (error) {
      throw error;
    }
  }
  async getPassbookData(filter) {
    try {
      const page = parseInt(filter?.page) || 1;
      const limit = parseInt(filter?.limit) || 10;
      const skip = (page - 1) * limit;
      const pipeline = [
        { $match: { payment_status: 1 } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "id_scheme_account",
            foreignField: "_id",
            as: "schemeaccounts",
          },
        },
        {
          $unwind: {
            path: "$schemeaccounts",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      // ✅ Filter by account number (if provided)
      if (filter?.accountNumber) {
        pipeline.push({
          $match: {
            "schemeaccounts.scheme_acc_number": {
              $regex: `^${filter.accountNumber}$`,
              $options: "i",
            },
          },
        });
      }

      // ✅ Split payment into multiple docs per installment
      pipeline.push(
        {
          $addFields: {
            installmentIndexes: {
              $range: [0, { $ifNull: ["$paid_installments", 1] }],
            },
          },
        },
        { $unwind: "$installmentIndexes" },
        {
          $addFields: {
            installment_number: {
              $add: ["$installmentIndexes", 1],
            },
            payment_amount: {
              $cond: [
                { $gt: ["$paid_installments", 0] },
                { $divide: ["$payment_amount", "$paid_installments"] },
                "$payment_amount",
              ],
            },

            metal_weight: {
              $cond: [
                { $gt: ["$paid_installments", 0] },
                { $divide: ["$metal_weight", "$paid_installments"] },
                "$metal_weight",
              ],
            },
          },
        },
        {
          $set: {
            truncated_metal_weight: { $trunc: ["$metal_weight", 3] },
          },
        },
        {
          $setWindowFields: {
            sortBy: { createdAt: 1 },
            output: {
              index: { $documentNumber: {} },
              accWeight: {
                $sum: "$truncated_metal_weight",
                window: {
                  documents: ["unbounded", "current"],
                },
              },
            },
          },
        },

        {
          $project: {
            _id: 1,
            payment_receipt: 1,
            createdAt: 1,
            schemeaccounts: 1,
            installment_number: 1,
            payment_amount: 1,
            metal_rate: 1,
            metal_weight: 1,
            accWeight: 1,
          },
        },
        {
          $setWindowFields: {
            sortBy: { createdAt: 1 },
            output: {
              index: { $documentNumber: {} },
            },
          },
        }
      );

      const countPipeline = [...pipeline, { $count: "totalItems" }];
      const totalResult = await paymentModel.aggregate(countPipeline);
      const totalItems = totalResult[0]?.totalItems || 0;

      // ✅ Apply pagination
      pipeline.push({ $skip: skip }, { $limit: limit });

      const result = await paymentModel.aggregate(pipeline);
      const findAccountDetails = await schemeAccountModel.aggregate([
        {
          $match: {
            scheme_acc_number: {
              $regex: new RegExp(`^${filter.accountNumber}$`, "i"),
            },
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
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "Branch",
          },
        },
        { $unwind: { path: "$Branch", preserveNullAndEmptyArrays: true } },

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
          $project: {
            schemeName: "$Scheme.scheme_name",
            schemeType: "$Scheme.scheme_type",
            branchName: "$Branch.branch_name",
            schemeCode: "$scheme_acc_number",
            // amount
            name: "$account_name",
            address: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$Customer.address", null] },
                    { $eq: ["$Customer.address", ""] },
                  ],
                },
                "N/A",
                "$Customer.address",
              ],
            },

            mobile: "$Customer.mobile",
          },
        },
      ]);

      return {
        payments: result,
        schemeDetails: findAccountDetails[0],
        pagination: {
          totalItems,
          currentPage: page,
          totalPages: Math.ceil(totalItems / limit),
          limit,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get passbook data",
      };
    }
  }
}

export default PrintRepository;
