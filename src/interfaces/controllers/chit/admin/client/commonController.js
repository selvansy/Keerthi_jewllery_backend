class CommonController {
  constructor(commonUseCase) {
    this.commonUseCase = commonUseCase;
  }

  async getAllWastagetype(req, res) {
    try {
      const wastage = await this.commonUseCase.getWastageData();

      return res
        .status(200)
        .json({ message: "Wastage retrieved successfully", data: wastage });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllmakingcharge(req, res) {
    try {
      const makingcharge = await this.commonUseCase.getAllmakingcharge();

      return res
        .status(200)
        .json({
          message: "makingcharge retrieved successfully",
          data: makingcharge,
        });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async displaytype(req, res) {
    try {
      const result = await this.commonUseCase.getDisplayType();

      return res
        .status(200)
        .json({ message: "display type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllGender(req, res) {
    try {
      const result = await this.commonUseCase.getAllGender();

      return res
        .status(200)
        .json({ message: "Gender retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllShowType(req, res) {
    try {
      const result = await this.commonUseCase.getShowTypes();

      return res
        .status(200)
        .json({ message: "Show type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAlltypeway(req, res) {
    try {
      const result = await this.commonUseCase.getAlltypeway();

      return res
        .status(200)
        .json({ message: "All typeway retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllClassifyType(req, res) {
    try {
      const result = await this.commonUseCase.getAllClassifyType();

      return res
        .status(200)
        .json({ message: "All Classification retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllPrintType(req, res) {
    try {
      const result = await this.commonUseCase.getAllPrintType();

      return res
        .status(200)
        .json({ message: "All print type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async getAllAccountNotype(req, res) {
    try {
      const result = await this.commonUseCase.getAllAccountType();

      return res
        .status(200)
        .json({ message: "All  account type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllClosePrintType(req, res) {
    try {
      const result = await this.commonUseCase.getAllClosedPrint();

      return res
        .status(200)
        .json({ message: "All Closed Print Type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getReferralCalculation(req, res) {
    try {
      const result = await this.commonUseCase.getReferralCal();

      return res
        .status(200)
        .json({ message: "Referral data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getReceiptType(req, res) {
    try {
      const result = await this.commonUseCase.getReceiptType();

      return res
        .status(200)
        .json({ message: "Receipt type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getSmsAccessType(req, res) {
    try {
      const result = await this.commonUseCase.getSmsAccessType();

      return res
        .status(200)
        .json({ message: "Sms access type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getWhatsappType(req, res) {
    try {
      const result = await this.commonUseCase.getWhatsappType();

      return res
        .status(200)
        .json({ message: "Whatsapp type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getPaymentType(req, res) {
    try {
      const result = await this.commonUseCase.getPaymentType();

      return res
        .status(200)
        .json({ message: "Payment type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getFundType(req, res) {
    try {
      const result = await this.commonUseCase.getFundType();

      return res
        .status(200)
        .json({ message: "Fund type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // async getBuyGstType(req, res) {
  //   try {
  //     const result = await this.commonUseCase.getBuyGstType();

  //     return res
  //       .status(200)
  //       .json({ message: "Buy GST type data retrieved successfully", data: result });
  //   } catch (err) {
  //     return res.status(500).json({ message: "Internal server error" });
  //   }
  // }

  async getLayoutType(req, res) {
    try {
      const result = await this.commonUseCase.getLayoutType();

      return res
        .status(200)
        .json({ message: "Layout type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async addedType(req, res) {
    try {
      const result = await this.commonUseCase.addedType();

      return res
        .status(200)
        .json({ message: "Layout type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async giftIssueType(req, res) {
    try {
      const result = await this.commonUseCase.giftIssueType();

      return res
        .status(200)
        .json({ message: "Gift Issuse type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async offersType(req, res) {
    try {
      const result = await this.commonUseCase.offersType();

      return res
        .status(200)
        .json({ message: "Offer type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
 
  async displaySellType(req, res) {
    try {
      const result = await this.commonUseCase.displaySellType();

      return res
        .status(200)
        .json({ message: "Display sell type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async notificationType(req, res) {
    try {
      const result = await this.commonUseCase.notificationType();

      return res
        .status(200)
        .json({ message: "Notifications type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async multiPaymentmode(req, res) {
    try {
      const result = await this.commonUseCase.multiPaymentmode();

      return res
        .status(200)
        .json({ message: "Multi Payment mode type data retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCity(req, res) {
    try {
      const {stateId} = req.params

      if(!stateId){
        return res.status(400).json({message:"No city id provided"})
      }

      const result = await this.commonUseCase.getCity(stateId);

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getStates(req, res) {
    try {
      const {countryId} = req.params

      if(!countryId){
        return res.status(400).json({message:"No state id provided"})
      }

      const result = await this.commonUseCase.getStates(countryId);

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCountries(req, res) {
    try {
      const result = await this.commonUseCase.getCountry();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllMetal(req, res) {
    try {
      const result = await this.commonUseCase.getAllMetal();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllPurity(req, res) {
    try {
      const result = await this.commonUseCase.getAllPurity();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllRelationships(req, res) {
    try {
      const result = await this.commonUseCase.getAllRelationships();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllPaymentMode(req, res) {
    try {
      const result = await this.commonUseCase.getAllPaymentMode();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllPaymentStatus(req, res) {
    try {
      const result = await this.commonUseCase.getAllPaymentStatus();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllSchemeStatus(req, res) {
    try {
      const result = await this.commonUseCase.getAllSchemeStatus();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAllInstallmentType(req, res) {
    try {
      const result = await this.commonUseCase.getAllInstallmentType();

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getPurityByMetal(req, res) {
    try {
      const {metalId}= req.params;
      if(!metalId){
        return res.staus(400).json({message:"No metal id provided"})
      }

      const result = await this.commonUseCase.getPurityByMetal(metalId);

      if(!result.success){
        return res.status(400).json({message:result.message,data:[]})
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getRedeemType(req, res) {
    try {
      const result = await this.commonUseCase.getRedeemType();

      return res
        .status(200)
        .json({ message: "All redeem type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  async getContentType(req, res) {
    try {
      const result = await this.commonUseCase.getContentType();

      return res
        .status(200)
        .json({ message: "All content type retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getFaqCategories(req, res) {
    try {
      const result = await this.commonUseCase.getFaqCategories();

      return res
        .status(200)
        .json({ message: "All faq categories retrieved successfully", data: result });
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }


  //! app version check, add, update api section (do not modify with proper understanding)
  async addAppVersionData(req, res) {
    try {
      if(!req.user){
        return res.status(400).json({message:"Operation not allowed"})
      }

      const result = await this.commonUseCase.addAppVersionData(req.body,req.user);

      if(result.success){
        return res
        .status(200)
        .json({ message:result.message});
      }

      return res.status(400).json({messsage:result.message})
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async checkAppVersion(req, res) {
    try {
      const result = await this.commonUseCase.checkAppVersion();

      if(result.success){
        return res
        .status(200)
        .json({ message:result.message,data:result.data});
      }

      return res.status(400).json({messsage:result.message})
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default CommonController;
