import schemeModel from "../../models/chit/schemeModel.js";
import schemeClassificationModel from "../../models/chit/schemeClassificationModel.js";

class SchemeRepository {
  async findById(id) {
    try {
      const schemeData = await schemeModel
        .findById(id)
        .populate(['id_metal', 'id_purity', 'id_classification'])
        .lean();
  
      return schemeData || null; 
    } catch (error) {
      console.error("Error fetching scheme by ID:", error);
      throw new Error("Failed to fetch scheme data");
    }
  }
  
  async find(query) {
    try {
      const data = await schemeModel
        .find(query)
        .populate({
          path: 'id_metal',
          select: 'metal_name'
        })
        .populate({
          path: 'id_purity',
          select: 'purity_name'
        })
        .select("-createdAt -updatedAt -__v")
        .sort({ _id: -1 })
        .lean();

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async getSchemeByBrachId(query) {
    try {
      const data = await schemeModel
        .find(query)
        .select("-createdAt -updatedAt -__v")
        .sort({ _id: -1 })
        .lean();

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  async findScheme(query) {
    const schemeData = await schemeModel.findOne(query).lean();

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async findOne(query) {
    const schemeData = await schemeModel.findOne(query).lean();

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async findAll(query) {
    const schemeData = await schemeModel.find(query);

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async addScheme(data) {
    const schemeData = await schemeModel.create(data);

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async updateScheme(id, updatedata) {
    const result = await schemeModel.updateOne(
      { _id: id },
      { $set: updatedata }
    );

    if (result.modifiedCount > 0) {
      return result;
    } else {
      return null;
    }
  }

  // async schemesTableData({ query, documentskip, documentlimit }) {
  //   try {
  //     const skip = documentskip || 0;
  //     const limit = documentlimit || 10;

  //     const aggregationPipeline = [
  //       { $match: query },
  //       {
  //         $lookup: {
  //           from: "purities",
  //           localField: "id_purity",
  //           foreignField: "id_purity",
  //           as: "purityDetails",
  //         },
  //       },
  //       {
  //         $unwind: { path: "$purityDetails", preserveNullAndEmptyArrays: true },
  //       },
  //       {
  //         $lookup: {
  //           from: "branches",
  //           localField: "id_branch",
  //           foreignField: "_id",
  //           as: "branchDetails",
  //         },
  //       },
  //       {
  //         $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true },
  //       },
  //       {
  //         $lookup: {
  //           from: "classifications",
  //           localField: "id_classification",
  //           foreignField: "_id",
  //           as: "classificationDetails",
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: "$classificationDetails",
  //           preserveNullAndEmptyArrays: true,
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "metals",
  //           localField: "id_metal",
  //           foreignField: "id_metal",
  //           as: "metalDetails",
  //         },
  //       },
  //       {
  //         $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true },
  //       },
  //       {
  //         $addFields: {
  //           purity_name: "$purityDetails.purity_name",
  //           metal_name: "$metalDetails.metal_name",
  //           purity_obj: "$purityDetails._id",
  //           metal_obje: "$metalDetails._id",
  //           branch_name:"$branchDetails.branch_name"
  //         },
  //       },
  //       {
  //         $project: {
  //           purityDetails: 0,
  //           metalDetails: 0,
  //           branchDetails:0
  //         },
  //       },
  //       { $sort: { createdAt: -1 } },
  //       { $skip: skip },
  //       { $limit: limit },
  //       {
  //         $group: {
  //           _id: "$_id",
  //           document: { $first: "$$ROOT" },
  //         },
  //       },
  //       {
  //         $replaceRoot: { newRoot: "$document" },
  //       },
  //       {$sort:{_id:-1}}
  //     ];

  //     const countPipeline = [{ $match: query }, { $count: "totalCount" }];
  //     const countResult = await schemeModel.aggregate(countPipeline);
  //     const totalCount = countResult.length ? countResult[0].totalCount : 0;

  //     const schemeData = await schemeModel.aggregate(aggregationPipeline);

  //     if (!schemeData.length) {
  //       return { data: [], totalCount: 0 };
  //     }

  //     return { data: schemeData, totalCount };
  //   } catch (error) {
  //     console.error("Error fetching schemes:", error);
  //     throw new Error("Database error while fetching schemes");
  //   }
  // }
  async schemesTableData({ query, documentskip, documentlimit }) {
    try {
      const skip = documentskip || 0;
      const limit = documentlimit || 10;
  
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "purities",
            localField: "id_purity",
            foreignField: "_id",
            as: "purityDetails",
          },
        },
        { $unwind: { path: "$purityDetails", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "branchDetails",
          },
        },
        { $unwind: { path: "$branchDetails", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "classificationDetails",
          },
        },
        { $unwind: { path: "$classificationDetails", preserveNullAndEmptyArrays: true } },
  
        {
          $lookup: {
            from: "metals",
            localField: "id_metal",
            foreignField: "_id",
            as: "metalDetails",
          },
        },
        { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemetypes",
            localField: "scheme_type",
            foreignField: "scheme_type",
            as: "schemeTypeDetails",
          },
        },
        { $unwind: { path: "$schemeTypeDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "_id",
            foreignField: "id_scheme", 
            as: "schemeAccounts",
          },
        },  
        {
          $addFields: {
            purity_name: "$purityDetails.purity_name",
            metal_name: "$metalDetails.metal_name",
            branch_name: "$branchDetails.branch_name",
            classification_name: "$classificationDetails.name",
            purity_obj: "$purityDetails._id",
            metal_obj: "$metalDetails._id",
            branch_obj: "$branchDetails._id",
            classification_obj: "$classificationDetails._id",
            schemetype_name: "$schemeTypeDetails.scheme_typename",
            activeAccounts: { $gt: [{ $size: "$schemeAccounts" }, 0] }
          },
        },        
        {
          $project: {
            purityDetails: 0,
            metalDetails: 0,
            branchDetails: 0,
            classificationDetails: 0,
            schemeTypeDetails:0,
            schemeAccounts: 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: "$_id",
            document: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$document" } },
        { $sort: { _id: -1 } },
      ];
  
      const totalCount = await schemeModel.countDocuments(query);
  
      const schemeData = await schemeModel.aggregate(aggregationPipeline);
  
      if (!schemeData.length) {
        return { data: [], totalCount: 0 };
      }
  
      return { data: schemeData, totalCount };
    } catch (error) {
      console.error("Error fetching schemes:", error);
      throw new Error("Database error while fetching schemes");
    }
  }
  

  async deleteScheme(id) {
    const schemeData = await schemeModel.updateOne(
      { _id: id },
      { $set: { is_deleted: true, active: false } }
    );

    if (schemeData.modifiedCount == 1) {
      return schemeData;
    }

    return null;
  }

  async toggleSchemeStatus(id, active) {
    const schemeData = await schemeModel.findOneAndUpdate(
      { _id: id },
      { $set: { active: !active } },
      { new: true }
    );

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async getSchemeByclassificationId(id) {
    const schemeData = await schemeModel.find({ id_classification: id,active:true})
    .lean()

    if (schemeData.length > 0) {
      return schemeData;
    }

    return null;
  }
  // async getSchemeByclassificationId(id) {
  //   const objectId = new mongoose.Types.ObjectId(id);
  //   const schemes = await schemeModel.aggregate([
  //     {
  //       $match: {
  //         id_classification: objectId,
  //         active: true
  //       }
  //     },
  //     {
  //       $lookup: {
  //         from: 'schemeaccounts',
  //         localField: '_id',
  //         foreignField: 'scheme_id',
  //         as: 'accounts'
  //       }
  //     },
  //     {
  //       $addFields: {
  //         accountCount: { $size: '$accounts' }
  //       }
  //     },
  //     {
  //       $match: {
  //         $expr: { $lt: ['$accountCount', '$limit_installment'] }
  //       }
  //     }
  //   ]);
  
  //   return schemes.length > 0 ? schemes : null;
  // }
  

  async schemeName(id) {
    const schemeData = await schemeModel
      .findById({ _id: id, active: true })
      .select("scheme_name");

    if (schemeData.length > 0) {
      return schemeData;
    }

    return null;
  }

  async findByOrder(order) {
    const schemeData = await schemeClassificationModel
      .findOne({order:order})

    if (schemeData) {
      return schemeData;
    }

    return null;
  }

  async getDelistSchemes({ query, documentskip, documentlimit }) {
    try {
      const skip = documentskip || 0;
      const limit = documentlimit || 10;
  
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "purities",
            localField: "id_purity",
            foreignField: "_id",
            as: "purityDetails",
          },
        },
        { $unwind: { path: "$purityDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "installmenttypes",
            localField: "installment_type",
            foreignField: "installment_type",
            as: "installmenttypes",
          },
        },
        { $unwind: { path: "$installmenttypes", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeclassifications",
            localField: "id_classification",
            foreignField: "_id",
            as: "classificationDetails",
          },
        },
        { $unwind: { path: "$classificationDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "metals",
            localField: "id_metal",
            foreignField: "_id",
            as: "metalDetails",
          },
        },
        { $unwind: { path: "$metalDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemetypes",
            localField: "scheme_type",
            foreignField: "scheme_type",
            as: "schemeTypeDetails",
          },
        },
        { $unwind: { path: "$schemeTypeDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "schemeaccounts",
            localField: "_id",
            foreignField: "id_scheme",
            as: "schemeAccounts",
          },
        },
        {
          $addFields: {
            maturity_period: "$maturity_period",
            scheme_name: "$scheme_name",
            metal_name: "$metalDetails.metal_name",
            classification_name: "$classificationDetails.name",
            schemetype_name: "$schemeTypeDetails.scheme_typename",
            is_accounts: { $gt: [{ $size: "$schemeAccounts" }, 0] },
            active:"$active",
            installment_type: {
              $cond: {
                if: { $in: ["$scheme_type", [10, 14]] },
                then: "Days",
                else: "$installmenttypes.installment_name"
              }
            },
            activeAccounts: { $gt: [{ $size: "$schemeAccounts" }, 0] }
          },
        },
        {
          $project: {
            _id: 1,
            scheme_name: 1,
            scheme_code: 1,
            metal_name: 1,
            maturity_period: 1,
            classification_name: 1,
            schemetype_name: 1,
            is_accounts: 1,
            createdAt: 1,
            active:1,
            installment_type:1
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ];
  
      const totalCount = await schemeModel.countDocuments(query);
      const schemeData = await schemeModel.aggregate(aggregationPipeline);
  
      return { data: schemeData, totalCount };
    } catch (error) {
      console.error("Error fetching schemes:", error);
      throw new Error("Database error while fetching schemes");
    }
  }
}

export default SchemeRepository;