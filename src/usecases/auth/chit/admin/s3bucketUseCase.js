class S3BucketUseCase {
    constructor(s3bucketRepository) {
        this.s3bucketRepository = s3bucketRepository;
    }

    async addSmsSetting(data) {
        try {
            const exists = await this.s3bucketRepository.exists(data.id_branch, data.id_project, data.id_client);

            if (exists) {
                await this.s3bucketRepository.updateOne(exists._id, data);
                return { success: true, message: "S3 bucket setting updated" };
            }

            const savedSetting = await this.s3bucketRepository.addSettings(data);
            if (!savedSetting) {
                return { success: false, message: "Failed to add S3 bucket setting" };
            }

            return { success: true, message: "S3 bucket setting added successfully", data: savedSetting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error while adding S3 bucket settings" };
        }
    }

    async getSettingByBranch(branchId) {
        try {
            const settings = await this.s3bucketRepository.getSettingByBranch(branchId);
            if (!settings) {
                return { success: false, message: "No S3 bucket settings found for this branch" };
            }
            return { success: true, data: settings };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching S3 bucket settings by branch" };
        }
    }

    async getByProjectAndBranch(projectId, branchId) {
        try {
            const setting = await this.s3bucketRepository.getByProjectAndBranch(projectId, branchId);
            if (!setting) {
                return { success: false, message: "No S3 bucket settings found for this project and branch" };
            }
            return { success: true, data: setting };
        } catch (error) {
            console.error(error);
            return { success: false, message: "Error fetching S3 bucket settings by project and branch" };
        }
    }
}

export default S3BucketUseCase;