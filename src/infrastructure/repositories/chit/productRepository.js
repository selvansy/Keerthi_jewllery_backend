import ProductModel from "../../models/chit/productModel.js";
import mongoose from "mongoose";
import moment from "moment";
class ProductRepository {
  async findByName(product_name, id_branch, id) {
    try {
      const filter = {
        product_name: product_name,
        is_deleted: false,
        id_branch: id_branch,
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const findProduct = await ProductModel.findOne(filter);

      if (!findProduct) return null;

      return {
        product_name: findProduct.product_name,
        _id: findProduct._id,
      };
    } catch (err) {
      throw new Error("Database error occurred while finding Product by name");
    }
  }

  async addProduct(productData) {
    try {
      const saveProduct = new ProductModel(productData);
      await saveProduct.save();
      return saveProduct;
    } catch (err) {
      console.error(err);

      throw new Error("Database error occurred while add product");
    }
  }

  async findByCode(code) {
    try {
      const findByCode = await ProductModel.find({ code, is_deleted: false });
      if (findByCode.length == 0) {
        return null;
      }
      return true;
    } catch (err) {
      throw new Error("Database error occurred while find product code");
    }
  }

  async findById(id, customerId) {
    try {
      const isValidCustomerId = customerId && mongoose.Types.ObjectId.isValid(customerId);
  
      const userData = await ProductModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
            is_deleted: false
          },
        },
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch",
            foreignField: "id_branch",
            as: "s3Details"
          }
        },
        { $unwind: "$s3Details" },
        {
          $lookup: {
            from: "categories",
            localField: "id_category",
            foreignField: "_id",
            as: "category"
          }
        },
        { $unwind: "$category" },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "branches"
          }
        },
        { $unwind: "$branches" },

        {
          $lookup: {
            from: "metalrates",
            let: {
              purityId: "$id_purity",
              branchId: "$id_branch"
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$purity_id", "$$purityId"] },
                      { $eq: ["$id_branch", "$$branchId"] }
                    ]
                  }
                }
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 }
            ],
            as: "purity"
          }
        },
        {
          $unwind: {
            path: "$purity",
            preserveNullAndEmptyArrays: true
          }
        },
  
        {
          $addFields: {
            purityRate: "$purity.rate",
            price: {
              $cond: {
                if: { $and: ["$purity.rate", "$weight"] },
                then: { $multiply: ["$weight", "$purity.rate"] },
                else: null
              }
            }
          }
        },
  
        ...(isValidCustomerId
          ? [
              {
                $lookup: {
                  from: "wishlists",
                  let: { productId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$itemId", "$$productId"] },
                            { $eq: ["$id_customer", new mongoose.Types.ObjectId(customerId)] }
                          ]
                        }
                      }
                    }
                  ],
                  as: "wishlistMatch"
                }
              },
              {
                $addFields: {
                  isWishlisted: { $gt: [{ $size: "$wishlistMatch" }, 0] }
                }
              }
            ]
          : [
              {
                $addFields: { isWishlisted: false }
              }
            ]
        ),
        
        {
          $project: {
            product_name: 1,
            description: 1,
            product_image: 1,
            code: 1,
            weight: 1,
            metalcost: 1,
            id_metal: 1,
            id_purity: 1,
            id_category: 1,
            gst: 1,
            sell: 1,
            showprice: 1,
            makingCharges: 1,
            wastageCharges: 1,
            active: 1,
            id_branch: 1,
            categoryName: "$category.category_name",
            pathurl: {
              $concat: ["$s3Details.s3display_url", "keerthijewellery/webadmin/assets/products/"]
            },
            isWishlisted: 1,
            purityRate: 1,
            price: 1
          }
        },
        { $limit: 1 }
      ]);
  
      return userData.length ? userData[0] : null;
  
    } catch (err) {
      console.error(err);
      throw new Error("Database error occurred while finding Product by id");
    }
  }

  async editProduct(productData, id) {
    try {
      const editProduct = await ProductModel.updateOne(
        { _id: id },
        { $set: productData }
      );
      if (editProduct.modifiedCount == 1) {
        return editProduct;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while editing Product");
    }
  }

  async deleteProduct(id) {
    try {
      const deleteProduct = await ProductModel.updateOne(
        { _id: id },
        { is_deleted: true }
      );
      if (deleteProduct.modifiedCount == 1) {
        return true;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while deleting Product");
    }
  }

  async changeStatus(id, status) {
    try {
      const updateStatus = await ProductModel.updateOne(
        { _id: id },
        { active: !status }
      );
      if (updateStatus.modifiedCount == 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while changing product status");
    }
  }

  async findByBranchId(id) {
    try {
      const productData = await ProductModel.find({ id_branch: id,is_deleted:false,active:true });
      if (productData.length >= 1) {
        return productData;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while get product by Branch");
    }
  }

  async getProducts(filter, skip, limit, searchOptions, customerId=null) {
    try {
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: "branches",
            localField: "id_branch",
            foreignField: "_id",
            as: "id_branch",
          },
        },
        { $unwind: { path: "$id_branch", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "id_category",
            foreignField: "_id",
            as: "id_category",
          },
        },
        { $unwind: { path: "$id_category", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "metals",
            localField: "id_metal",
            foreignField: "_id",
            as: "id_metal",
          },
        },
        { $unwind: { path: "$id_metal", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "purities",
            localField: "id_purity",
            foreignField: "_id",
            as: "id_purity",
          },
        },
        { $unwind: { path: "$id_purity", preserveNullAndEmptyArrays: true } },
  
        // S3 bucket settings lookup
        {
          $lookup: {
            from: "s3bucketsettings",
            localField: "id_branch._id",
            foreignField: "id_branch",
            as: "s3Details",
          },
        },
        { $unwind: { path: "$s3Details", preserveNullAndEmptyArrays: true } },
  
        ...(customerId ? [
          {
            $lookup: {
              from: "wishlists",
              let: { productId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$itemId", "$$productId"] },
                        { $eq: ["$id_customer", new mongoose.Types.ObjectId(customerId)] }
                      ]
                    }
                  }
                }
              ],
              as: "wishlistMatch"
            }
          },
          {
            $addFields: {
              isWishlisted: {
                $gt: [{ $size: "$wishlistMatch" }, 0]
              }
            }
          }
        ] : [
          {
            $addFields: {
              isWishlisted: false
            }
          }
        ])
      ];
  
      // Search logic
      if (searchOptions && searchOptions.term) {
        const searchWords = searchOptions.term.split(/\s+|[()]/g).filter(word => word.length > 0);
        const orConditions = [];
  
        searchWords.forEach(word => {
          const wordRegex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
  
          orConditions.push(
            { product_name: { $regex: wordRegex } },
            { "id_branch.branch_name": { $regex: wordRegex } },
            { "id_category.category_name": { $regex: wordRegex } },
            { "id_metal.metal_name": { $regex: wordRegex } },
            { "id_purity.purity_name": { $regex: wordRegex } }
          );
        });
  
        if (!isNaN(searchOptions.term)) {
          const numSearch = parseFloat(searchOptions.term);
          orConditions.push({ weight: numSearch });
        }
  
        const momentDate = moment(searchOptions.term, ['DD/MM/YYYY', 'YYYY-MM-DD'], true);
        if (momentDate.isValid()) {
          const startOfDay = momentDate.startOf('day').toDate();
          const endOfDay = momentDate.endOf('day').toDate();
  
          orConditions.push({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
          });
        }
  
        pipeline.push({
          $match: { $or: orConditions },
        });
      }
  
      pipeline.push(
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            product_name: 1,
            weight: 1,
            createdAt: 1,
            product_image: 1,
            active: 1,
            branchName: "$id_branch.branch_name",
            metalName: "$id_metal.metal_name",
            purityName: "$id_purity.purity_name",
            isWishlisted: 1,
            pathurl: {
              $concat: [
                "$s3Details.s3display_url",
                "keerthijewellery/webadmin/assets/products/",
              ],
            },
          },
        }
      );
  
      const products = await ProductModel.aggregate(pipeline);
      return products;
    } catch (err) {
      console.error(err);
    }
  }

  async countProduct(filter) {
    return await ProductModel.countDocuments(filter);
  }

  async updateCount(id, count) {
    try {
      const countUpdate = await ProductModel.updateOne(
        { _id: id },
        { $set: { whatsapp_sent: count } }
      );

      if (countUpdate.modifiedCount > 0) {
        return countUpdate;
      }

      return null;
    } catch (error) {
      console.error(error);
    }
  }
}

export default ProductRepository;
