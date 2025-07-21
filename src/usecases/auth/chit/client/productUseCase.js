import mongoose, { isValidObjectId } from "mongoose";
import config from "../../../../config/chit/env.js";

class ProductUseCase {
  constructor(
    productRepository,
    branchRepository,
    metalRepository,
    categoryRepository,
    purityRepository,
    metalRateRepository,
    s3Service,
    s3rRepo
  ) {
    (this.productRepository = productRepository),
      (this.branchRepository = branchRepository),
      (this.metalRepository = metalRepository),
      (this.categoryRepository = categoryRepository),
      (this.purityRepository = purityRepository),
      (this.metalRateRepository = metalRateRepository),
      (this.s3Service = s3Service);
      this.s3Respo = s3rRepo
  }

  async s3Helper(id_branch){
    try {
      const s3settings = await this.s3Respo.getSettingByBranch(id_branch);
      if (s3settings.length==0) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings[0].s3key,
        s3secret: s3settings[0].s3secret,
        s3bucket_name: s3settings[0].s3bucket_name,
        s3display_url: s3settings[0].s3display_url,
        region: s3settings[0].region,
      };

      return configuration
    } catch (error) {
      console.error(error)
    }
  }

  validateObjectId(id, name) {
    if (id && !isValidObjectId(id)) {
      return { success: false, message: `Provide a valid ${name} ID` };
    }
    return null;
  }

  async addProduct(productData, product_image) {
    try {
      const objectIdValidationErrors = [
        this.validateObjectId(productData.id_branch, "Branch"),
        this.validateObjectId(productData.id_category, "Category"),
        this.validateObjectId(productData.id_purity, "Purity"),
        this.validateObjectId(productData.id_metal, "Metal"),
      ].filter(Boolean);

      if (objectIdValidationErrors.length) {
        return { success: false, message: objectIdValidationErrors[0].message };
      }

      const [checkBranchId, checkCategoryId,checkPurityId,checkMetalId] =
        await Promise.all([
          this.branchRepository.findById(productData.id_branch),
          this.categoryRepository.findById(productData.id_category),
          this.purityRepository.findById(productData.id_purity),
          this.metalRepository.findById(productData.id_metal),
          
        ]);

     
      if (!checkBranchId) {
        return { success: false, message: "Branch not found" };
      }
      if (!checkCategoryId) {
        return { success: false, message: "Category not found" };
      }
     
      if (!checkPurityId) {
        return { success: false, message: "Purity not found" };
      }
      if (!checkMetalId) {
        return { success: false, message: "Metal not found" };
      }
     
      const existingProduct = await this.productRepository.findByName(
        productData.product_name,
        productData.id_branch
      );

      if (existingProduct) {
        return { success: false, message: "Product already existing" };
      }

      const existingCode = await this.productRepository.findByCode(
        productData.code
      );
      if (existingCode) {
        return { success: false, message: "Product code already existing" };
      }

      const s3configs= await this.s3Helper(productData.id_branch)
      if(s3configs.success==false) return s3configs 

      const uploadPromises = product_image.map(async (image, index) => {
        if (!image.buffer || !image.mimetype || !image.originalname) {
            console.warn(`Skipping invalid image at index ${index}:`, image);
            return null;
        }

        return this.s3Service.uploadToS3(image, "products", s3configs);
    });

    const uploadedImages = (await Promise.all(uploadPromises)).filter(Boolean); // Remove null values
        productData.product_image = uploadedImages; // Store uploaded URLs

      const saveProduct = await this.productRepository.addProduct(productData);
      if (saveProduct) {
        return { success: true, message: "Product added successfully" };
      }
      return {
        success: false,
        message: "Failed to add product. Please try again later",
      };
    } catch (err) {
      console.error(err);

      return {
        success: false,
        message: "An error occurred while add Product.",
        error: err.message,
      };
    }
  }

  async editProduct(id, productData, images) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;
  
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }
  
      const objectIdValidationErrors = [
        this.validateObjectId(productData.id_branch, "Branch"),
        this.validateObjectId(productData.id_category, "Category"),
      ].filter(Boolean);
  
      if (objectIdValidationErrors.length) {
        return { success: false, message: objectIdValidationErrors[0].message };
      }
  
      const checkName = await this.productRepository.findByName(
        productData.product_name,
        productData.id_branch,
        id
      );
      if (checkName) {
        return { success: false, message: "Product already existing" };
      }
  
      const updateFields = {};
  
      for (let key in productData) {
        if (key === "showprice" || key === "sell") {
          const newValue =
            productData[key] === "true" || productData[key] === true;
          updateFields[key] = newValue;
        } else if (
          key === "modified_by" ||
          key === "id_branch" ||
          key === "id_metal" ||
          key === "id_purity" ||
          key === "id_category"
        ) {
          updateFields[key] = productData[key];
        } else if (productData[key] !== undefined) {
          updateFields[key] = productData[key];
        }
      }
  
      if (
        updateFields.id_metal ||
        updateFields.id_branch ||
        updateFields.id_category ||
        updateFields.id_purity
      ) {
        const [checkBranchId, checkCategoryId] = await Promise.all([
          updateFields.id_branch
            ? this.branchRepository.findById(updateFields.id_branch)
            : null,
          updateFields.id_category
            ? this.categoryRepository.findById(updateFields.id_category)
            : null,
        ]);
  
        if (updateFields.id_branch && !checkBranchId) {
          return { success: false, message: "Branch not found" };
        }
        if (updateFields.id_category && !checkCategoryId) {
          return { success: false, message: "Category not found" };
        }
      }
  
      if (images.product_image) {
        const s3configs = await this.s3Helper(productData.id_branch);
        const { product_image } = images;
  
        const existingImages = existingProduct.product_image || [];

        const imagesToRemove = existingImages.filter(
          (img) => !product_image.includes(img)
        );
  
        const removePromises = imagesToRemove.map((img) =>
          this.s3Service.deleteFromS3(
            `${s3configs.s3display_url}${config.AWS_LOCAL_PATH}products/${img}`,
            s3configs
          )
        );
        await Promise.all(removePromises);
  
        const newImagesToUpload = product_image.filter(
          (img) => !existingImages.includes(img)
        );
  
        const uploadPromises = newImagesToUpload.map((image) =>
          this.s3Service.uploadToS3(image, "products", s3configs)
        );
        const uploadedImages = await Promise.all(uploadPromises);

        productData.product_image = [
          ...product_image.filter((img) => existingImages.includes(img)),
          ...uploadedImages,
        ];
      }
  
      const updateProduct = await this.productRepository.editProduct(
        productData,
        id
      );
      if (updateProduct) {
        return { success: true, message: "Product edited successfully" };
      }
      return {
        success: false,
        message: "Failed to edit product. Please try again",
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while editing Product.",
        error: err.message,
      };
    }
  }
  
  
  

  async deleteProduct(id) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }

      const result = await this.productRepository.deleteProduct(id);
      if (result) {
        return { success: true, message: "Product deleted successfully" };
      }
      return { success: false, message: "Failed to delete Product" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while Deleting Product.",
        error: err.message,
      };
    }
  }

  async changeStatus(id) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;
      const existingProduct = await this.productRepository.findById(id);
      if (!existingProduct) {
        return { success: false, message: "Product not found" };
      }
      const updatedProduct = await this.productRepository.changeStatus(
        id,
        existingProduct.active
      );
      const message = updatedProduct
        ? existingProduct.active
          ? "Product successfully deactivated"
          : "Product successfully activated"
        : existingProduct.active
        ? "Failed to deactivate Product"
        : "Failed to activate Product";

      return { success: !!updatedProduct, message };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while Change Product status.",
        error: err.message,
      };
    }
  }

  async findById(id,token) {
    try {
      const idValidation = this.validateObjectId(id, "Product");
      if (idValidation) return idValidation;

      let customerId=null
      if(token && token._id){
        customerId = token._id
      }

      let existingProduct
      if(customerId){
         existingProduct = await this.productRepository.findById(id,customerId);
      }else{
         existingProduct = await this.productRepository.findById(id);
      }
      
      if (existingProduct) {
        return {
          success: true,
          message: "Product retrieved successfully",
          data: existingProduct,
        };
      }
      return { success: false, message: "Product not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product by Id.",
        error: err.message,
      };
    }
  }

  async findByBranchId(id){
    try {
      const idValidation = this.validateObjectId(id, "Branch");
      if (idValidation) return idValidation;
      const existingBranch = await this.branchRepository.findById(id);

      if (!existingBranch) {
        return { success: false, message: "Branch not existing" };
      }
      const productBranch = await this.productRepository.findByBranchId(id);
      const rate = await this.getTodayMatelRate(id)
      if (productBranch) {
        return {
          success: true,
          message: "Product retrieved successfully",
          data: productBranch,
        };
      }
      return { success: false, message: "Product not found" };
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product by Branch Id.",
        error: err.message,
      };
    }
  }

  async getTodayMatelRate(branchId){
    try{
      const getPrice=await this.metalRateRepository.getMetalRate(branchId)
      return getPrice
    }catch(err){
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getProducts(query,token) {
    try {
      const { page, limit, from_date, to_date, id_branch, search,active } = query;
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
      const skip = (pageNum - 1) * pageSize;
      const filter = { is_deleted: false };

      if (active !== null && active !== undefined && active !== "") {
        filter.active = active;
      }

      if(query.category){
        filter.id_category = new mongoose.Types.ObjectId(query.category)
      }
      

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

      if (isValidObjectId(id_branch)) {
        filter.id_branch = new mongoose.Types.ObjectId(id_branch)
      }

      let customer;
      if(token){
        customer = token._id
      }

      const searchOptions = search ? { term: search.trim() } : null;

      const products = await this.productRepository.getProducts(
        filter,
        skip,
        pageSize,
        searchOptions,
        customer ? customer : null
      );
      if (!products.length >= 1) {
        return { success: false, message: "No products found" };
      }

      const totalproducts = await this.productRepository.countProduct(filter);

      return {
          success: true,
          message: "Product retrieved successfully",
          allProducts:products,
          totalproducts,
          totalPages: Math.ceil(totalproducts / pageSize),
          currentPage: pageNum,
        }
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: "An error occurred while get product",
        error: err.message,
      };
    }
  }




}

export default ProductUseCase;
