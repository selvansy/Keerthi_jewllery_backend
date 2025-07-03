class DepartmentController {
  constructor(departmentUsecase, validator) {
    this.departmentUsecase = departmentUsecase;
    this.validator = validator;
  }

  async addDepartment(req, res) {
    const {
      name,
    } = req.body;

    try {
      if (!name) {
        return res.status(400).json({ message: 'Department Name is required' });
      }
      
      req.body.createdBy = req.user.id_employee;
      const data = req.body;

      const result = await this.departmentUsecase.addDepartment(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async editDepartment(req, res) {
    const { id } = req.params;
    const {
      name,
    } = req.body;

    try {
      if (!id) {
        return res.status(400).json({ message: "ID required" })
      }

      if (!name) {
        return res.status(400).json({ message: 'Department Name is required' });
      }

      req.body.updatedBy = req.user.id_employee;
      const data = req.body;
      const result = await this.departmentUsecase.editDepartment(id, data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "Department ID is required" });
      }

      const result = await this.departmentUsecase.deleteDepartment(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      } else if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  async changeDepartmentStatus(req, res) {
    try {
      const { id } = req.params
      if (!id) {
        return res.status(400).json({ message: "Department ID required" })
      }

      const result = await this.departmentUsecase.changeDepartmentStatus(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: result.message })
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" })
    }
  }

  async getDepartmentByid(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Department ID required" })
      }

      const result = await this.departmentUsecase.getDepartmentByid(id)

      if (!result.success) {
        return res.status(400).json({ message: result.message })
      }

      res.status(200).json({ message: result.message, data: result.data })
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" })
    }
  }

  async departmentTable(req, res) {
    try {
      const { page, limit, search,active } = req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const result =
        await this.departmentUsecase.departmentTable(
          page,
          limit,
          search,
          active
        );

      if (!result || !result.success) {
        return res.status(404).json({ message: result.message });
      }

      res.status(200).json({
        message: result.message,
        data: result.data,
        totalDocument: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllActiveDepartments(req, res) {
    try {
      const result = await this.departmentUsecase.getAllActiveDepartments()

      if (!result.success) {
        return res.status(200).json({ message: result.message, data: [] })
      }

      return res.status(200).json({ message: result.message, data: result.data })
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" })
    }
  }
}

export default DepartmentController;