class SmsSettingUseCase {
    constructor(smssettingRepository) {
        this.smssettingRepository = smssettingRepository;
    }

    async addSmsSetting(data) {
        try {
            const exists = await this.smssettingRepository.exists(data.id_branch, data.id_project, data.id_client);

            if (exists) {
                await this.smssettingRepository.updateOne(exists._id, data);
                return { success: true, message: "Sms setting updated" };
            }

            const savedSetting = await this.smssettingRepository.addSettings(data);
            if (!savedSetting) {
                return { success: false, message: "Failed to add SMS setting" };
            }

            return { success: true, message: "Sms setting added successfully", data: savedSetting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error while adding SMS settings" };
        }
    }

    async getSettingByBranch(branchId) {
        try {
            const settings = await this.smssettingRepository.getSettingByBranch(branchId);
            if (!settings) {
                return { success: false, message: "No SMS settings found for this branch" };
            }
            return { success: true, data: settings };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching SMS settings by branch" };
        }
    }

    async getByProjectAndBranch(projectId, branchId) {
        try {
            const setting = await this.smssettingRepository.getByProjectAndBranch(projectId, branchId);
            if (!setting) {
                return { success: false, message: "No SMS settings found for this project and branch" };
            }
            return { success: true, data: setting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching SMS settings by project and branch" };
        }
    }
}

export default SmsSettingUseCase;