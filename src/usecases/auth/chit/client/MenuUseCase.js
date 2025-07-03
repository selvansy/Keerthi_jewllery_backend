import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MenuUseCase {
  constructor(menuRepository) {
    this.menuRepository = menuRepository;
  }

  // async saveImage(image) {
  //   if (!image || !image.path) return null;

  //   // const uploadDir = path.resolve(__dirname, "../../../../public/uploads/icons"); 
  //   fs.mkdirSync(uploadDir, { recursive: true });

  //   const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  //   const safeFileName = image.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
  //   const fileName = `${path.parse(safeFileName).name}-${uniqueSuffix}.svg`;

  //   const fullPath = path.join(uploadDir, fileName);
  //   const iconPath = `uploads/icons/${fileName}`;

  //   try {
  //       await fs.promises.rename(image.path, fullPath); 
  //       return iconPath; 
  //   } catch (error) {
  //       console.error("Error saving file:", error);
  //       return null;
  //   }
  // }

async addMenuSetting(data, image) {
  try {
      const exists = await this.menuRepository.findByName(data.menu_name);
      if (exists) return { success: false, message: "Menu already exists" };

      let iconPath = null;

      if (image && image.path) {
          const uploadDir = path.join(__dirname, '../../../../public/uploads/icons');
          fs.mkdirSync(uploadDir, { recursive: true });

          // const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          // const safeFileName = image.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
          // const fileName = `${path.parse(safeFileName).name}-${uniqueSuffix}.svg`;

          // const fullPath = path.join(uploadDir, fileName);
          // iconPath = `uploads/icons/${fileName}`;

          // await fs.promises.rename(image.path, fullPath);
          const safeFileName = `${data.display_order}.svg`;
            const fullPath = path.join(uploadDir, safeFileName);

            iconPath = `uploads/icons/${safeFileName}`;

            await fs.promises.rename(image.path, fullPath);
      }

      const menuData = {
          ...data,
          menu_icon: iconPath,
      };

      const savedData = await this.menuRepository.addMenuSetting(menuData);
      return savedData
          ? { success: true, message: "Menu created successfully" }
          : { success: false, message: "Failed to create menu" };
  } catch (error) {
      console.error("Error in addMenuSetting:", error);
      return { success: false, message: "An error occurred while adding menu" };
  }
}

async editMenuSetting(id, data, image) {
  try {
      if (!isValidObjectId(id)) return { success: false, message: "Provide a valid object ID" };

      const existing = await this.menuRepository.findById(id);
      if (!existing) return { success: false, message: "Menu not found" };

      let iconPath = existing.menu_icon;

      if (image && image.path) {
        const uploadDir = path.join(__dirname, '../../../../public/uploads/icons');
          fs.mkdirSync(uploadDir, { recursive: true });

          // const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          // const safeFileName = image.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
          // const fileName = `${path.parse(safeFileName).name}-${uniqueSuffix}.svg`;

          // const fullPath = path.join(uploadDir, fileName);
          // iconPath = `uploads/icons/${fileName}`;

          // await fs.promises.rename(image.path, fullPath);
          const safeFileName = `${data.display_order}.svg`;
          const fullPath = path.join(uploadDir, safeFileName);

          iconPath = `uploads/icons/${safeFileName}`;

          await fs.promises.rename(image.path, fullPath);

          if (existing.menu_icon) {
              const oldImagePath = path.join(__dirname, '../../public', existing.menu_icon);
              if (fs.existsSync(oldImagePath)) {
                  fs.unlinkSync(oldImagePath);
              }
          }
      }

      const fieldsToUpdate = {
          ...data,
          menu_icon: iconPath,
      };

      const updatedData = await this.menuRepository.editMenuSetting(id, fieldsToUpdate);
      return updatedData
          ? { success: true, message: "Menu updated successfully" }
          : { success: false, message: "Failed to edit menu" };
  } catch (error) {
      console.error("Error in editMenuSetting:", error);
      return { success: false, message: "An error occurred while editing menu" };
  }
}

  async deleteMenuSetting(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.menuRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No menu setting found" };
      }

      if (exists.is_deleted) {
        return { success: false, message: "Already deleted menu" };
      }

      const deletedData = await this.menuRepository.deleteMenuSetting(id);

      if (deletedData) {
        return { success: true, message: "Menu deleted successfully" };
      }

      return { success: false, message: "Failed to delete menu" };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while deleting menu",
      };
    }
  }

  async changeMenuActiveStatus(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const exists = await this.menuRepository.findById(id);

      if (!exists) {
        return { success: false, message: "No menu found" };
      }

      if (exists.is_deleted) {
        return {
          success: false,
          message: "Deleted menu unable to change status",
        };
      }

      const updatedData = await this.menuRepository.changeModeActiveStatus(
        id,
        exists.active
      );

      if (!updatedData) {
        return { success: false, message: "Failed to change menu status" };
      }

      let message = exists.active
        ? "Menu successfully deactivated"
        : "Menu successfully activated";

      return { success: true, message: message };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occured while switching menu status",
      };
    }
  }

  async getMenuById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object ID" };
      }

      const menuData = await this.menuRepository.findById(id);

      if (!menuData) {
        return { success: false, message: "No menu found" };
      }

      return {
        success: true,
        message: "Menu data fetched successfully",
        data: menuData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while fetching data" };
    }
  }

  async getAllMenu() {
    try {
      const menuData = await this.menuRepository.findAll();

      if (!menuData) {
        return { success: false, message: "No menu found" };
      }

      return {
        success: true,
        message: "Menu data fetched successfully",
        data: menuData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "An error occured while fetching data" };
    }
  }

  async getAllActiveMenuSettings(page, limit, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
        ? {
            $or: [{ menu_name: { $regex: searchTerm, $options: "i" } }],
          }
        : {};

      const query = {
        is_deleted:false,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.menuRepository.getAllActiveMenuSettings({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No data found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in getAllMenuSettings:", error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
  }
}

export default MenuUseCase;