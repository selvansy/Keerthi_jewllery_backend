class ProductController {
  constructor(productUsecase, validator) {
    this.productUsecase = productUsecase;
    this.validator = validator;
  }

  async addProduct(req, res) {
    try {
      const { error } = this.validator.productValidations.validate(req.body, { allowUnknown: true });

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      if (!req.files.product_image || req.files.product_image.length == 0) {
        return res.status(400).json({ message: "Atleast one image required" });
      }

      req.body.created_by = req.user.id_employee;
      req.body.modified_by = req.user.id_employee;
      const addProductResult = await this.productUsecase.addProduct(
        req.body,
        req.files.product_image
      );
      if (addProductResult.success) {
        return res.status(201).json({ message: addProductResult.message });
      }
      return res.status(400).json({ message: addProductResult.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async editProduct(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const { error } = this.validator.productValidations.validate(req.body, { allowUnknown: true });

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }
      req.body.modified_by = req.user.id_employee;

      const updateProduct = await this.productUsecase.editProduct(
        id,
        req.body,
        req.files
      );
      if (updateProduct.success) {
        return res.status(200).json({ message: updateProduct.message });
      }
      return res.status(400).json({ message: updateProduct.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        req.status(400).json({ message: "Product Id is required" });
      }
      const deleteProductResult = await this.productUsecase.deleteProduct(id);
      if (deleteProductResult.success) {
        return res.status(200).json({ message: deleteProductResult.message });
      }
      return res.status(400).json({ message: deleteProductResult.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const changeStatus = await this.productUsecase.changeStatus(id);
      if (changeStatus.success) {
        return res.status(200).json({ message: changeStatus.message });
      }
      return res.status(400).json({ message: changeStatus.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async ProductById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Product Id is required" });
      }

      const productData = await this.productUsecase.findById(id,req.user);
      if (productData.success) {
        return res
          .status(200)
          .json({ message: productData.message, data: productData.data });
      }
      return res.status(400).json({ message: productData.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async ProductByBranchId(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Product Id required" });
      }

      const productData = await this.productUsecase.findByBranchId(id);
      if (productData.success) {
        return res
          .status(200)
          .json({ message: productData.message, data: productData.data });
      }
      return res.status(400).json({ message: productData.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async allProducts(req, res) {
    try {
      const result = await this.productUsecase.getProducts(req.body,req.user);
      if (result.success) {
        return res
          .status(200)
          .json({
            message: result.message,
            data: result.allProducts,
            totalDocument: result.totalproducts,
            totalPages: result.totalPages,
            currentPage: result.currentPage,
          });
      }
      return res.status(400).json({ message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

 
}

export default ProductController;
