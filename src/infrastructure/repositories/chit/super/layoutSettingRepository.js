import layoutModel from '../../../models/chit/layoutSettingModel.js';

class LayoutRepository {

    async exists(id_branch, id_project, id_client) {
        try {
            return !!(await layoutModel.findOne({ id_branch, id_project, id_client }));
        } catch (error) {
           console.error(error)
            return false;
        }
    }

    async updateOne(id, data) {
        try {
            return await layoutModel.updateOne({ _id: id }, { $set: data });
        } catch (error) {
            console.error("Error updating layout settings:", error);
            return null;
        }
    }

    async updateLayoutColor(branchId,layout_color) {
        try {
            return await layoutModel.updateOne({ id_branch:branchId}, { $set: {layout_color:layout_color}});
        } catch (error) {
            console.error("Error updating layout settings:", error);
            return null;
        }
    }

    async addSettings(data) {
        try {
            const newSetting = new layoutModel(data);
            return await newSetting.save();
        } catch (error) {
            console.error("Error adding layout settings:", error);
            return null;
        }
    }

    async getSettingByBranch(branchId) {
        try {
            return await layoutModel.find({ id_branch: branchId });
        } catch (error) {
            console.error("Error fetching layout settings by branch:", error);
            return null;
        }
    }

    async getByProjectAndBranch(projectId, branchId) {
        try {
            return await layoutModel.findOne({ id_project: projectId, id_branch: branchId });
        } catch (error) {
            console.error("Error fetching layout settings by project and branch:", error);
            return null;
        }
    }
}

export default LayoutRepository;