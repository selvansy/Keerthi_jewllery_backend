class BranchController {
  constructor(branchUsecase, validator) {
    this.branchUsecase = branchUsecase;
    this.validator = validator;
  }

  async addBranch(req, res) {
    const { error } = this.validator.branchValidationSchemas.addBranch.validate(
      req.body
    );

    if (error) {
      return res
        .status(400)
        .json({ message: error.details[0].message });
    }

    const createBranch = await this.branchUsecase.addBranch(req.body);

    if (createBranch.success) {
      return res.status(200).json({ message: createBranch.message });
    } else {
      return res.status(400).json({ message: createBranch.message });
    }
  }

  async branchTable(req, res) {

    try {
      const allBranches = await this.branchUsecase.branchTable(
        req.body
      );

      if (!allBranches.success) {
        return res.status(200).json({ message: allBranches.message, data: [] });
      }

      res
        .status(200)
        .json({ message: allBranches.message, data: allBranches.data,  totalDocuments: allBranches.totalBranch,
          totalPages: allBranches.totalPages,
          currentPage: allBranches.currentPage, });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updateBranch(req, res) {
    try {
      const validationResult =
        this.validator.branchValidationSchemas.addBranch.validate(req.body);

      const { id } = req.params;

      if (!id) return res.status(400).json({ message: "Branch id required" });

      if (validationResult.error) {
        return res
          .status(400)
          .json({ message: validationResult.error.details[0].message });
      }

      const editBranch = await this.branchUsecase.editBranch(req.body, id);
      if (editBranch.success) {
        return res.status(200).json({ message: editBranch.message });
      } else {
        return res.status(400).json({ message: editBranch.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async deleteBranch(req, res) {
    try {
      const { id } = req.params;
   
      const deleteBranch = await this.branchUsecase.deleteBranch(id);
     
      if (deleteBranch.success) {
        return res.status(200).json({ message: deleteBranch.message });
      } else {
        return res.status(400).json({ message: deleteBranch.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAllBranch(req, res) {
    try {
      const allBranches = await this.branchUsecase.getAllBranch();

      if (allBranches.success) {
        return res.status(200).json({ message: allBranches.message,data:allBranches.data});
      } else {
        return res.status(200).json({ message: allBranches.message,data:[]});
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      const changeStatus = await this.branchUsecase.changeStatus(id);
      if (changeStatus.success) {
        return res.status(200).json({ message: changeStatus.message });
      } else {
        return res.status(400).json({ message: changeStatus.message });
      }
    } catch (err) {
      console.error(err);

      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getBranchById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Branch Id required" });
      }

      const result = await this.branchUsecase.findById(id);
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  async getBranchByClientId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Branch Id required" });
      }

      const result = await this.branchUsecase.getBranchByClientId(id);
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }
      return res.status(400).json({ message: result.message,data:[]});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default BranchController;
