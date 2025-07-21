class ReportController {
  constructor(reportUsecase) {
    this.reportUsecase = reportUsecase;
  }
 
  async accountsummary(req, res) {
    try {
      const reportData = await this.reportUsecase.countSummaryReportController(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getPaymentSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getPaymentSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getPreCloseSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getPreCloseSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getRedeemptionSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getRedeemptionSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getRefundSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getRefundSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getOutstandingReport(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.getOutstandingReport(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async overAllReport(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.overAllReport(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async overduesummary(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.overduesummary(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getOverAllReport(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.overAllReport(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getPaymentLedger(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.paymentReport(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // async outstandingWeight(req, res) {
  //   try {
  //     const body = {...req.body}
  //     const result = await this.reportUsecase.outstandingWeight(body);
  //     return res.status(200).json(result);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: 'Internal server error' });
  //   }
  // }

  async employeeReferralReport(req, res) {
    try {
      const result = await this.reportUsecase.employeeReferralReport(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async customerReferralReport(req, res) {
    try {
      const result = await this.reportUsecase.customerReferralReport(req.query);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async giftReport(req, res) {
    try {
     
      const result = await this.reportUsecase.giftReport(req.body);
      if(!result.success){
        return res.status(400).json(result)
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

}

export default ReportController;