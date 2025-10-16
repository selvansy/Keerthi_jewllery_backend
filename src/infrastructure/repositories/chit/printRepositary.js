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
          $match: { "schemeaccounts.scheme_acc_number": filter.accountNumber },
        });
      }
      pipeline.push({
        $project: {
          _id: 1,
          payment_receipt: 1,
          paid_installments: 1,
          createdAt: 1,
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
          $project: {
            receiptNo: "$payment_receipt",
            paymentModeName: 1,
            date: "$createdAt",
            amount: "$payment_amount",
            metalRate: "$metal_rate",
            metal_weight: 1,
            installmentNo:"$paid_installments"
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
            customerName: "$customer.firstname",
            mobile: "$customer.mobile",
            schemeName: "$Scheme.scheme_name",
            accounterName: "$schemeaccounts.account_name",
            schemeCode: "$schemeaccounts.scheme_acc_number",
            
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

  async getBranchDetails(branchId) {
    try {
      const branchData = await branchModel
        .findById(branchId)
        .populate("id_city")
        .populate("id_state")
        .populate("id_country")
        .populate("id_client");
      if (branchData) {
        return {
          companyName: branchData?.id_client?.company_name,
          address: `${branchData?.address} ${branchData?.id_city?.city_name}`,
          phone: `${branchData?.branch_landline}, ${branchData?.mobile}`,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Failed to get payments",
      };
    }
  }
}
 
export default PrintRepository;