import CategoryModel from "../../models/chit/categoryModel.js";
import ProductModel from "../../models/chit/productModel.js";

class CategoryRepository {
  async addCategory(categoryData) {
    try {
      const saveCategory = new CategoryModel(categoryData);
      await saveCategory.save();
      return saveCategory;
    } catch (err) {
      console.error(err);
      throw new Error("Database error occured while Creating category");
    }
  }

  async findById(id) {
    try {
      return await CategoryModel.findOne({ _id: id, is_deleted: false });
    } catch (err) {
      throw new Error(
        "Database error occurred while finding new arrivals by id"
      );
    }
  }

  async findByName(category_name, id) {
    try {
      const filter = {
        category_name: category_name
          ? new RegExp(`^${category_name}$`, "i")
          : undefined,
        is_deleted: false,
      };

      if (id) {
        filter._id = { $ne: id };
      }

      const findCategory = await CategoryModel.findOne(filter);

      if (!findCategory) return null;

      return {
        category_name: findCategory.category_name,
        _id: findCategory._id,
      };
    } catch (err) {
      throw new Error("Database error occurred while finding category by name");
    }
  }

  async editCategory(id, categoryData) {
    try {
      const updateCategory = await CategoryModel.updateOne(
        { _id: id },
        { $set: categoryData }
      );
      if (updateCategory.modifiedCount == 1) {
        return updateCategory;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error("Database error occurred while editing category ");
    }
  }

  async deleteCategory(id) {
    try {
      const update = await CategoryModel.updateOne(
        { _id: id },
        { is_deleted: true }
      );
      await ProductModel.updateMany({id_category:id},{$set:{is_deleted:true}})
      if (update.modifiedCount == 1) return true;
      return null;
    } catch (err) {
      throw new Error("Database error occurred while deleting category");
    }
  }

  async changeStatus(id, status) {
    try {
      const updateStatus = await CategoryModel.updateOne(
        { _id: id },
        { active: !status }
      );
      if (updateStatus.modifiedCount == 1) {
        return updateStatus;
      }
      return null;
    } catch (err) {
      throw new Error("Database error occurred while changing category status");
    }
  }

  async getByBranchId(id) {
    try {
      const categoryData = await CategoryModel.find({
        id_branch: id,
        is_deleted: false,
      });

      if (categoryData.length > 0) {
        return categoryData;
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(
        "Database error occurred while finding category by branch"
      );
    }
  }

  async getByMetalId(id) {
    try {
      const categoryData = await CategoryModel.find({
        id_metal: id,
        is_deleted: false,
        active:true
      });

      if (categoryData.length > 0) {
        return categoryData;
      } else {
        return null;
      }
    } catch (err) {
      console.error(err)
      throw new Error(
        "Database error occurred while finding category by metal id"
      );
    }
  }

    async getCategory(filter, skip, limit) {
      try{
        return await CategoryModel.find(filter)
        .skip(skip)
        .limit(limit)
        .populate('id_branch')
        .populate('id_metal','metal_name')
        .sort({_id:-1})

        .exec();
      }catch(err){
        throw new Error("Database error occured while get Category");
      }
    }
  
    async countCategory(filter) {
      return await CategoryModel.countDocuments(filter);
    }

    async findAllActive(branch){
      try{
        return await CategoryModel.find({active:true,is_deleted:false,id_branch:branch})
      }catch(err){
        throw new Error("Database error occured while get Category");
      }
    }

    async getAllCategories(branch){
      try{
        return await CategoryModel.find({active:true,is_deleted:false,id_branch:branch}).select('category_name _id')
      }catch(err){
        throw new Error("Database error occured while get Category");
      }
    }
}

export default CategoryRepository;
