import { isValidObjectId } from "mongoose";

class giftInwardsController {
  constructor(giftInwardsUseCase, validator) {
    this.giftInwardsUseCase = giftInwardsUseCase;
    this.validator = validator;
  }

  async addGiftInward(req, res) {
    try {
      // const { error } = this.validator.giftInwardsValidations.validate(
      //   req.body
      // );

      // if (error) {
      //   return res.status(400).json({ message: error.details[0].message });
      // }

      const data = { ...req.body };

      if (req && req.user.id_employee) {
        data.created_by = req.user.id_employee;
        data.modified_by = req.user.id_employee;
      }

      const result = await this.giftInwardsUseCase.addGiftInward(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editGiftInward(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      // const { error } = this.validator.giftInwardsValidations.validate(
      //   req.body,
      //   { abortEarly: false }
      // );

      // if (error) {
      //   return res.status(400).json({ message: error.details[0].message });
      // }

      const data = { ...req.body };

      if (req && req.user.id_employee) {
        data.created_by = req.user.id_employee;
        data.modified_by = req.user.id_employee;
      }

      const result = await this.giftInwardsUseCase.editGiftInward(id, data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteGiftInward(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.staus(400).json({ message: "No valid id provided" });
      }

      const result = await this.giftInwardsUseCase.deleteGiftInward(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getGiftInwardsById(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.staus(400).json({ message: "No valid id provided" });
      }

      const result = await this.giftInwardsUseCase.getGiftInwardsById(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

 
  async changeInwardsActiveStatus(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.staus(400).json({ message: "No valid id provided" });
      }

      const result = await this.giftInwardsUseCase.changeInwardsActiveStatus(
        id
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async giftInwardsDataTable(req, res) {
    try {
      const { page, limit, search,active } = req.body;
  
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
  
      if (!pageNumber || isNaN(pageNumber) || pageNumber <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
  
      if (!limitNumber || isNaN(limitNumber) || limitNumber <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }
  
      // if (search) {
      //   filters.$or = [
      //     { invoice_no: { $regex: search, $options: "i" } }
      //   ];
      // }

  
      const result = await this.giftInwardsUseCase.giftInwardsDataTable({
        page: pageNumber,
        limit: limitNumber,
        search:search,
        active:active
      });

      return res.status(200).json({
        message: result.message,
        data: result.data.data,
        totalDocument: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      console.error("Error in giftInwardsDataTable controller:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getGiftInwardsByBranch(req, res) {
  
    const { branchId } = req.params;
    try {
      if (!branchId) {
        return res.staus(400).json({ message: "No valid id provided" });
      }

      const result = await this.giftInwardsUseCase.getGiftInwardsByBranch(
        branchId
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  
}

export default giftInwardsController;