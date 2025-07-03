
class PaymentController { 
    constructor(paymentUseCase, schemeAccountUseCase, validator) {
        this.paymentUseCase = paymentUseCase;
        this.schemeAccountUseCase = schemeAccountUseCase;
        this.validator = validator;
    }

    async addPayment(req, res) {
        try {
            const {payment_amount} = req.body;

            if(!payment_amount){
                return {status:false, message:"Payment amount required"}
            }

            const data = { ...req.body };
            data.created_by = req.user.id_employee;
            const result = await this.paymentUseCase.addPayment(data,req.user)

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({ message: result.message })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async getPaymentById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ status: 'Failed', message: "No object id" })
            }

            const result = await this.paymentUseCase.getPaymentById(id)

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({ message: result.message, data: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async getTodayMetalRate(req, res) {
        try {
            const { date } = req.params;

            if (!date) {
                return res.status(400).json({ message: "No date provided" })
            }
            const result = await this.paymentUseCase.getTodayMetalRate(date)

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({ message: result.message, data: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async paymentTable(req, res) {
        try {
            const result = await this.paymentUseCase.paymentTable(req.body)

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({
                message: result.message, data: result.data,
                totalDocument: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async getPaymentsBySchemeId(req, res) {
        try {
            const { id } = req.params;
            const isMobile = req.query.ismobile
            const {from_date,to_date} = req.query

            if (!id) {
                return res.status(400).json({ status: 'Failed', message: "No object id" })
            }

            const result = await this.paymentUseCase.getPaymentsBySchemeId({id,isMobile,from_date,to_date})

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({ message: result.message, data: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }


    async getPaymentBySchemeAccount(req, res) {
        try {
            let { 
                schAcc, 
                branchId, 
                page,
                limit,
                added_by,
                from_date,
                to_date ,isMobile} = req.query;
            
            if (!schAcc) {
                return res.status(400).json({ status: 'Failed', message: "Scheme Account Number required" })
            }

            if (!branchId) {
                branchId = req.user?.id_branch;
            }

            if (!branchId) {
                return res.status(400).json({ message: "Branch ID is required" });
            }
            // const schId = await this.schemeAccountUseCase.searchPaymentData(branchId, schAcc);
            const result = await this.paymentUseCase.getPaymentsBySchemeId({id:schAcc,page,isMobile, limit, from_date, to_date})

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(200).json({
                message: result.message, data: result.data,
                totalDocument: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async processPayment(req, res) {
        try {
          const {schemes} = req.body;
      
          if (!Array.isArray(schemes) || schemes.length === 0) {
            return res.status(400).json({ status: false, message: "Request body should be a non-empty array of payments." });
          }
      
          const invalids = schemes.map((payment, index) => {
            if (!payment.id_scheme_account) {
              return `Payment at index ${index} is missing 'id_scheme_account'.`;
            }
            if (typeof payment.amount !== 'number' || payment.amount <= 0) {
              return `Payment at index ${index} has invalid or missing 'amount'.`;
            }
            if (payment.convenience_fee != null && typeof payment.convenience_fee !== 'number') {
              return `Payment at index ${index} has an invalid 'convenience_fee'.`;
            }
            return null;
          }).filter(Boolean);
      
          if (invalids.length > 0) {
            return res.status(400).json({ status: false, message: invalids });
          }
      
          const enrichedPayments = schemes.map(payment => ({
            ...payment,
          }));
      
         
          const result = await this.paymentUseCase.processPayment(enrichedPayments, req.user,req.body);
      
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
      
          return res.status(201).json({ message: result.message,data:result.data});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async paymentStatus(req, res) {
        try {
            const { orderid } = req.query;

            if (!orderid) {
                return res.status(400).json({ status: 'Failed', message: "No order id provided" })
            }

            const result = await this.paymentUseCase.paymentStatus(orderid)

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(201).json({ message: result.message, paymentStatus: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async webhook(req, res) {
        try {
            const result = await this.paymentUseCase.webhook(req)

            if (!result) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(200).json({ message: result.message })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }

    async digiGoldPayment(req, res) {
        try {
          const result = await this.paymentUseCase.digiGoldPayment(req.body,req.user)
      
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
      
          return res.status(201).json({ message: result.message,data:result.data});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
      
}

export default PaymentController;