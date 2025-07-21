import subMenuModel from "../../models/chit/subMenuSettingModel.js";

class SubMenuRepository {
  async findByName(name) {
    const menuData = await subMenuModel.findOne({submenu_name:name,is_deleted:false});
    if (!menuData) return null;
    return menuData;
  }

  async findById(id) {
    const data = await subMenuModel
      .findOne({ _id: id, is_deleted: false })
      .select(
        "_id id_menu pathurl is_deleted submenu_name active display_order id_project"
      )
      .lean();

    if (!data) return null;

    return data;
  }

  async addSubMenuSetting(data) {
    const savedData = await subMenuModel.create(data);
    if (!savedData) return null;

    return {
      submenu_name: savedData.menu_name,
    };
  }

  async editSubMenuSetting(id, data) {
    const updatedData = await subMenuModel.findOneAndUpdate(
      { _id: id },
      { $set: data },
      { new: true }
    );

    if (!updatedData) return null;

    return updatedData;
  }

  async toggleSubMenuStatus(id, active) {
    const updatedData = await subMenuModel.updateOne(
      { _id: id },
      { $set: { active: !active } }
    );

    if (updatedData.modifiedCount === 0) return null;

    return updatedData;
  }

  async getAllActiveSubMenus({ query, documentskip, documentlimit }) {
    try {
      const totalCount = await subMenuModel.countDocuments(query);
      const data = await subMenuModel
        .find(query)
        .skip(documentskip)
        .limit(documentlimit)
        .select("submenu_name _id active id_project id_menu display_order")
        .populate({
          path: "id_project",
          select: "name",
        })
        .sort({display_order:1})

      if (!data || data.length === 0) return null;

      return { data, totalCount };
    } catch (error) {
      console.error("Error in getAllMetals:", error);
      throw new Error("Database error occurred while fetching all metals.");
    }
  }

  async deleteSubMenu(id) {
    const updatedData = await subMenuModel.findOneAndUpdate(
      { _id: id },
      { $set: { is_deleted: true, active: false } },
      { new: true }
    );

    if (!updatedData) {
      return null;
    }

    return updatedData;
  }

  async getUserPrermission() {
    try {
      const submenuData = await subMenuModel.find({ active: true,adminVisible:false}).sort({display_order:1});

      if (submenuData.length === 0) {
        return null;
      }

      return submenuData;
    } catch (error) {
      console.error(error);
    }
  }
}

export default SubMenuRepository;
