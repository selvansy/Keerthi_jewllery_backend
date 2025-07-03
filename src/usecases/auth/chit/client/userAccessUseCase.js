import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";

class UserAccessUseCase {
  constructor(useraccessRepository, submenuRepository, menuRepository) {
    this.useraccessRepository = useraccessRepository;
    this.submenuRepository = submenuRepository;
    this.menuRepository = menuRepository;
  }

  async getUserPrermission(roleId) {
    try {
      if (!isValidObjectId(roleId)) {
        return { success: false, message: "Provide a valid object id" };
      }
      const subMenus = await this.submenuRepository.getUserPrermission();

      if (!subMenus) {
        return { success: false, message: "No submenus found"};
      }

      const menuList = [];
      for (const menu of subMenus) {
        let menuDict = {
          menu_id: menu._id,
          menu_name: menu.submenu_name,
          menu_path: menu.pathurl,
          view_permit: false,
          add_permit: false,
          edit_permit: false,
          delete_permit: false,
          display_order:menu.display_order
        };
  
        try {
          const menuPermission = await this.useraccessRepository.findOne( roleId,menu._id );
          if (menuPermission) {
            menuDict.view_permit = menuPermission.view_permit;
            menuDict.add_permit = menuPermission.add_permit;
            menuDict.edit_permit = menuPermission.edit_permit;
            menuDict.delete_permit = menuPermission.delete_permit;
          }
        } catch (err) {
          console.error(`Error fetching permission for menu ${menu._id}:`, err);
        }
        menuList.push(menuDict);
      }

      return {
        success: true,
        message: "User permissions retrived successfully",
        data: menuList,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting user permissions",
      };
    }
  }

  async getActiveMenuAccess(roleId) {
    try {
      if (!isValidObjectId(roleId)) {
        return { success: false, message: "Provide a valid object id" };
      }
      const accessData = await this.useraccessRepository.getActiveMenuAccess(
        new mongoose.Types.ObjectId(roleId)
      );

      if (!accessData) {
        return { success: false, message: "No menu data found" };
      }

      return {
        success: true,
        message: "Menu data retrived successfully",
        data: accessData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting menu" };
    }
  }

  async updateMenuPermission(data, roleId) {
    try {
      if (!isValidObjectId(data.id_submenu)) {
        return {
          success: false,
          message: "Submenu ID is not a valid ObjectId",
        };
      }
      if (!isValidObjectId(roleId)) {
        return { success: false, message: "Role ID is not a valid ObjectId" };
      }

      const parsedData = {
        id_submenu: data.id_submenu,
        view_permit: data.view_permit,
        add_permit: data.add_permit ,
        edit_permit: data.edit_permit,
        delete_permit: data.delete_permit
    };

      const accessData = await this.useraccessRepository.findOne(roleId,data.id_submenu);

      if (accessData) {
        const dataToUpdate = {
          view_permit:
          parsedData.view_permit !== undefined
              ? parsedData.view_permit
              : accessData.view_permit,
          add_permit:
            parsedData.add_permit !== undefined
              ? parsedData.add_permit
              : accessData.add_permit,
          edit_permit:
            parsedData.edit_permit !== undefined
              ? parsedData.edit_permit
              : accessData.edit_permit,
          delete_permit:
          parsedData.delete_permit !== undefined
              ? parsedData.delete_permit
              : accessData.delete_permit,
        };
  
        const updatedData = await this.useraccessRepository.updateAccess(
          accessData._id,
          dataToUpdate
        );
  
        if (!updatedData) {
          return {
            success: false,
            message: "Failed to update access permissions",
          };
        }
      }else{
        const dataToSave = {
          id_submenu: parsedData.id_submenu,
          id_role: roleId,
          view_permit: parsedData.view_permit,
          add_permit: parsedData.add_permit,
          edit_permit: parsedData.edit_permit,
          delete_permit: parsedData.delete_permit,
        };

        const newData = await this.useraccessRepository.addAccess(dataToSave);

        return {
          success: true,
          message: "Access updated",
          data: newData,
        };
      }

      return {
        success: true,
        message: "Access updated",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while updating access permissions",
      };
    }
  }
}

export default UserAccessUseCase;