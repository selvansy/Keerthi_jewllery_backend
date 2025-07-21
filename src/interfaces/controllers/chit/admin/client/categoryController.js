class CategoryController {
  constructor(categoryUsecase, validator) {
    this.categoryUsecase = categoryUsecase;
    this.validator = validator;
  }

  async addCategory(req, res) {
    try {
      const {category_name,id_metal,id_branch} = req.body;

      const  validate=  {category_name,id_metal,id_branch}
      
      const { error } = this.validator.categoryValidations.validate(validate);
      if (error) {
        return res.status(400).json(error.details[0].message);
      }
      req.body.created_by = req.user.id_employee;
      const categoryResult = await this.categoryUsecase.addCategory(req.body);

      if (categoryResult.success) {
        return res.status(201).json({ message: categoryResult.message });
      }
      return res.status(400).json({ message: categoryResult.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Category id is required" });
      }

      const {category_name,id_metal,id_branch} = req.body;
      const  validate=  {category_name,id_metal,id_branch}
     
      const { error } = this.validator.categoryValidations.validate(validate);

      if (error) {
        return res.status(400).json(error.details[0].message);
      }

      const editCategoryResult = await this.categoryUsecase.editCategory(
        req.body,
        id
      );
      if (editCategoryResult) {
        return res.status(200).json({ message: editCategoryResult.message });
      }
      return res.status(400).json({ message: editCategoryResult.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Category id Required" });
      }

      const deleteCategoryResult = await this.categoryUsecase.deleteCategory(
        id
      );
      if (deleteCategoryResult.success) {
        return res.status(200).json({ message: deleteCategoryResult.message });
      }
      return res.status(400).json({ message: deleteCategoryResult.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Category Id is required" });
      }

      const changeStatusResult = await this.categoryUsecase.changeStatus(id);
      if (changeStatusResult.success) {
        return res.status(200).json({ message: changeStatusResult.message });
      }
      return res.status(400).json({ message: changeStatusResult.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Category id is required" });
      }
      const categoryResult = await this.categoryUsecase.findById(id);
      console.error(categoryResult);

      if (categoryResult.success) {
        return res
          .status(200)
          .json({ message: categoryResult.message, data: categoryResult.data });
      }
      return res.status(400).json({ message: categoryResult.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByBranchId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "branch Id is required" });
      }
      const categoryData = await this.categoryUsecase.findByBranch(id);
      if (categoryData.success) {
        return res
          .status(200)
          .json({ message: categoryData.message, data: categoryData.data });
      }
      return res.status(204).json({ message: categoryData.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByMetalId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "metal Id is required" });
      }

      const categoryData = await this.categoryUsecase.findByMetalId(id);
      if (categoryData.success) {
        return res
          .status(200)
          .json({ message: categoryData.message, data: categoryData.data });
      }
      return res.status(400).json({ message: categoryData.message });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCategory(req, res) {
    try {
      const getAllCategory = await this.categoryUsecase.getCategory(req.body);
      if (getAllCategory.success) {
        return res
          .status(200)
          .json({ message: getAllCategory.message, data: getAllCategory.data.category,
            totalDocuments: getAllCategory.data.totalcategory,
            totalPages:getAllCategory.data.totalPages,
            currentPage: getAllCategory.data.currentPage
          });
      }
      return res.status(400).json({ message: getAllCategory.message});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllActiveCategory (req,res){
    try{
      const {id_branch}=req.body

      if(!id_branch){
        return res.status(400).json({message:"id_branch is required"})
      }
      
      const result = await this.categoryUsecase.findAllActive(id_branch)
      if(result.success){
        return res.status(200).json({message:result.message,data:result.data})
      }
       return res.status(400).json({message:result.message})
    }catch(err){
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllCategories (req,res){
    try{
      const {branch}=req.query

      let branchId;
      if(branch){
        branchId = branch
      }else{
        branchId = req.user.id_branch
      }
      
      const result = await this.categoryUsecase.getAllCategories(branchId)
      if(result.success){
        return res.status(200).json({message:result.message,data:result.data})
      }
       return res.status(400).json({message:result.message})
    }catch(err){
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default CategoryController;
