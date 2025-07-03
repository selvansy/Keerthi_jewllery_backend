import mongoose, { isValidObjectId } from "mongoose";

class BranchUsecase {
  constructor(brachRepository) {
    this.brachRepository = brachRepository;
  }

  validateObjectId(id, name) {
    if (id && !isValidObjectId(id)) {
      return { success: false, message: `Provide a valid ${name} ID` };
    }
    return null;
  }

  async addBranch(branchData) {
    const checkBranchData = await this.brachRepository.branchByName(
      branchData.branch_name
    );
    if (checkBranchData) {
      return { success: false, message: "Branch already exisits." };
    }

    const addBrach = await this.brachRepository.addBranch(branchData);
    if (addBrach) {
      return { success: true, message: "Branch created successfully." };
    } else {
      return { success: false, message: "Failed to create new  Branch" };
    }
  }

  async branchTable(query) {
    const { page, limit, from_date, to_date, id_client, search } = query;

    if (id_client && !isValidObjectId(id_client)) {
      return { success: false, message: "Provide a valid object Client ID" };
    }

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;
    const skip = (pageNum - 1) * pageSize;
    const filter = { is_deleted: false };

    if (from_date && to_date) {
      const startDate = new Date(from_date);
      const endDate = new Date(to_date);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format.");
      }

      filter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    if (id_client) {
      filter.id_client = new mongoose.Types.ObjectId(id_client);
    }


    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ branch_name: { $regex: searchRegex } }];
    }

    const Branch = await this.brachRepository.branchTable(
      filter,
      skip,
      pageSize
    );
    
    if (!Branch.length >= 1) {
      return { success: false, message: "No data found" };
    }

    
    const totalBranch = await this.brachRepository.countBranch(filter);

    return {
      success: true,
      message: "Branch retrieved successfully",
      data: Branch,
      totalBranch,
      totalPages: Math.ceil(totalBranch / pageSize),
      currentPage: pageNum,
    };
  }

  async editBranch(branchData, branch_id) {
    const idValidation = this.validateObjectId(branch_id, "Branch");
    if (idValidation) return idValidation;

    const checkBranchData = await this.brachRepository.branchByName(
      branchData.branch_name,
      branch_id
    );
    const findBranch = await this.brachRepository.findById(branch_id);
    if (!findBranch) {
      return { success: false, message: "Branch not found" };
    }

    if (checkBranchData) {
      return { success: false, message: "Branch  already exisits." };
    }

    const updateBranch = await this.brachRepository.editBranch(
      branchData,
      branch_id
    );
    if (updateBranch) {
      return { success: true, message: "Branch edited successfully." };
    } else {
      return { success: false, message: "Failed to edit Branch" };
    }
  }

  async deleteBranch(id) {
 
    const idValidation = this.validateObjectId(id, "Branch");
   
    if (idValidation) return idValidation;
    
    const findBranch = await this.brachRepository.findById(id);

    if (!findBranch) {
      return { success: false, message: "Branch not found" };
    }

    if (findBranch.is_delete) {
      return { success: false, message: "The branch is already deleted" };
    }
    const deleteBranch = await this.brachRepository.deleteBranch(id);
    if (deleteBranch) {
      return { success: true, message: "Branch deleted successfully." };
    } else {
      return { success: false, message: "Failed to delete Branch" };
    }
  }

  async getAllBranch() {
    try {
      const findBranch = await this.brachRepository.find();

    if (!findBranch) {
      return { success: false, message: "No Branches found" };
    }

      return { success: true, message: "Branch retrieved successfully",data: findBranch};
    } catch (error) {
      console.error(error)
      return {success:false,message:"Error while getting all branches"}
    }
  }

  async changeStatus(branchId) {
    const idValidation = this.validateObjectId(branchId, "Branch");
    if (idValidation) return idValidation;
    const findBranch = await this.brachRepository.findById(branchId);
    if (!findBranch) {
      return { success: false, message: "Branch not found" };
    }
    const upadateStatus = await this.brachRepository.changeStatus(
      branchId,
      findBranch.active
    );
    if (upadateStatus) {
      let message = findBranch.active
        ? "Category deactivated successfully"
        : "Category activated successfully";

      return { success: true, message: message };
    } else {
      return { success: false, message: `Failed to change Branch status` };
    }
  }

  async findById(id) {
    try {
      const idValidation = this.validateObjectId(id, "Branch");
      if (idValidation) return idValidation;

      const existingBranch = await this.brachRepository.findById(id);
      if (existingBranch) {
        return {
          success: true,
          message: "Branch retrieved successfully",
          data: existingBranch,
        };
      }
      return { success: false, message: "Branch not found" };
    } catch (err) {
      console.error(err);

      return { success: false, message: `Failed to get branch by Id` };
    }
  }
  async getBranchByClientId(id) {
    try {
      const idValidation = this.validateObjectId(id, "Client");
      if (idValidation) return idValidation;

      const existingBranch = await this.brachRepository.findByClientId(id);
      if (existingBranch) {
        return {
          success: true,
          message: "Branch retrieved successfully",
          data: existingBranch,
        };
      }
      return { success: false, message: "Branch not found" };
    } catch (err) {
      return { success: false, message: `Failed to get branch by Client Id` };
    }
  }
}

export default BranchUsecase;
