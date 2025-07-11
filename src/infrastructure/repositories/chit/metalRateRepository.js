import metalRateModel from "../../models/chit/metalRateModel.js";
import PuriytRepository from "./purityReporsitory.js";
import purityModel from "../../models/chit/purityModel.js";
import mongoose from 'mongoose'

class MetalRateRepository {
  constructor() {
    this.purityRepo = new PuriytRepository();
  }

  async findById(id) {
    try {
      const savedData = await metalRateModel
        .findById(id)
        .populate({
          path: "id_branch",
          select: "branch_name _id mobile",
        })
        .lean();

      if (savedData) {
        return savedData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: metal rate findbyid");
    }
  }

  async getByPurityId(id) {
    try {
      const savedData = await metalRateModel
        .findOne({ purity_id: id })
        .sort({ createdAt: -1 })
        .lean();
  
      return savedData || null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: metal rate findOne by id");
    }
  }

  async updateMetalId(id,metalId) {
    try {
      const updatedData = await metalRateModel.findByIdAndUpdate(
        { _id: id },
        { $set: {material_type_id:metalId}},
        { new: true }
      );

      if (updatedData) {
        return updatedData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: editMetalRate");
    }
  }

  async addMetalRate(data) {
    try {
      let savedData;

      if (Array.isArray(data)) {
        savedData = await metalRateModel.insertMany(data);
      } else {
        // If data is a single object, create and save it normally
        const metalRateInstance = new metalRateModel(data);
        savedData = await metalRateInstance.save();
      }

      if (!savedData || (Array.isArray(savedData) && savedData.length === 0)) {
        return { success: false, message: "Failed to add metal rate" };
      }

      return {
        success: true,
        message: "Metal rate added successfully",
        data: savedData,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while adding metal rate",
      };
    }
  }

  async editMetalRate(id, data) {
    try {
      const updatedData = await metalRateModel.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true }
      );

      if (updatedData) {
        return updatedData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: editMetalRate");
    }
  }
  async deleteMetalRate(id) {
    try {
      const updatedData = await metalRateModel.findByIdAndUpdate(
        { _id: id },
        { $set: { is_deleted: true, active: false } },
        { new: true }
      );

      if (updatedData) {
        return updatedData;
      }

      return null;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: editMetalRate");
    }
  }

  async currenPreviousMetalRate(branchId) {
    try {
      const metalRates = await metalRateModel
        .find({ id_branch: branchId, active: true })
        .sort({ updatetime: -1 })
        .limit(2)
        .lean();

      if (!metalRates) {
        return null;
      }

      return metalRates;
    } catch (error) {
      console.error(error);
      throw new Error("Database error: currentPreviousMetalRate");
    }
  }

  // async getMetalRate(branchId, date = null) {

  //   try {
  //     const purityQuery = { active: true, is_deleted: false };
  //     const purityCount = await purityModel.countDocuments(purityQuery);

  //     if (purityCount === 0) {
  //       return { success: false, message: "No active purities found" };
  //     }

  //     const purityData = await this.purityRepo.find(purityQuery);

  //     const purityIds = purityData.map((purity) => purity._id);

  //     let query = {
  //       active: true,
  //       is_deleted: false,
  //       purity_id: { $in: purityIds },
  //     };

  //     let startOfDay, endOfDay;

  //     if (branchId !== "0") {
  //       query.id_branch = branchId;
  //     }

  //     if (date) {
  //       startOfDay = new Date(date);
  //       endOfDay = new Date(date);
  //       startOfDay.setUTCHours(0, 0, 0, 0);
  //       endOfDay.setUTCHours(23, 59, 59, 999);

  //       query.createdAt = { $gte: startOfDay, $lte: endOfDay };
  //     }

  //     // Fetch all metal rates for the given date
  //     let metalRates = await metalRateModel
  //       .find(query)
  //       .populate('material_type_id')
  //       .populate('purity_id')
  //       .sort({ createdAt: -1 })
  //       .limit(purityCount)
  //       .select("-created_by -modified_by -__v");

  //     if (!metalRates.length && date) {
  //       query.createdAt = { $lt: startOfDay };

  //       metalRates = await metalRateModel
  //         .find(query)
  //         .sort({ createdAt: -1 })
  //         .limit(purityCount)
  //         .select("-created_by -modified_by -__v");
  //     }

  //     return metalRates.length ? metalRates : null;
  //   } catch (error) {
  //     console.error("Database error:", error);
  //     throw new Error("Database error while fetching metal rate");
  //   }
  // }

  async metalRateTable(query, page, limit) {
    try {
      const totalCount = await metalRateModel.countDocuments(query);

      const data = await metalRateModel
        .find(query)
        .skip(page)
        .limit(limit)
        .populate([
          {
            path: "id_branch",
            select: "branch_name",
          },
          {
            path: "material_type_id",
            // select: "branch_name",
          },
          {
            path: "purity_id",
            // select: "branch_name",
          },
        ])
        .select("-created_by -modified_by -updatetime -__v")
        .sort({ _id: -1 })
        .lean();

      if (!data || data.length === 0) return null;

      return { data, totalCount };
    } catch (error) {
      console.error("Error in getAllMetals:", error);
      throw new Error("Database error occurred while fetching data");
    }
  }

  // support repo for payment to fetch current date metal rate
  async getTodayMetalRate(date) {
    try {
      const metalData = await metalRateModel
        .findOne({ createdAt: { $lte: date } })
        .sort("-createdAt")
        .limit(1)
        .lean();

      if (!metalData) {
        return null;
      }

      return metalData;
    } catch (error) {
      console.error(error);
      throw new Error("Database error occurred while fetching data");
    }
  }

  async todaysMetalRateByMetal(metalId, purityId, branchId, date = null) {
    try {
      const queryDate = date ? new Date(date) : new Date();
      queryDate.setHours(23, 59, 59, 999);

      const metalRates = await metalRateModel
        .find({
          material_type_id: metalId,
          id_branch: branchId,
          purity_id: purityId,
          createdAt: { $lte: queryDate },
          active: true,
          is_deleted: false,
        })
        .sort({ createdAt: -1 })
        .limit(1);

      return metalRates.length ? metalRates[0] : null;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Database error while fetching metal rate");
    }
  }

  async getMetalRate(branchId, date = null) {
    try {
      // First get all active purities
      const purityQuery = { active: true, is_deleted: false };
      const purityData = await this.purityRepo.find(purityQuery);

      if (!purityData.length) {
        return { success: false, message: "No active purities found" };
      }

      const purityIds = purityData.map((purity) => purity._id);

      const query = {
        active: true,
        is_deleted: false,
        purity_id: { $in: purityIds },
      };

      if (branchId !== "0") {
        query.id_branch = branchId;
      }

      // Get all metal rates that match the initial query
      let metalRates = await metalRateModel
        .find(query)
        .populate("material_type_id")
        .populate({
          path: "purity_id",
          match: { active: true, is_deleted: false },
        })
        .sort({ createdAt: -1 })
        .select("-created_by -modified_by -__v");

      metalRates = metalRates.filter((rate) => rate.purity_id !== null);

      const latestRates = {};
      metalRates.forEach((rate) => {
        const purityId = rate.purity_id._id.toString();
        if (
          !latestRates[purityId] ||
          new Date(rate.createdAt) > new Date(latestRates[purityId].createdAt)
        ) {
          latestRates[purityId] = rate;
        }
      });

      const result = Object.values(latestRates);

      return result.length ? result : null;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Database error while fetching metal rate");
    }
  }

  async getIds(branchId, date = null, ids, metalId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return { success: false, message: "No purity IDs provided" };
      }

      const purityIds = ids.map((id) => new mongoose.Types.ObjectId(id));
      const metalObjectId = new mongoose.Types.ObjectId(metalId);

      const query = {
        active: true,
        is_deleted: false,
        purity_id: { $in: purityIds },
      };

      if (branchId !== "0") {
        query.id_branch = new mongoose.Types.ObjectId(branchId);
      }

      const metalRateDocs = await metalRateModel.aggregate([
        { $match: query },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$purity_id",
            latestDoc: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$latestDoc" } },
      ]);

      const resultIds = metalRateDocs.map((doc) => doc._id);

      if (resultIds.length > 0) {
        await metalRateModel.updateMany(
          { _id: { $in: resultIds } },
          { $set: { material_type_id: metalObjectId } }
        );
      }

      return resultIds.length ? resultIds : null;
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Database error while fetching/updating metal rate IDs");
    }
  }

  async addInitialRate(data) {
    try {
      const metalData = await metalRateModel.create(data)

      if (!metalData) {
        return null;
      }

      return metalData;
    } catch (error) {
      console.error(error);
      throw new Error("Database error occurred while fetching data");
    }
  }
}

export default MetalRateRepository;
