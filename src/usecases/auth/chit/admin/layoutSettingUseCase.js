class LayoutSettingUseCase {
    constructor(layoutRepository) {
        this.layoutRepository = layoutRepository;
    }

    async addLayoutSetting(data) {
        try {
            const exists = await this.layoutRepository.exists(data.id_branch, data.id_project, data.id_client);

            if (exists) {
                await this.layoutRepository.updateOne(exists._id, data);
                return { success: true, message: "Layout setting updated" };
            }

            const savedSetting = await this.layoutRepository.addSettings(data);
            if (!savedSetting) {
                return { success: false, message: "Failed to add layout setting" };
            }

            return { success: true, message: "Layout setting added successfully", data: savedSetting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error while adding layout settings" };
        }
    }

    async getSettingByBranch(branchId) {
        try {
            const settings = await this.layoutRepository.getSettingByBranch(branchId);
            if (!settings) {
                return { success: false, message: "No layout settings found for this branch" };
            }
            return { success: true, data: settings };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching layout settings by branch" };
        }
    }

    async getByProjectAndBranch(projectId, branchId) {
        try {
            const setting = await this.layoutRepository.getByProjectAndBranch(projectId, branchId);
            if (!setting) {
                return { success: false, message: "No layout settings found for this project and branch" };
            }
            return { success: true, data: setting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching layout settings by project and branch" };
        }
    }

    async updateLayoutColor(data) {
        try {
            const {id_branch,layout_color} =  data
            const savedSetting = await this.layoutRepository.updateLayoutColor(id_branch,layout_color);
            if (!savedSetting) {
                return { success: false, message: "Failed to add layout color" };
            }

            return { success: true, message: "Layout color updated successfully", data: savedSetting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error while updating layout color" };
        }
    }
}

export default LayoutSettingUseCase;