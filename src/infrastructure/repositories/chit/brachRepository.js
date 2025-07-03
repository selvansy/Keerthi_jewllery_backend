import Branch from "../../models/chit/branchModel.js";

class BranchRepository {
  async find() {
   try {
    const data = await Branch.find({active:true})
    .select('_id branch_name active mobile')

    if (data.length === 0 ) return null;

   return data
   } catch (error) {
    console.error(error);
   }
  }

  async addBranch(branchData) {
    const createBranch = new Branch(branchData);
    await createBranch.save();

    if (!createBranch) return null;

    return {
      name: createBranch.name,
    };
  }

  async findById(id) {

    const branch = await Branch.findOne({ _id: id, is_deleted: false })
      .populate("id_city")
      .populate("id_client")
      .populate("id_state")
      .populate("id_country");

    return branch || null;
  }

  async findByClientId(id) {
    const branch = await Branch.find({ id_client: id, is_deleted: false })
      .select('branch_name')

    return branch || null;
  }

  async branchByName(branch_name, branch_id = null) {
    const filter = {
      branch_name: branch_name ? branch_name.toLowerCase() : undefined,
      is_deleted: false,
    };

    if (branch_id) {
      filter._id = { $ne: branch_id };
    }

    const branchData = await Branch.findOne(filter);

    if (!branchData) return null;

    return {
      branch_name: branchData.branch_name,
      _id: branchData._id,
    };
  }

  async branchTable(filter,skip, limit) {
    try {
      return await Branch.find(filter)
        .skip(skip)
        .limit(limit)
        // .populate("id_city",'city_name')
        // .populate("id_client")
        // .populate("id_state")
        // .populate("id_country")
        .select('_id active branch_name mobile createdAt')
        .exec();

    } catch (err) {
      console.error(err);
      
      throw new Error("Database error occured while get Category");
    }
  }

    async countBranch(filter) {
        return await Branch.countDocuments(filter);
      }

  async editBranch(branchData, branch_id) {
    const editBranch = await Branch.findByIdAndUpdate(branch_id, branchData);
    if (editBranch) {
      return { name: editBranch.branch_name };
    } else {
      return null;
    }
  }

  async deleteBranch(_id) {
    const deleteBranch = await Branch.findByIdAndUpdate(
      { _id },
      { is_deleted: true, active: false },
      { new: true }
    );
    if (deleteBranch) {
      return deleteBranch;
    } else {
      return null;
    }
  }

  async changeStatus(branchId, status) {
    const updatedBranch = await Branch.findByIdAndUpdate(
      branchId,
      { $set: { active: !status } },
      { new: true }
    );

    if (updatedBranch) {
      return updatedBranch;
    } else {
      return null;
    }
  }

  async count(filter) {
    try {
      return await Branch.countDocuments(filter);
    } catch (error) {
      console.error('Error counting branches:', error);
      throw error;
    }
  }
}

export default BranchRepository;
