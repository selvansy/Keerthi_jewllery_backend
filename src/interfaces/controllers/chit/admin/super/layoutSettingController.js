class LayoutSettingController {
    constructor(layoutSettingUseCase) {
      this.layoutSettingUseCase = layoutSettingUseCase;
    }
  
    async addSetting(req, res) {
      try {
        const requiredFields = ["id_client", "id_branch", "id_project"];
        for (const field of requiredFields) {
          if (!req.body[field] || req.body[field] === "") {
            return res
              .status(400)
              .json({
                status: "Failed",
                message: `${field.replace("id_", "")} is required`,
              });
          }
        }
  
        const response = await this.layoutSettingUseCase.addLayoutSetting(req.body);
  
        return res
          .status(response.success ? 200 : 400)
          .json({ status: response.status, message: response.message });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  
    async getByBranch(req, res) {
      try {
        const { branchId } = req.params;
        const response = await this.layoutSettingUseCase.getSettingByBranch(branchId);
        return res.status(response.success ? 200 : 404).json(response);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  
    async getByProjectAndBranch(req, res) {
      try {
        const { projectId, branchId } = req.params;
        const response = await this.layoutSettingUseCase.getByProjectAndBranch(
          projectId,
          branchId
        );
        return res.status(response.success ? 200 : 404).json(response);
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }

    async updateLayoutColor(req, res) {
      try {
        const {id_branch,layout_color}=  req.body;

        if (!id_branch) {
          return res
            .status(400)
            .json({ success: false, message: "Branch ID is required." });
        }

        if (!layout_color || layout_color.trim().length === 0) {
          return res
            .status(400)
            .json({
              success: false,
              message: "Layout color is required and cannot be empty",
            });
        }
  
        const response = await this.layoutSettingUseCase.updateLayoutColor(req.body);
  
        return res
          .status(response.success ? 200 : 400)
          .json({ status: response.status, message: response.message });
      } catch (error) {
        console.error(error);
        return res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  }
  
  export default LayoutSettingController;