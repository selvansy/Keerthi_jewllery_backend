import moment from "moment";

class metalRateController {
  constructor(metalrateUseCase, validator) {
    this.metalRateUseCase = metalrateUseCase;
    this.validator = validator;
  }

  async addMetalRate(req, res) {
    try {
      const { error } = this.validator.metalRateValidations.validate(
        req.body
      );
      
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      let data = req.body;

      if (Array.isArray(data)) {
        if (req && req.user.id_employee) {
          data = data.map((item) => ({
            ...item,
            created_by: req.user.id_employee,
            modified_by: req.user.id_employee,
          }));
        }
      } else {
        return res.status(400).json({ message: "Invalid format" });
      }

      const result = await this.metalRateUseCase.addMetalRate(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message , data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editMetalRate(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const data = req.body;
      const result = await this.metalRateUseCase.editMetalRate(id, data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteMetalRate(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.staus(400).json({ message: "No valid id provided" });
      }

      const result = await this.metalRateUseCase.deleteMetalRate(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async currenPreviousMetalRate(req, res) {
    const { branchId } = req.params;
    try {
      if (!branchId) {
        return res.staus(400).json({ message: "No valid branch id provided" });
      }

      const result = await this.metalRateUseCase.currenPreviousMetalRate(
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
      return res.staus(500).json({ message: "Internal server error" });
    }
  }

  async todaysMetalRateByMetal(req, res) {
    const { metalid,purity, date,branch} = req.query;

    try {
      if (!purity) {
        return res.status(400).json({ message: "Purity id is required" });
      }

      if (!metalid) {
        return res.status(400).json({ message: "Metal id is required" });
      }


      let parsedDate = null;
      if (date) {
        parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        parsedDate = new Date(
          Date.UTC(
            parsedDate.getUTCFullYear(),
            parsedDate.getUTCMonth(),
            parsedDate.getUTCDate(),
            0,
            0,
            0,
            0
          )
        );
      }

      let branchId=""
      if(!branch){
        branchId  = req.user.branch;
      }

      if(!branch && !req.user.branch){
        return res.status(400).json("No branch provided")
      }
      const result = await this.metalRateUseCase.todaysMetalRateByMetal(
        metalid,
        purity,
        parsedDate,
        branch
      );

      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      return res 
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error("Error fetching metal rate:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async todaysMetalRate(req, res) {

    const { branchId, date } = req.params;
    
    try {
      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      let parsedDate = null;
      if (date) {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }else if (!date) {
        const date= new Date()
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date format" });
        }
      }

      const result = await this.metalRateUseCase.getMetalRate(
        branchId,
        parsedDate
      );

      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error("Error fetching metal rate:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async metalRateTable(req, res) {
    try {
      const { page, limit, search, from_date, to_date } = req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      let dateFilter = {};
      if (from_date || to_date) {
        const fromDate = from_date ? new Date(from_date) : null;
        const toDate = to_date ? new Date(to_date) : null;

        if ((from_date && isNaN(fromDate)) || (to_date && isNaN(toDate))) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        dateFilter = {
          updatetime: {
            ...(fromDate && { $gte: fromDate }),
            ...(toDate && { $lte: toDate }),
          },
        };
      }

      const result = await this.metalRateUseCase.metalRateTable(
        page,
        limit,
        search,
        dateFilter
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
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

  async getById(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res
          .status(400)
          .json({ message: "No valid branch id not provided" });
      }

      const result = await this.metalRateUseCase.getById(id);

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

  async metalRatetoday(req, res) {
    const { branchId } = req.params;
    try {
      
      if (!branchId) {
        query.branchId = req.user.branch;
      }

      if (!branchId) {
        return res.status(400).json({ message: "Branch ID is required" });
      }

      const result = await this.metalRateUseCase.getMetalRate(
        branchId
      );

      if (!result.success) {
        return res.status(404).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error("Error in metal rate:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default metalRateController;
