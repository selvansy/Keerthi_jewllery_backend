import mongoose from "mongoose";
import paymentModel from "../../models/chit/paymentModel.js";
import branchModel from "../../models/chit/branchModel.js";

class PrintRepository {
  async getReceipt(filter) {
    try {
      const pipeline = [
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
            scheme_type:"$Scheme.scheme_type"
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
}

export default PrintRepository;
