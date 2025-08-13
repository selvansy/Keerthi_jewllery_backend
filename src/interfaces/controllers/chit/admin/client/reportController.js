class ReportController {
  constructor(reportUsecase) {
    this.reportUsecase = reportUsecase;
  }


  async overAllReport(req, res) {
    try {
      const result = await this.reportUsecase.overAllReport(req.body);
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

  // async accountsummary(req, res) {
  //   try {
  //     const reportData = await this.reportUsecase.countSummaryReportController(req.body);
  //     res.status(200).json(reportData);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: "Internal server error" });
  //   }
  // }


  async getPaymentSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getPaymentSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async accountCompleted(req, res) {
    try {
      const reportData = await this.reportUsecase.accountCompleted(req.body);
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

  async getCloseSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getCloseSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getRefendSummary(req, res) {
    try {
      const reportData = await this.reportUsecase.getRefendSummary(req.body);
      res.status(200).json(reportData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getPaymentLedger(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.getPaymentLedger(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async getAmountPayble(req, res) {
    try {
      const body = {...req.body}

      const result = await this.reportUsecase.getAmountPayable(body);
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  async getWeightPayble(req, res) {
    try {
      const body = {...req.body}
      const result = await this.reportUsecase.getWeightPayble(body);
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


  async getEmployeeRefferal(req, res) {
    try {
     
      const result = await this.reportUsecase.getEmployeeRefferal(req.body);

      if(!result){
        return res.status(400).json(result)
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  async getCustomerRefferal(req, res) {
    try {
     
      const result = await this.reportUsecase.getCustomerRefferal(req.body);

      if(!result){
        return res.status(400).json(result)
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getCustomerRefferal(req, res) {
    try {
      const result = await this.reportUsecase.getCustomerRefferal(req.body);

      if(!result.success){
        return res.status(400).json(result)
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  //!drill down controller // indipended api not directly related to report 
  async getSchemeDetailedView(req, res) {
    try {
      const result = await this.reportUsecase.getSchemeDetailedView(req.query);

      if(!result.success){
        return res.status(200).json({message:result.message,data:[]})
      }
      return res.status(200).json({message:result.message,data:result.data,totalPages:result.totalPages,totalCount:result.totalCount,currentPage:result.currentPage})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getAmountDetailedView(req, res) {
    try {
      const result = await this.reportUsecase.getAmountDetailedView(req.body);

      if(!result.success){
        return res.status(200).json({message:result.message,data:[]})
      }
      return res.status(200).json({message:result.message,data:result.data,totalPages:result.totalPages,totalCount:result.totalCount,currentPage:result.currentPage})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getActiveAccounts(req, res) {
    try {
      const result = await this.reportUsecase.getActiveAccounts(req.body);

      if(!result.success){
        return res.status(200).json({message:result.message,data:[]})
      }
      return res.status(200).json({message:result.message,data:result.data,totalPages:result.totalPages,totalCount:result.totalCount,currentPage:result.currentPage})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getRedeemedAccounts(req, res) {
    try {
      const result = await this.reportUsecase.getRedeemedAccounts(req.body);

      if(!result.success){
        return res.status(200).json({message:result.message,data:[]})
      }
      return res.status(200).json({message:result.message,data:result.data,totalPages:result.totalPages,totalCount:result.totalCount,currentPage:result.currentPage})
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

}
export default ReportController;
