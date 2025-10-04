import customerModel from "../../models/chit/customerModel.js";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js";
import mongoose, { isValidObjectId } from "mongoose";
import referralMessageMode from "../../models/chit/referralMessageMode.js";
import bcrypt from "bcrypt";
import config from "../../../config/chit/env.js";

class CustomerRepository {
  async findById(id) {
    try {
      const userData = await customerModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id), is_deleted: false },
        },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        {
          $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "states",
            localField: "id_state",
            foreignField: "_id",
            as: "stateDetails",
          },
        },
        {
          $unwind: { path: "$stateDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "countries",
            localField: "id_country",
            foreignField: "_id",
            as: "countryDetails",
          },
        },
        {
          $unwind: {
            path: "$countryDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "cities",
            localField: "id_city",
            foreignField: "_id",
            as: "cityDetails",
          },
        },
        { $unwind: { path: "$cityDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "s3Details",
          },
        },
        { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            active: 1,
            firstname: 1,
            lastname: 1,
            mobile: 1,
            is_deleted: 1,
            date_of_birth: 1,
            address: 1,
            gender: 1,
            pincode: 1,
            cus_img: 1,
            id_proof: 1,
            added_by: 1,
            whatsapp: 1,
            authorno: 1,
            aadharNumber: 1,
            nominee_name: 1,
            nominee_relationship: 1,
            nominee_mobile: 1,
            id_proof: 1,
            referral_id: 1,
            referral_type: 1,
            email: 1,
            pan: 1,
            mpin:1,
            date_of_wed: 1,
            "branchDetails._id": 1,
            "branchDetails.branch_name": 1,
            "branchDetails.active": 1,
            "stateDetails._id": 1,
            "stateDetails.state_name": 1,
            "countryDetails._id": 1,
            "countryDetails.country_name": 1,
            "countryDetails.id_country": 1,
            "cityDetails._id": 1,
            "cityDetails.city_name": 1,
            "cityDetails.id_city": 1,
            pathurl: {
              $concat: [
                "$s3Details.s3display_url",
                `${config.AWS_LOCAL_PATH}customer/`,
              ],
            },
          },
        },
        {
          $limit: 1,
        },
      ]);

      if (!userData || userData.length === 0) {
        return null;
      }

      return userData[0];
    } catch (error) {
      console.error(error);
    }
  }

  async find(query) {
    try {
      const userData = await customerModel
        .find(query)
        .select("-password -confirmpassword -gender -passwd -mpin");

      if (userData.length === 0) {
        return null;
      }

      return userData;
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(query) {
    try {
      const data = await customerModel.findOne(query).populate([
        { path: "id_branch", select: "_id branch_name active" },
        { path: "id_state", select: "_id state_name" },
        { path: "id_country", select: "_id country_name id_country" },
        { path: "id_city", select: "_id city_name id_city" },
      ]);

      return data ? data : null;
    } catch (error) {
      console.error(error);
    }
  }

  async findCustomerData(data) {
    try {
      let query = {};

      if (mongoose.Types.ObjectId.isValid(data)) {
        query._id = data;
      } else {
        query.mobile = data;
      }

      const exists = await customerModel
        .findOne(query)
        .select("-mpin -password -passwd");

      return exists || null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async existingUser(mobile) {
    try {
      const exists = await customerModel.findOne({ mobile: mobile });

      if (!exists) {
        return null;
      }

      return exists;
    } catch (error) {
      console.error(error);
    }
  }

  async checkUser(id, mobile) {
    try {
      const existingUser = await customerModel.findOne({
        _id: { $ne: id },
        mobile: mobile,
      });

      if (existingUser) {
        return existingUser;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }

  async addCustomer(data) {
    try {
      const savedUser = await customerModel.create(data);

      if (!savedUser) {
        return null;
      }

      return savedUser._id;
    } catch (error) {
      console.error(error);
    }
  }

  async editCustomer(id, data) {
    try {
      const updatedData = await customerModel.updateOne(
        { _id: id },
        { $set: data },
        { new: true }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteCustomer(id) {
    try {
      const updatedData = await customerModel.updateOne(
        { _id: id },
        { $set: { is_deleted: true, active: false } }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async activateCustomer(id, active) {
    try {
      const updatedData = await customerModel.updateOne(
        { _id: id },
        { $set: { active: !active } }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async searchCustomerByMobile(mobile) {
    try {
      const customerData = await customerModel.findOne({
        mobile: mobile,
        is_deleted: false,
      });

      if (!customerData) {
        return null;
      }

      return customerData;
    } catch (error) {
      console.error(error);
    }
  }

  async finByReferralCode(code) {
    try {
      const data = await customerModel
        .findOne({ referral_code: code, is_deleted: false })
        .select("firstname lastname")
        .lean();

      if (!data) return null;

      return data;
    } catch (error) {
      console.error("Error :", error);
    }
  }

  // async getAllCustomers({ query, documentskip, documentlimit }) {
  //   try {
  //     const totalCount = await customerModel.countDocuments(query);
  //     const data = await customerModel
  //       .find(query)
  //       .skip(documentskip)
  //       .limit(documentlimit)
  //       .select("_id active firstname lastname mobile date_add referral_code")
  //       .sort({ _id: -1 })

  //     if (!data || data.length === 0) return null;

  //     return { data, totalCount };
  //   } catch (error) {
  //     console.error("Error :", error);
  //   }
  // }
  async getAllCustomers({ query, documentskip, documentlimit }) {
    try {
      const aggregationPipeline = [
        { $match: query },
        { $sort: { _id: -1 } },
        { $skip: documentskip },
        { $limit: documentlimit },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "_id",
            foreignField: "id_customer",
            as: "schemes",
          },
        },

        {
          $addFields: {
            schemesCount: { $size: "$schemes" },
          },
        },

        {
          $project: {
            _id: 1,
            active: 1,
            firstname: 1,
            lastname: 1,
            mobile: 1,
            date_add: 1,
            referral_code: 1,
            schemesCount: 1,
          },
        },
      ];

      const totalCount = await customerModel.countDocuments(query);

      const data = await customerModel.aggregate(aggregationPipeline);

      if (!data || data.length === 0) return null;

      return { data, totalCount };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async countDocuments(filter) {
    try {
      const docCount = await customerModel.countDocuments(filter);

      return docCount ? docCount : null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error : add scheme account");
    }
  }

  async findInfo(id) {
    try {
      const data = await customerModel.findById(id).select("mobile").lean();

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async updatePassword(userId, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      return await customerModel.findByIdAndUpdate(
        userId,
        {
          password: hashedPassword,
          otp: null,
          otpExpiry: null,
        },
        { new: true }
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findByIdAndUpdate(userId, data) {
    try {
      if (!isValidObjectId(userId)) {
        return { success: false, message: "Provide a valid user ID" };
      }

      const updatedUser = await customerModel.findByIdAndUpdate(
        userId,
        data,
        { new: true }
      );

      if (!updatedUser) {
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        message: "Password updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error updating password:", error);
      return {
        success: false,
        message: "Failed to update password",
        error: error.message,
      };
    }
  }

  async getCustomersByBranch(branchId) {
    try {
      const customers = await customerModel.find(
        {
          id_branch: branchId,
          is_deleted: false,
          active: true,
        },
        { _id: 1, firstname: 1, lastname: 1, mobile: 1 }
      );

      return customers.length > 0 ? customers : null;
    } catch (error) {
      console.error("Error fetching customers by branch:", error);
      throw error;
    }
  }

  async getCustomersByIds(customerIds) {
    try {
      if (!Array.isArray(customerIds) || customerIds.length === 0) {
        return null;
      }

      const customers = await customerModel.find(
        {
          _id: {
            $in: customerIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
        { _id: 1, firstname: 1, lastname: 1, mobile: 1 }
      );

      return customers.length ? customers : null;
    } catch (error) {
      console.error("Error fetching customers by IDs:", error);
      return null;
    }
  }

  async getCustomerIdsBySchemeIds(schemeIds) {
    try {
      if (!Array.isArray(schemeIds) || schemeIds.length === 0) {
        return null;
      }

      const schemeAccounts = await schemeAccountModel.find(
        {
          id_scheme: {
            $in: schemeIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          active: true,
          is_deleted: false,
        },
        { id_customer: 1 }
      );

      const customerIds = schemeAccounts.map((sa) => sa.id_customer);
      return customerIds.length ? customerIds : null;
    } catch (error) {
      console.error("Error fetching customer IDs by scheme:", error);
      return null;
    }
  }

  async verifyMpin(mobile, mpin) {
    try {
      const checkMpin = await customerModel.findOne({
        mobile: mobile,
        mpin: mpin,
      });

      return checkMpin;
    } catch (err) {
      return null;
    }
  }

  async updateUniversal(id, data) {
    try {
      const updatedData = await customerModel.updateOne(
        { _id: id },
        { $set: data },
        { new: true }
      );

      if (updatedData.matchedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async getReferrlMessage() {
    try {
      const referralData = await referralMessageMode.findOne();

      if (!referralData) {
        return null;
      }

      return referralData;
    } catch (error) {
      console.error(error);
    }
  }

  async customerOverview({ branch, mobile, idCustomer }) {
    try {
      const matchStage = idCustomer
        ? {
            _id: new mongoose.Types.ObjectId(idCustomer),
            active: true,
          }
        : {
            id_branch: new mongoose.Types.ObjectId(branch),
            mobile: Number(mobile),
            active: true,
          };

      const result = await customerModel.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "branch",
          },
        },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeaccounts",
            let: { customerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$id_customer", "$$customerId"] },
                },
              },
              {
                $lookup: {
                  from: "schemes",
                  localField: "id_scheme",
                  foreignField: "_id",
                  as: "scheme",
                },
              },
              {
                $unwind: { path: "$scheme", preserveNullAndEmptyArrays: true },
              },
              {
                $lookup: {
                  from: "payments",
                  localField: "_id",
                  foreignField: "id_scheme_account",
                  as: "payments",
                },
              },
            ],
            as: "schemeAccounts",
          },
        },
        {
          $addFields: {
            totalSchemeAccounts: { $size: "$schemeAccounts" },
            uniqueSchemesCount: {
              $size: {
                $reduce: {
                  input: "$schemeAccounts",
                  initialValue: [],
                  in: {
                    $cond: [
                      { $in: ["$$this.id_scheme", "$$value"] },
                      "$$value",
                      { $concatArrays: ["$$value", ["$$this.id_scheme"]] },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $unwind: {
            path: "$schemeAccounts",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: {
              customerId: "$_id",
              schemeId: "$schemeAccounts.scheme._id",
            },
            customerDetails: { $first: "$$ROOT" },
            schemeName: { $first: "$schemeAccounts.scheme.scheme_name" },
            openAccounts: {
              $sum: {
                $cond: [{ $eq: ["$schemeAccounts.status", 0] }, 1, 0],
              },
            },
            closedAccounts: {
              $sum: {
                $cond: [{ $eq: ["$schemeAccounts.status", 1] }, 1, 0],
              },
            },
            precloseAccounts: {
              $sum: {
                $cond: [{ $eq: ["$schemeAccounts.status", 3] }, 1, 0],
              },
            },
            refundAccounts: {
              $sum: {
                $cond: [{ $eq: ["$schemeAccounts.status", 4] }, 1, 0],
              },
            },
            totalAmountPaid: {
              $sum: {
                $ifNull: ["$schemeAccounts.amount", 0],
              },
            },
            totalAmountPayable: {
              $sum: {
                $ifNull: ["$schemeAccounts.amount", 0],
              },
            },
            totalWeightPayable: {
              $sum: {
                $ifNull: ["$schemeAccounts.weight", 0],
              },
            },
          },
        },
        {
          $group: {
            _id: "$_id.customerId",
            customerDetails: { $first: "$customerDetails" },
            schemes: {
              $push: {
                schemeName: "$schemeName",
                openAccounts: "$openAccounts",
                closedAccounts: "$closedAccounts",
                precloseAccounts: "$precloseAccounts",
                amountPaid: "$totalAmountPaid",
              },
            },
            totalAmountPayable: { $sum: "$totalAmountPayable" },
            totalWeightPayable: { $sum: "$totalWeightPayable" },
            totalClosedSchemes: { $sum: "$closedAccounts" },
            precloseAccounts: { $sum: "$precloseAccounts" },
            refundSchemes: { $sum: "$refundAccounts" },
            uniqueSchemesCount: {
              $first: "$customerDetails.uniqueSchemesCount",
            },
          },
        },
        {
          $addFields: {
            totalOpenSchemes: {
              $sum: "$schemes.openAccounts",
            },
          },
        },
        {
          $facet: {
            customerData: [{ $limit: 1 }],
            referrals: [
              {
                $lookup: {
                  from: "customers",
                  let: { customerId: "$customerDetails._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$referral_id", "$$customerId"] },
                      },
                    },
                    { $count: "count" },
                  ],
                  as: "referralCount",
                },
              },
              {
                $unwind: {
                  path: "$referralCount",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            walletData: [
              {
                $lookup: {
                  from: "wallets",
                  let: { customerId: "$customerDetails._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$id_customer", "$$customerId"] },
                      },
                    },
                    { $limit: 1 },
                  ],
                  as: "walletData",
                },
              },
              {
                $unwind: {
                  path: "$walletData",
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            giftStats: [
              {
                $lookup: {
                  from: "giftissues",
                  let: { customerId: "$customerDetails._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: { $eq: ["$id_customer", "$$customerId"] },
                      },
                    },
                    {
                      $lookup: {
                        from: "schemeaccounts",
                        localField: "id_scheme_account",
                        foreignField: "_id",
                        as: "schemeAccount",
                      },
                    },
                    {
                      $unwind: {
                        path: "$schemeAccount",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $lookup: {
                        from: "schemes",
                        localField: "schemeAccount.id_scheme",
                        foreignField: "_id",
                        as: "scheme",
                      },
                    },
                    {
                      $unwind: {
                        path: "$scheme",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $group: {
                        _id: null,
                        totalGiftsIssued: { $sum: 1 },
                        totalSchemeGifts: {
                          $sum: {
                            $cond: [
                              { $ne: ["$id_scheme_account", null] },
                              1,
                              0,
                            ],
                          },
                        },
                        totalNonSchemeGifts: {
                          $sum: {
                            $cond: [
                              { $eq: ["$id_scheme_account", null] },
                              1,
                              0,
                            ],
                          },
                        },
                        totalGiftsLeftToReceive: {
                          $sum: {
                            $cond: [
                              {
                                $and: [
                                  { $ne: ["$id_scheme_account", null] },
                                  {
                                    $gt: [
                                      "$scheme.no_of_gifts",
                                      "$schemeAccount.gift_issues",
                                    ],
                                  },
                                ],
                              },
                              {
                                $subtract: [
                                  "$scheme.no_of_gifts",
                                  "$schemeAccount.gift_issues",
                                ],
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  ],
                  as: "giftStats",
                },
              },
              {
                $addFields: { giftStats: { $arrayElemAt: ["$giftStats", 0] } },
              },
            ],
          },
        },
        {
          $unwind: { path: "$customerData", preserveNullAndEmptyArrays: true },
        },
        { $unwind: { path: "$referrals", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$walletData", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$giftStats", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            customerDetails: {
              customerName: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$customerData.customerDetails.lastname", null] },
                      {
                        $ne: [
                          {
                            $trim: {
                              input: "$customerData.customerDetails.lastname",
                            },
                          },
                          "",
                        ],
                      },
                    ],
                  },
                  then: {
                    $concat: [
                      {
                        $ifNull: [
                          "$customerData.customerDetails.firstname",
                          "",
                        ],
                      },
                      " ",
                      {
                        $ifNull: ["$customerData.customerDetails.lastname", ""],
                      },
                    ],
                  },
                  else: {
                    $ifNull: ["$customerData.customerDetails.firstname", ""],
                  },
                },
              },
              _id: { $ifNull: ["$customerData.customerDetails._id", null] },
              branch: {
                $ifNull: [
                  "$customerData.customerDetails.branch.branch_name",
                  "Unknown",
                ],
              },
              mobile: {
                $ifNull: ["$customerData.customerDetails.mobile", null],
              },
              whatsapp: {
                $ifNull: ["$customerData.customerDetails.whatsapp", null],
              },
              gender: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $eq: ["$customerData.customerDetails.gender", 1],
                      },
                      then: "Male",
                    },
                    {
                      case: {
                        $eq: ["$customerData.customerDetails.gender", 2],
                      },
                      then: "Female",
                    },
                    {
                      case: {
                        $eq: ["$customerData.customerDetails.gender", 3],
                      },
                      then: "Others",
                    },
                  ],
                  default: "Unknown",
                },
              },
              address: {
                $ifNull: ["$customerData.customerDetails.address", ""],
              },
              pan: { $ifNull: ["$customerData.customerDetails.pan", ""] },
              aadharNumber: {
                $ifNull: ["$customerData.customerDetails.aadharNumber", ""],
              },
              dateOfBirth: {
                $ifNull: ["$customerData.customerDetails.date_of_birth", null],
              },
              referralCode: {
                $ifNull: ["$customerData.customerDetails.referral_code", ""],
              },
              weddingAnniversary: {
                $ifNull: ["$customerData.customerDetails.date_of_wed", null],
              },
              profileImage: {
                $ifNull: ["$customerData.customerDetails.cus_img", ""],
              },
            },
            schemes: { $ifNull: ["$customerData.schemes", []] },
            totalOpenSchemes: {
              $ifNull: ["$customerData.totalOpenSchemes", 0],
            },
            totalAmountPayable: {
              $ifNull: ["$customerData.totalAmountPayable", 0],
            },
            totalWeightPayable: {
              $ifNull: ["$customerData.totalWeightPayable", 0],
            },
            totalClosedSchemes: {
              $ifNull: ["$customerData.totalClosedSchemes", 0],
            },
            precloseAccounts: {
              $ifNull: ["$customerData.precloseAccounts", 0],
            },
            refundSchemes: { $ifNull: ["$customerData.refundSchemes", 0] },
            referralDetails: {
              referralCount: { $ifNull: ["$referrals.referralCount.count", 0] },
              walletAmount: {
                $ifNull: ["$walletData.walletData.total_reward_amt", 0],
              },
              pendingAmount: {
                $ifNull: ["$walletData.walletData.balance_amt", 0],
              },
              redeemedAmount: {
                $ifNull: ["$walletData.walletData.redeem_amt", 0],
              },
            },
            totalGiftsIssued: {
              $ifNull: ["$giftStats.giftStats.totalGiftsIssued", 0],
            },
            totalSchemeGifts: {
              $ifNull: ["$giftStats.giftStats.totalSchemeGifts", 0],
            },
            totalNonSchemeGifts: {
              $ifNull: ["$giftStats.giftStats.totalNonSchemeGifts", 0],
            },
            totalGiftsLeftToReceive: {
              $ifNull: ["$giftStats.giftStats.totalGiftsLeftToReceive", 0],
            },
            uniqueSchemesCount: {
              $ifNull: ["$customerData.uniqueSchemesCount", 0],
            },
            totalSchemeAccounts: {
              $ifNull: ["$customerData.customerDetails.totalSchemeAccounts", 0],
            },
          },
        },
      ]);

      return (
        result[0] || {
          customerDetails: {
            customerName: "",
            _id: null,
            branch: "Unknown",
            mobile: null,
            whatsapp: null,
            gender: "Unknown",
            address: "",
            pan: "",
            aadharNumber: "",
            dateOfBirth: null,
            referralCode: "",
            weddingAnniversary: null,
            profileImage: "",
          },
          schemes: [],
          totalOpenSchemes: 0,
          totalAmountPayable: 0,
          totalWeightPayable: 0,
          totalClosedSchemes: 0,
          precloseAccounts: 0,
          refundSchemes: 0,
          referralDetails: {
            referralCount: 0,
            walletAmount: 0,
            pendingAmount: 0,
            redeemedAmount: 0,
          },
          totalGiftsIssued: 0,
          totalSchemeGifts: 0,
          totalNonSchemeGifts: 0,
          totalGiftsLeftToReceive: 0,
          uniqueSchemesCount: 0,
          totalSchemeAccounts: 0,
        }
      );
    } catch (error) {
      console.error(error);
      return {
        customerDetails: {
          customerName: "",
          _id: null,
          branch: "Unknown",
          mobile: null,
          whatsapp: null,
          gender: "Unknown",
          address: "",
          pan: "",
          aadharNumber: "",
          dateOfBirth: null,
          referralCode: "",
          weddingAnniversary: null,
          profileImage: "",
        },
        schemes: [],
        totalOpenSchemes: 0,
        totalAmountPayable: 0,
        totalWeightPayable: 0,
        totalClosedSchemes: 0,
        precloseAccounts: 0,
        refundSchemes: 0,
        referralDetails: {
          referralCount: 0,
          walletAmount: 0,
          pendingAmount: 0,
          redeemedAmount: 0,
        },
        totalGiftsIssued: 0,
        totalSchemeGifts: 0,
        totalNonSchemeGifts: 0,
        totalGiftsLeftToReceive: 0,
        uniqueSchemesCount: 0,
        totalSchemeAccounts: 0,
      };
    }
  }

  async getExternal() {
    try {
      const result = await customerModel.aggregate([
        { $match: { active: true } },
        { $project: { idStr: { $toString: "$_id" } } },
        {
          $group: {
            _id: null,
            ids: { $push: "$idStr" },
          },
        },
        {
          $project: {
            _id: 0,
            ids: 1,
          },
        },
      ]);

      return result[0]?.ids || [];
    } catch (error) {
      console.error("Error fetching external IDs:", error);
      return [];
    }
  }

  async getCustomerDataLess(idCustomer) {
    try {
      const result = await customerModel
        .findById(idCustomer)
        .select("password active is_deleted");

      return result;
    } catch (error) {
      console.error("Error fetching external IDs:", error);
      return [];
    }
  }

  async getCustomersByIds(customerIds, branchIds, fieldsToReturn = {}) {
    try {
      const branchObjectIds = branchIds.map(
        (id) => new mongoose.Types.ObjectId(id)
      );

      const defaultFields = {
        _id: 1,
        mobile: 1,
        whatsapp: 1,
        firstname: 1,
        id_branch: 1,
      };

      const projection = { ...defaultFields, ...fieldsToReturn };

      const result = await customerModel.aggregate([
        {
          $match: {
            _id: {
              $in: customerIds.map((id) => new mongoose.Types.ObjectId(id)),
            },
            id_branch: { $in: branchObjectIds },
            active: true,
          },
        },
        {
          $project: projection,
        },
        {
          $lookup: {
            from: "branches",
            localField: "branchId",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        {
          $unwind: {
            path: "$branchDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            whatsappNumber: {
              $ifNull: ["$whatsappNumber", "$mobile"],
            },
            // Add branch name for convenience
            branchName: "$branchDetails.name",
          },
        },
      ]);

      return result;
    } catch (error) {
      console.error("Error in getCustomersByIds:", error);
      throw error;
    }
  }
}

export default CustomerRepository;
