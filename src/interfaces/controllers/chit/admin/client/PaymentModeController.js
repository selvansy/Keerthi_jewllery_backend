import { isValidObjectId } from "mongoose";

class PaymentModeController {
  constructor(validator, paymentmodeUseCase, menuUseCase) {
    this.validator = validator;
    this.paymentmodeUseCase = paymentmodeUseCase;
    this.menuUseCase = menuUseCase;
  }

  async addPaymentMode(req, res) {
    try {
      const { error } = this.validator.paymentModeValidations.validate(
        req.body
      );

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data = req.body;
      const result = await this.paymentmodeUseCase.addPaymentMode(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editPaymentMode(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No id provided" });
      }
      const { error } = this.validator.paymentModeValidations.validate(
        req.body
      );

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data = req.body;
      const result = await this.paymentmodeUseCase.editPaymentMode(id, data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deletePaymentMode(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.statu(400).json({ message: "No id provided" });
      }

      const result = await this.paymentmodeUseCase.deletePaymentMode(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return req.staus(500).json({ message: "Intenal sever error" });
    }
  }

  async changeModeActiveStatus(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const result = await this.paymentmodeUseCase.changeModeActiveStatus(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return req.status(500).json({ message: "Internal server error" });
    }
  }

  async getModeById(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const result = await this.paymentmodeUseCase.getModeById(id);

      if (result.success === false) {
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

  async paymentModeTable(req, res) {
    try {
      const { page, limit,from_date,to_date,id_branch} = req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const filter ={}
      if(isValidObjectId(id_branch)){
        filter.id_branch = id_branch
      }

      if (from_date) {
        const fromDate = new Date(from_date);
        if (isNaN(fromDate.getTime())) {
          return res.status(400).json({ message: "Invalid from_date format" });
        }
        filter.date_add = { ...(filter.date_add || {}), $gte: fromDate };
      }
      
      if (to_date) {
        const toDate = new Date(to_date);
        if (isNaN(toDate.getTime())) {
          return res.status(400).json({ message: "Invalid to_date format" });
        }
        filter.date_add = { ...(filter.date_add || {}), $lte: toDate };
      }

      const result = await this.paymentmodeUseCase.paymentModeTable(
        page,
        limit,
        filter
      );

      if (!result || !result.success) {
        return res.status(404).json({ message: result.message });
      }

      res.status(200).json({
        message: result.message,
        data: result.data,
        totalDocument: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllActivePaymentModes(req, res) {
    try {
      const result = await this.paymentmodeUseCase.getAllActivePaymentModes();

      if (result.success === false) {
        return res.status(200).json({ message: result.message,data:[]});
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

export default PaymentModeController;