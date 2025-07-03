class WhatsappController {
  constructor(whatsappUseCase) {
    this.whatsappUseCase = whatsappUseCase;
  }

  async addWhatsappSetting(req, res) {
    try {
      const requiredFields = ["id_client", "id_branch", "id_project"];
      for (const field of requiredFields) {
        if (!req.body[field] || req.body[field] === "") {
          return res.status(400).json({
            status: "Failed",
            message: `${field.replace("id_", "")} is required`,
          });
        }
      }

      const data = { ...req.body };
      const result = await this.whatsappUseCase.addWhatsappSetting(data);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByBranchId(req, res) {
    const { branchId } = req.params;
    try {
      if (!branchId) {
        return res.status(400).json({ message: "No valid id provided" });
      }
      const result = await this.whatsappUseCase.getByBranchId(branchId);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getByBranchAndProjectId(req, res) {
    const { projectId,branchId} = req.params;
    try {
      if (!branchId) {
        return res.status(400).json({ message: "No valid branch id provided" });
      }

      if (!projectId) {
        return res.status(400).json({ message: "No valid project id provided" });
      }

      const result = await this.whatsappUseCase.getByBranchAndProjectId(branchId,projectId);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message,data:result.data});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default WhatsappController;