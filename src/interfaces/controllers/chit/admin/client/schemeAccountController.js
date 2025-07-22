import { token } from "morgan";

class SchemeAccountContorller{ 
    constructor(schemeAccountUseCase,valdator){
        this.schemeAccountUseCase= schemeAccountUseCase;
        this.valdator= valdator;
    }
  
    async addSchemeAccount(req,res){
        try {
            const {
                total_installments,
                id_classification,
                id_scheme,
                id_customer,
                id_branch,
                account_name,
                start_date,
                maturity_period,
                amount
            } = req.body;
    
            const validate = {
                total_installments,
                id_classification,
                id_scheme,
                id_customer,
                id_branch,
                account_name,
            };

            if(start_date){
              validate.start_date = start_date
            }else if(maturity_period){
              validate.maturity_period=maturity_period
            }

            const {error}= this.valdator.schemeAccountValidations.validate(validate);
            if(error){
                return res.status(400).json({message: error.details[0].message})
            }
            
            const data= {... req.body};
            const result= await this.schemeAccountUseCase.addSchemeAccount(data,req.user);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message,id:result.id});
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal sever error"})
        }
    }

    async editSchemeAccount(req,res){
        const { id } = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No id provided"})
            }

            const {
                total_installments,
                id_classification,
                id_scheme,
                id_customer,
                id_branch,
                account_name,
                start_date,
                maturity_period,
            } = req.body;
    
            const validate = {
                total_installments,
                id_classification,
                id_scheme,
                id_customer,
                id_branch,
                account_name,
                start_date,
                maturity_period,
            };
            
            const {error}= this.valdator.schemeAccountValidations.validate(validate);
            if(error){
                return res.status(400).json({message: error.details[0].message})
            }
            
            const data= {... req.body};
            const result= await this.schemeAccountUseCase.editSchemeAccount(id,data,req.user);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(201).json({message:result.message});
        } catch (error) {
            console.error(error)
            return res.status(500).json({message:"Internal sever error"})
        }
    }

    async deleteSchemeAccount(req, res) {
        const { id } = req.params;
        try {
          if(!id){
            return res.status(400).json({message:"Scheme account id is required"})
          }

          const result = await this.schemeAccountUseCase.deleteSchemeAccount(id);
    
          if (result.success) {
            return res.status(200).json({ message: result.message });
          } else if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async activateSchemeAccount(req,res){
        try {
          const {id}= req.params
           if(!id){
            return res.status(400).json({message:"Scheme ID required"})
           }
    
           const result= await this.schemeAccountUseCase.activateSchemeAccount(id);
    
           if(!result.success){
            return res.status(400).json({message:result.message});
           }
    
           res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }

      async getSchemeAccountById(req, res) {
          const { id } = req.params;
        try {
            if(!id){
                return res.status(400).json({message:'No id provided'})
            }
          const result = await this.schemeAccountUseCase.getSchemeAccountById(id);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async getAllSchemeAccounts(req, res) {
      try {
        const result = await this.schemeAccountUseCase.getAllSchemeAccounts();
  
        if (!result.success) {
          return res.status(200).json({ message: result.message ,data:[]});
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }

    async getSchemeAccountTable(req, res) {
        try { 
            const { 
                page = 1, 
                limit = 10, 
              } = req.body;
      
            if (!page || isNaN(page) || parseInt(page) <= 0) {
              return res.status(400).json({ message: "Invalid page number" });
            }
            if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
              return res.status(400).json({ message: "Invalid limit number" });
            }
      
            const result = await this.schemeAccountUseCase.getSchemeAccountTable(req.body);
      
            if (!result || !result.success) {
              return res.status(200).json({ message: result.message,data:[]});
            }
      
            res.status(200).json({
              message: result.message,
              data: result.data,
              totalDocument: result.totalCount,
              totalPages: result.totalPages,
              currentPage: result.currentPage,
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
          }
      }

      async revertSchemeAccount(req, res) {
        const {id} =  req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

          const result = await this.schemeAccountUseCase.revertSchemeAccount(id,req.user);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message});
          }
    
          return res.status(200).json({ message: result.message});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async closeSchemeAccount(req, res) {
        const { 
            status, 
            id_scheme_account, 
            id_branch, 
            return_amount,
            
          } = req.body;
          const {id} =  req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            if (!status) {
                return res.status(400).json({
                  status: 'Failed',
                  message: 'Status Type is required'
                });
              }
              if (!id_branch) {
                return res.status(400).json({
                  status: 'Failed',
                  message: 'Branch is required'
                });
              }

          const data = {...req.body};
          const token = req.user;

          const result = await this.schemeAccountUseCase.closeSchemeAccount(id,data,token);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message});
          }
    
          return res.status(200).json({ message: result.message});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async searchCustomerByMobile(req, res) {
        const {branchId} = req.params;
        const {mobile} = req.query;
        const {state} = req?.query
        try {
          if(!branchId){
            return res.status(400).json({message:'No branch id provided'})
          }
          
          const result = await this.schemeAccountUseCase.searchMobieSchemeAccount(branchId,mobile,state);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res
            .status(200)
            .json({ message: result.message, data: result.data, general:result.general});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async customMobileSearch(req, res) {
        const {id_branch,search_mobile,status} = req.body
        try {
          if(!id_branch){
            return res.status(400).json({message:'No branch id provided'})
          }
          
          const result = await this.schemeAccountUseCase.customMobileSearch(id_branch,search_mobile,status);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res
            .status(200)
            .json({ message: result.message, data: result.data, general:result.general});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async extendInstallment(req, res) {
        const {id} = req.params;
        const { 
          extend_installment
          } = req.body;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            if (!extend_installment || extend_installment === '') {
                return res.status(400).json({
                  status: 'Failed',
                  message: 'Extend installment is reuqired'
                });
              }else if(Number(extend_installment)<1){
              return res.status(400).json({message:"Extend installment should be greater than 1"})
              }
             
          const data = {...req.body};
          const token = req.user;

          const result = await this.schemeAccountUseCase.extendInstallment(id,data,token);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message});
          }
    
          return res.status(200).json({ message: result.message});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async getCustomerAccount(req, res) {
        const {branchId,customerId} = req.params;
        const {skip,limit,ema}= req.query
      try {
          if(!branchId){
              return res.status(400).json({message:'Provide a branch id'})
          }
          if(!customerId){
            return res.status(400).json({message:'Provide a customer id'})
        }

        const result = await this.schemeAccountUseCase.getCustomerAccount(branchId,customerId,skip,limit,ema);
  
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }

    async getPaymentByAccNumber(req, res) {
      const {accId} = req.params;
    try {
        if(!accId){
            return res.status(400).json({message:'Provide scheme account number'})
        }
        
      const result = await this.schemeAccountUseCase.getPaymentByAccNumber(accId);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message, data: result.data,calculations: result.calculation});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }

   async sendOtpForClose(req, res) {
    const {mobile,branchId} = req.params;
    try {
      if(!branchId){
        return res.status(400).json({message:"Provide a branch id"})
      }

      if(!mobile){
        return res.status(400).json({message:"Mobile number is required"})
      }

      const result = await this.schemeAccountUseCase.sendOtpForClose(mobile,branchId,req.user);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyOtp(req, res) {
    try {
      const {mobile,otp} =req.body
      if(!otp){
        return res.status(400).json({message:"Otp number is required"})
      }

      if(!mobile){
        return res.status(400).json({message:"Mobile number is required"})
      }

      const result = await this.schemeAccountUseCase.verifyOtp(mobile,otp);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async findCustomerAccountCounts(req, res) {
    const {mobile,schemeid} = req.query;
    try {
      if(!mobile){
        return res.status(400).json({status:false,message:"Mobile number is required"})
      }

      if(!schemeid){
        return res.status(400).json({status:false,message:"Scheme id is required"})
      }
      const result = await this.schemeAccountUseCase.findCustomerAccountCounts(mobile,schemeid);

      if (!result.success) {
        return res.status(200).json({ status:false,message: result.message ,data:result.data});
      }

      return res
        .status(200)
        .json({ status:true, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getRevertedDetails(req, res) {
    const {cusid,schemenum} = req.query;
  try {
    if(!cusid){
      return res.status(400).json({message:'Customer id is required'})
  }
      if(!schemenum){
          return res.status(400).json({message:'Provide scheme account number'})
      }
      console.log(cusid,schemenum)
    const result = await this.schemeAccountUseCase.getRevertedDetails(cusid,schemenum);

    if (!result.success) {
      return res.status(200).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message, data: result.data});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

async searchAccMobile(req, res) {
  let {branchId,value} = req.query;

  try {
  if (!branchId) {
      branchId = req.user?.branch;
  }

  if (!branchId) {
      return res.status(400).json({ message: "Branch ID is required" });
  }
    const result = await this.schemeAccountUseCase.searchAccMobile(branchId,value);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res
      .status(200)
      .json({ message: result.message, data: result.data, general:result.general,schemeSummary:result.schemeSummary});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async getAllSchemeAccountsForMobile(req, res) {
  try {
    let { customer,weight} = req.query;

    if (!customer) {
      customer = req.user?._id;
    }

    if (!customer) {
      return res.status(400).json({ success: false, message: "Customer ID is required" });
    }

    const data = await this.schemeAccountUseCase.getAllSchemeAccountsForMobile(customer,weight);

    if (!data) {
      return res.status(404).json({ success: false, message: "No scheme accounts found" });
    }

    return res.status(200).json({
      success: true,
      message: "Scheme account data fetched successfully",
      data: data.result,
    });
  } catch (error) {
    console.error("Error in getAllSchemeAccountsForMobile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async getMetalBasedSavings(req, res) {
  try {
    let { customer} = req.query;

    if (!customer) {
      customer = req.user?._id;
    }

    if (!customer) {
      return res.status(400).json({ success: false, message: "Customer ID is required" });
    }

    const data = await this.schemeAccountUseCase.getMetalBasedSavings(customer);

    if (!data) {
      return res.status(404).json({ success: false, message: "No scheme accounts found" });
    }

    return res.status(200).json({
      success: true,
      message: "Scheme account data fetched successfully",
      data: data.result,
    });
  } catch (error) {
    console.error("Error in getAllSchemeAccountsForMobile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

async overdueCalculation(req, res) {
  try {
    const {mobile}= req.query
    const mobileNumber = Number(mobile)
    
    const data = await this.schemeAccountUseCase.overdueCalculation(mobileNumber);

    if (!data) {
      return res.status(404).json({ success: false, message: "No scheme accounts found" });
    }

    return res.status(200).json({
      success: true,
      message: "Scheme account data fetched successfully",
      data: data.result,
    });
  } catch (error) {
    console.error("Error in getAllSchemeAccountsForMobile:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

}

export default SchemeAccountContorller;