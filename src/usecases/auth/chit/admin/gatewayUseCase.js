class GatewayUseCase {
    constructor(gatewayRepository) { 
        this.gatewayRepository = gatewayRepository;
    }

    async addSmsSetting(data) {
        try {
            const exists = await this.gatewayRepository.exists(data.id_branch, data.id_project, data.id_client);

            if (exists) {
                await this.gatewayRepository.updateOne(exists._id, data);
                return { success: true, message: "Gateway setting updated" };
            }

            const savedSetting = await this.gatewayRepository.addSettings(data);
            
            if (!savedSetting) {
                return { success: false, message: "Failed to add gateway setting" };
            }

            return { success: true, message: "Gateway setting added successfully", data: savedSetting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error while adding gateway settings" };
        }
    }

    async getSettingByBranch(branchId) {
        try {
            const settings = await this.gatewayRepository.getSettingByBranch(branchId);
            if (!settings) {
                return { success: false, message: "No gateway settings found for this branch" };
            }
            return { success: true, data: settings };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching gateway settings by branch" };
        }
    }

    async getByProjectAndBranch(projectId, branchId) {
        try {
            const setting = await this.gatewayRepository.getByProjectAndBranch(projectId, branchId);
            if (!setting) {
                return { success: false, message: "No gateway settings found for this project and branch" };
            }
            return { success: true, data: setting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching gateway settings by project and branch" };
        }
    }
}

export default GatewayUseCase;