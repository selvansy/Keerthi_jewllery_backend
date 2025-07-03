class EmployeeController {
  constructor(employeeUseCase, validator) {
    this.employeeUseCase = employeeUseCase;
    this.validator = validator;
  }

  async addEmployee(req, res) {
    try {
      const {
        firstname,
        mobile,
        gender,
        id_country,
        id_state,
        id_city,
        pincode,
        id_branch,
        aadhar_number,
        date_of_birth,
        date_of_join,
      } = req.body;
      const validate = {
        firstname,
        mobile,
        gender,
        id_country,
        id_branch,
        id_state,
        id_city,
        pincode,
        date_of_birth,
        date_of_join,
        aadhar_number,
      };

      const { error } = this.validator.employeeValidations.validate(validate);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data = { ...req.body };
      data.created_by = req.user.id_employee;
      data.modified_by = req.user.id_employee;
      const result = await this.employeeUseCase.addEmployee(data,req.files,req.user);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Intenal server error" });
    }
  }

  async editEmployee(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const {
        firstname,
        mobile,
        gender,
        id_country,
        id_state,
        id_city,
        pincode,
        id_branch,
        aadhar_number,
        date_of_birth,
        date_of_join,
      } = req.body;
      const validate = {
        firstname,
        mobile,
        gender,
        id_country,
        id_branch,
        id_state,
        id_city,
        pincode,
        date_of_birth,
        date_of_join,
        aadhar_number,
      };

      const { error } = this.validator.employeeValidations.validate(validate);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const data = { ...req.body };
      data.modified_by = req.user.id_employee;
      if(!data.id_branch){
        data.id_branch= req.user.id_branch
      }
      const result = await this.employeeUseCase.editEmployee(
        id,
        data,
        req.files,
        req.user
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Intenal server error" });
    }
  }

  async deleteEmployee(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const result = await this.employeeUseCase.deleteEmployee(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Intenal server error" });
    }
  }

  async activateEmployee(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const result = await this.employeeUseCase.activateEmployee(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Intenal server error" });
    }
  }

  async getAllEmployees(req, res) {
    try {
      const { page, limit, search } = req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const result = await this.employeeUseCase.getAllEmployees(
        page,
        limit,
        search
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res
        .status(200)
        .json({
          message: result.message,
          data: result.data,
          totalDocument: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getEmployeeById(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No employee id provided" });
      }

      const result = await this.employeeUseCase.getEmployeeById(id);

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

  async getEmployeeByBranch(req, res) {
    const { branchId } = req.params;
    try {
      if (!branchId) {
        return res.status(400).json({ message: "No valid branch id provided" });
      }

      const result = await this.employeeUseCase.getEmployeeByBranch(branchId);

      if (!result.success) {
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

  async getAll(req, res) {
    try {
      const result = await this.employeeUseCase.getAll();

      if (!result.success) {
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

  async getReferrals(req, res) {
    try {
      const { page, limit, search} = req.query;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const result = await this.employeeUseCase.getReferrals(req.query);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res
        .status(200)
        .json({
          message: result.message,
          data: result.data,
          totalDocument: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getEmployeeByMobile(req, res) {
    const {search} = req.query;
    try {
      if (!search) {
        return res.status(400).json({ message: "No mobile number is provided" });
      }

      const result = await this.employeeUseCase.getEmployeeByMobile(search);

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

export default EmployeeController;
