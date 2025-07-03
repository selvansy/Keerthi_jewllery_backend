

class WalletController {   
    constructor(walletUsecase) {
        this.walletUsecase = walletUsecase;
    }

    async addWalletRate(req, res) {
        try {
            const { rupee_per_points, id_branch } = req.body;

            if (!rupee_per_points || typeof rupee_per_points !== 'number' || rupee_per_points < 0) {
                return res.status(400).json({ success: false, message: "Invalid conversion_rate. It must be a positive number." });
            }

            const data = { ...req.body }
            const result = await this.walletUsecase.addWalletRate(data, req.user);

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            res.status(result.status).json({ success: true, message: result.message, data: result.data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getAllWallets(req, res) {
        try {
            const { page = 1, limit = 10, search = "", from_date, to_date } = req.body;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid page number" });
            }
            if (isNaN(limitNumber) || limitNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid limit number" });
            }

            const result = await this.walletUsecase.getAllWallets(pageNumber, limitNumber, search, from_date, to_date);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }


            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                walletData:result.walletData,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                walletCount:{
                    totalRewardAmt: result.totalRewardAmt,
                    totalRedeemedAmt: result.totalRedeemedAmt,
                    totalBalanceAmt: result.totalBalanceAmt
                }

            });

        } catch (error) {
            console.error("Error fetching redeem data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getRedeem(req, res) {
        try {
            const { page = 1, limit = 10, search = "", from_date, to_date } = req.body;

            if (isNaN(page) || parseInt(page) <= 0) {
                return res.status(400).json({ message: "Invalid page number" });
            }
            if (isNaN(limit) || parseInt(limit) <= 0) {
                return res.status(400).json({ message: "Invalid limit number" });
            }
            
            const result = await this.walletUsecase.getRedeem(page, limit, search, from_date, to_date);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }
         
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data.data,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalRewardAmt: result.totalRewardAmt,
                totalRedeemedAmt: result.totalRedeemedAmt,
                totalBalanceAmt: result.totalBalanceAmt,
                // totalBalancePoint: result.totalBalancePoint,
                // totalRewardPoint: result.totalRewardPoint,
                // totalRedeemedPoint: result.totalRedeemedPoint
            });

        } catch (error) {
            console.error("Error fetching redeem data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }


    async getWalletRate(req, res) {

        try {
            const result = await this.walletUsecase.findLatestActiveWalletRate();

            if (!result.success) {
                return res.status(200).json({ message: result.message, data: null })
            }

            return res.status(200).json({ message: result.message, data: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }

    }

    async getCustomerWalletDetails(req, res) {
        try {
            const { customerId, mobileNumber } = req.query;

            const result = await this.walletUsecase.getCustomerWalletDetails(customerId, mobileNumber); // mobile number

            if (!result.success) {
                return res.status(200).json({ message: result.message, data: null })
            }

            return res.status(200).json({ message: result.message, data: result.data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }

    }

    async activateWalletRate(req, res) {
        try {
            const { id } = req.params;
            const data = await this.walletUsecase.activateWalletRate(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addWallet(req, res) {
        try {
            const { id_customer, id_scheme_account, reward_mode } = req.body;

            if (!id_customer) {
                return res.status(400).json({ message: "Customer id is required" })
            }

            if (!reward_mode || reward_mode === '') {
                return res.status(400).json({ message: "Reward mode is required" })
            }

            if (!id_scheme_account) {
                return res.status(400).json({ message: "Scheme account is needed" })
            }


            const data = { ...req.body }
            const result = await this.walletUsecase.addWallet(data, req.user);

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            res.status(201).json({ success: true, message: result.message });
        } catch (error) {
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async redeemFromWallet(req, res) {
        try {

            const { wallet_id, wallet_type, redeem_amt, bill_no } = req.body;

            if (!wallet_id || wallet_id === '') {
                return res.status(400).json({ message: "Id is required" });
            }

            if (parseFloat(redeem_amt) < 0) {
                return res.status(400).json({ message: "Redeemed amount cannot be negative" });
            }

            if (wallet_type === "Customer" && !bill_no) {
                return res.status(400).json({ message: "Bill number is required" });
            }

            const result = await this.walletUsecase.redeemFromWallet(req.body, req.user);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async addBalanceToWallet(req, res) {
        const { id } = req.params;
        try {
            const { balance_amt, reward_mode } = req.body;

            if (!id || id === '') {
                return res.status(400).json({ message: "Wallet id is required" });
            }

            if (!reward_mode || reward_mode === '') {
                return res.status(400).json({ message: "Reward mode is required" })
            }

            if (balance_amt < 0) {
                return res.status(400).json({ message: "Amount cannot be negative" });
            }

            const result = await this.walletUsecase.addBalanceToWallet(id, req.body, req.user);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }
            res.status(200).json({ success: true, message: result.message });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deletedWallet(req, res) {
        const { id } = req.params;
        try {
            if (!id || id === '') {
                return res.status(400).json({ message: "Wallet " })
            }
            const data = await this.walletUsecase.deletedWallet(id);
            res.status(200).json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async activateWallet(req, res) {
        const { id } = req.params;
        try {
            if (!id || id === '') {
                return res.status(400).json({ message: "Wallet id is required" });
            }

            const result = await this.walletUsecase.activateWallet(id);

            if (!result.success) {
                return res.status(400).json({ message: result.message })
            }

            return res.status(200).json({ message: result.message })
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getWalletDataByMobile(req, res) {
        try {
            const { mobile } = req.query;

            const result = await this.walletUsecase.getWalletDataByMobile(mobile);

            if (!result.success) {
                return res.status(200).json({ message: result.message, data: null })
            }

            return res.status(200).json({
                message: result.message, data: result.data

            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }

    }


    async getRedeemByUser(req, res) {
        try {
            const { page = 1, limit = 10 } = req.body;
            const {mobile} = req.query;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid page number" });
            }
            if (isNaN(limitNumber) || limitNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid limit number" });
            }

            const result = await this.walletUsecase.getRedeemByUser(pageNumber, limitNumber,mobile);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalRewardAmt: result.totalRewardAmt,
                totalRedeemedAmt: result.totalRedeemedAmt,
                totalBalanceAmt: result.totalBalanceAmt,
                
            });

        } catch (error) {
            console.error("Error fetching redeem data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }


    async getRefferalListByUser(req, res) {
        try {
            const { page = 1, limit = 10 } = req.body;
            const {mobile} = req.query;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid page number" });
            }
            if (isNaN(limitNumber) || limitNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid limit number" });
            }

            const result = await this.walletUsecase.getRefferalListByUser(pageNumber, limitNumber,mobile);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                walletData:result.walletData,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });

        } catch (error) {
            console.error("Error fetching refferal data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }


    async getRefferalPayment(req, res) {
        try {
            const { page = 1, limit = 10 } = req.body;
            const {id} = req.params;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid page number" });
            }
            if (isNaN(limitNumber) || limitNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid limit number" });
            }

            const result = await this.walletUsecase.getRefferalPayment(pageNumber, limitNumber,id);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
            });

        } catch (error) {
            console.error("Error fetching refferal data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getWalletHistoryByWalletId(req, res) {
        try {
            const { id,page = 1, limit = 10 } = req.query;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            if (isNaN(pageNumber) || pageNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid page number" });
            }
            if (isNaN(limitNumber) || limitNumber <= 0) {
                return res.status(400).json({ success: false, message: "Invalid limit number" });
            }

            const result = await this.walletUsecase.getWalletHistoryByWalletId(pageNumber, limitNumber,id);

            if (!result.success) {
                return res.status(404).json({ success: false, message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                totalDocuments: result.totalCount,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                totalRewardAmt: result.totalRewardAmt,
                totalRedeemedAmt: result.totalRedeemedAmt,
                totalBalanceAmt: result.totalBalanceAmt,
                
            });

        } catch (error) {
            console.error("Error fetching redeem data:", error);
            return res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getWalletData(req, res) {
        try {
            const { mobile } = req.user;

            // if(!customer){
            //     return res.status(400).json({message:"Provide a valid customer id"})
            // }

            const result = await this.walletUsecase.getWalletData(mobile);

            if (!result.success) {
                return res.status(200).json({ message: result.message, data: null })
            }

            return res.status(200).json({
                message: result.message, data: result.data

            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" })
        }
    }


}

export default WalletController;
