class DashboardController {
  constructor(dashboardUseCase) {
    this.dashboardUseCase = dashboardUseCase;
  }

  async getAllOver(req, res) {
    try {
      const result = await this.dashboardUseCase.getAllOver(req.body);

      if (result.success) {
        return res.status(200).json({ message: result.message,data:result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  async accountStat(req, res) {
    try {
      const result = await this.dashboardUseCase.accountStat(req.body);

      if (result.success) {
        return res.status(200).json({ message: result.message,data:result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  
  async account(req, res) {
    try {
      const result = await this.dashboardUseCase.account(req.body);
      if (result.success) {
        return res.status(200).json({ message: result.message,data:result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  async getPaymentHistory(req, res) {
    try {
      const result = await this.dashboardUseCase.getPaymentHistory(req.body);
      if (result.success) {
        return res.status(200).json({ message: result.message,data:result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async paymentModeData(req, res) {
    try {
      const result = await this.dashboardUseCase.paymentModeData(req.body);
      if (result.success) {
        return res.status(200).json({ message: result.message,data:result.data });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}

export default DashboardController;
