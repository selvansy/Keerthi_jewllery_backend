class GatewayController {
    constructor(gatewayUseCase) {
      this.gatewayUseCase = gatewayUseCase;
    }
  
    async addSmsSetting(req, res) {
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
  
        const response = await this.gatewayUseCase.addSmsSetting(req.body);
  
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
        const response = await this.gatewayUseCase.getSettingByBranch(branchId);
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
        const response = await this.gatewayUseCase.getByProjectAndBranch(
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
  }
  
  export default GatewayController;