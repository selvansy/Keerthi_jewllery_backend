import menuSettingModel from "../../models/chit/menuSettingModel.js";

class MenuRepository{
    async findByName(name) {
        const menuData = await menuSettingModel.findOne({
            menu_name: { $regex: new RegExp(name, 'i') }});
        if (!menuData) return null;
        return {
            menu_name: menuData.menu_name,
            _id:menuData._id
        };
    }

    async findAll() {
        const menuData = await menuSettingModel.find();
        if (!menuData) return null;
        return menuData
    }

    async findById(id){
        const Data= await menuSettingModel.findById(id);

        if(!Data) return null;

        return Data;
    }

    async addMenuSetting (data){
        const savedData = await menuSettingModel.create(data);
        if (!savedData) return null;

        return {
            menu_name: savedData.menu_name
        };
    }

    async editMenuSetting(id,data){
        const updatedData = await menuSettingModel.findOneAndUpdate(
            { _id: id }, 
            { $set: data },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async toggleMenuStatus(id,active){
        const updatedData = await menuSettingModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:!active} },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async getAllActiveMenuSettings({ query, documentskip, documentlimit }) {
        try {
            const totalCount = await menuSettingModel.countDocuments(query);
            const data = await menuSettingModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .select('menu_name _id menu_icon menu_path component_name active  display_order')
                .populate({
                    path: 'id_project',
                    select:('name _id')
                });

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in getAll menu:", error);
            throw new Error("Database error occurred while fetching all metals.");
        }
    }

    async deleteMenuSetting(id){
        const updatedData = await menuSettingModel.findOneAndUpdate(
            { _id: id }, 
            { $set: {is_deleted: true,active:false} },
            { new: true } 
        );

        if(!updatedData){
            return null
        }

        return updatedData;
    }

    async changeModeActiveStatus(id,active){
        try {
            const updatedData = await menuSettingModel.updateOne(
                {_id:id},
                {$set:{active:!active}},
                {new:true}
            );

            if(updatedData.matchedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }
}

export default MenuRepository;