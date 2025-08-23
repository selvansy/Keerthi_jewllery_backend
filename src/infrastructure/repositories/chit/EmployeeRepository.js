import employeeModel from "../../models/chit/employeeModel.js";
import mongoose from "mongoose";

class EmployeeRepository {
  async findOne(query) {
    try {
      const findData = await employeeModel
        .findOne(query)
        .populate({
          path: "id_branch",
          select: "_id branch_name active",
        })
        // .select("_id firstname lastname active id_branch mobile")
        .lean();

      if (!findData) {
        return null;
      }

      return findData;
    } catch (error) {
      console.error(error);
    }
  }

  async find(qurey) {
    try {
    
      const employeeData = await employeeModel
        .find(qurey)
        .select("_id firstname lastname active id_branch mobile")
        .lean();
  
      if (!employeeData) {
        return null;
      }

      return employeeData;
    } catch (error) {
      console.error(error);
    }
  }

  async findById(id) {
    try {
      const userData = await employeeModel.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(id), is_deleted: false },
        },
        {
            $lookup: {
                from: "branches",
                localField: "id_branch",
                foreignField: "_id",
                as: "id_branch",
            },
        },
        { $unwind: "$id_branch" },
        {
            $lookup: {
                from: "states",
                localField: "id_state",
                foreignField: "_id",
                as: "id_state",
            },
        },
        { $unwind: "$id_state" },
        {
            $lookup: {
                from: "countries",
                localField: "id_country",
                foreignField: "_id",
                as: "id_country",
            },
        },
        { $unwind: "$id_country" },
        {
            $lookup: {
                from: "cities",
                localField: "id_city",
                foreignField: "_id",
                as: "id_city",
            },
        },
        { $unwind: "$id_city" },
        {
            $lookup: {
                from: "s3bucketsettings",
                localField: "id_branch._id",
                foreignField: "id_branch",
                as: "s3Details",
            },
        },
        { $unwind: "$s3Details" },
        {
            $project: {
                _id: 1,
                firstname: 1,
                lastname: 1,
                mobile: 1,
                active: 1,
                pincode: 1,
                gender:1,
                address:1,
                date_of_birth:1,
                date_of_join:1,
                image: 1,
                aadharNumber: 1,
                phone:1,
                email: 1,
                resume: 1,
                pan:1,
                whatsappNumber:1,
                department:1,
                employeeIncentivePercentage:1,
                "id_branch._id": 1,
                "id_branch.branch_name": 1,
                "id_branch.active": 1,
                "id_state._id": 1,
                "id_state.state_name": 1,
                "id_country._id": 1,
                "id_country.country_name": 1,
                "id_country.id_country": 1,
                "id_city._id": 1,
                "id_city.city_name": 1,
                "id_city.id_city": 1,
                pathurl: {
                    $concat: [
                        "$s3Details.s3display_url",
                        "keerthijewellery/webadmin/assets/employee/",
                    ],
                },
            },
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

  async getAll() {
    try {
      const employeeData = await employeeModel
        .find({active:true, is_deleted:false})
        .select("_id firstname lastname active id_branch mobile")
        .lean();

      if (!employeeData) {
        return null;
      }

      return employeeData;
    } catch (error) {
      console.error(error);
    }
  }

  async addEmployee(data) {
    try {
      const savedData = await employeeModel.create(data);

      if (!savedData) {
        return null;
      }

      return savedData;
    } catch (error) {
      console.error(error);
    }
  }

  async updateEmployee(id, data) {
    try {
      const updatedData = await employeeModel.updateOne(
        { _id: id },
        { $set: data },
        { new: true }
      );

      if (updatedData.modifiedCount === 0) {
        return null;
      }

      return updatedData;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllEmployees({ query, documentskip, documentlimit }) {
    try {
      const totalCount = await employeeModel.countDocuments(query);
      const data = await employeeModel
        .find(query)
        .skip(documentskip)
        .limit(documentlimit)
        .sort({_id:-1})
        .populate({
          path: "id_branch",
          select: "branch_name _id mobile",
        })
        .select("firstname lastname active _id Id_branch date_of_join");

      if (!data || data.length === 0) return null;

      return { data, totalCount };
    } catch (error) {
      console.error("Error :", error);
    }
  }

  async getReferrals(page, limit, query) {
    try {
        const referrals = await employeeModel.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "schemeaccounts",
                    localField: "_id",
                    foreignField: "referral_id",
                    as: "schemeAccounts",
                },
            },
            {
                $addFields: {
                    referralCount: { $size: "$schemeAccounts" },
                },
            },
            {
                $lookup: {
                    from: "referralpayments",
                    localField: "_id",
                    foreignField: "id_employee",
                    as: "referralPayments",
                },
            },
            { $unwind: { path: "$referralPayments", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: "$_id",
                    firstname: { $first: "$firstname" },
                    lastname: { $first: "$lastname" },
                    mobile: { $first: "$mobile" },
                    id_branch: { $first: "$id_branch" },
                    referralCount: { $first: "$referralCount" },
                    totalPaidAmount: { $sum: "$referralPayments.paid_amount" },
                    totalBalance: { $sum: "$referralPayments.balance_amount" },
                },
            },
            {
              $lookup: {
                  from: "branches",
                  localField: "id_branch",
                  foreignField: "_id",
                  as: "branchData",
              },
          },
          { $unwind: "$branchData" },
          {
              $project: {
                  "branchData.branch_name": 1,
                  _id: 1,
                  firstname: 1,
                  lastname: 1,
                  mobile: 1,
                  referralCount: 1,
                  totalPaidAmount: 1,
                  totalBalance:1
              },
          },
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { _id: -1 } },
                        { $skip: (page - 1) * limit },
                        { $limit: limit },
                    ],
                },
            },
            {
                $project: {
                    total: { $arrayElemAt: ["$metadata.total", 0] },
                    data: 1,
                },
            },
        ]);

        return referrals.length > 0 ? referrals[0] : { total: 0, data: [] };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async getEmployeeByMobile(mobile) {
  try {
    const data = await employeeModel
      .findOne({mobile:mobile,is_deleted:false})
      .select("firstname lastname")
      .lean();

    if (!data) return null;

    return data;
  } catch (error) {
    console.error("Error :", error);
  }
}

async finByReferralCode(code) {
  try {
    const data = await employeeModel
      .findOne({referral_code:code,is_deleted:false})
      .select("firstname lastname")
      .lean();

    if (!data) return null;

    return data;
  } catch (error) {
    console.error("Error :", error);
  }
}
  
}

export default EmployeeRepository;