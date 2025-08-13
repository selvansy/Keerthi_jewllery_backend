import { isValidObjectId } from "mongoose";
import moment from "moment";
import smsService from "../../../../config/chit/smsService.js";
import config from "../../../../config/chit/env.js";
import axios from "axios";
import calculateDigiGoldBonus from "../../../../services/digigoldCalculation.js";
import crypto, { randomInt } from "crypto";
import schemeAccountModel from "../../../../infrastructure/models/chit/schemeAccountModel.js";
import isNotificationEnabled from "../../../../utils/notificationEnableChecket.js";
import SaveNotificationUsecase from "./saveNotificationUsecase.js";
import SaveNotificationRepo from "../../../../infrastructure/repositories/chit/saveNotificationRepo.js";

class PaymentUseCase {
  constructor(
    paymentRepository,
    metalRateRepository,
    schemeRepository,
    generalSettingRepository,
    schemeAccountRepository,
    customerRewardRepository,
    transactionDetailsRepository,
    transactionRepository,
    smsRepo,
    topupRepo,
    paymentOrderRepo,
    customerRepo,
    paymenModeRepo,
    employeeRepo,
    walletRepo,
    notificationconfig
  ) {
    this.paymentRepository = paymentRepository;
    this.metalRateRepository = metalRateRepository;
    this.schemeRepository = schemeRepository;
    this.generalSettingRepository = generalSettingRepository;
    this.schemeAccountRepository = schemeAccountRepository;
    this.customerRewardRepository = customerRewardRepository;
    this.transactionDetailsRepository = transactionDetailsRepository;
    this.transactionRepository = transactionRepository;
    this.smsRepo = smsRepo;
    this.topupRepo = topupRepo;
    this.paymentOrderRepo = paymentOrderRepo;
    this.customerRepo = customerRepo;
    this.paymenModeRepo = paymenModeRepo;
    this.employeeRepo = employeeRepo;
    this.walletRepo = walletRepo;
    this.notificationconfig = notificationconfig;
    this.saveNotificationRepo = new SaveNotificationRepo()
    this.saveNotificationUsecase = new SaveNotificationUsecase(this.saveNotificationRepo);
    this.baseUrl = config.CASH_FREE_URL || "https://sandbox.cashfree.com";
    this.url = `${this.baseUrl}/pg/orders`;
  }


  getDifferenceInMonths = (startDate, endDate) => {
    return moment(endDate).diff(moment(startDate), "months");
  };

  calculateBonus(schemeType, paymentDate, totalAmount) {
    const dayDifference = moment().diff(paymentDate, "days");
    if (schemeType === 4) {
      if (dayDifference > 225) return totalAmount * 0.01;
      if (dayDifference > 150) return totalAmount * 0.02;
      if (dayDifference > 75) return totalAmount * 0.03;
      return totalAmount * 0.05;
    }
    return 0;
  }

  async generateOtp() {
    const otp = crypto.randomInt(1000, 10000).toString();
    return otp;
  }

  async sendPaymentNotifications(
    data,
    token,
    message,
    notificationData,
    updatedSchemeData
  ) {
    if (updatedSchemeData.status == 2) {
      message = "Scheme account completed, notifications delivered to customer";

      if (notificationData.push) {
        const inputMsg = {
          recipients: [data.id_customer || token._id],
          title: "Scheme Completed",
          message: `Your scheme has been completed with final payment of ₹${data.payment_amount}.`,
          channel: "push",
        };

        await smsService.sendNotification(inputMsg);
        await  this.saveNotificationUsecase.saveNotification(
          {
            title: inputMsg.title,
            message: inputMsg.message,
            type: "alert",
            category: "Payment",
          },
          token._id || data.id_customer
        );
      }

      // if (
      //   notificationData.whatsapp.enabled &&
      //   notificationData.whatsapp.topupCount > 0
      // ) {
      //   const whatsappInfo = await this.smsRepo.findOne({ active: true });
      //   if (whatsappInfo) {
      //     const whatsappData = {
      //       numbers: [data.mobile],
      //       message: whatsappInfo.schemeCompleteWhatsapp,
      //       templateParams: { paymentAmount: data.payment_amount },
      //       channel: "whatsapp",
      //       customUrl: whatsappInfo.payment_url,
      //     };

      //     const whatsappOutput = await smsService.sendNotification(
      //       whatsappData
      //     );
      //     if (whatsappOutput) {
      //       await this.topupRepo.decrementField({}, "WhatsApp", 1);
      //     }
      //   }
      // }

      // if (notificationData.sms.enabled && notificationData.sms.topupCount > 0) {
      //   const smsInfo = await this.smsRepo.findOne({ active: true });
      //   if (smsInfo) {
      //     const smsData = {
      //       numbers: [data.mobile],
      //       message: smsInfo.schemeComplete,
      //       templateParams: { paymentAmount: data.payment_amount },
      //       sms_type: "",
      //       channel: "sms",
      //       delayBetweenSMS: 1000,
      //       customUrl: smsInfo.payment_url,
      //     };

      //     const smsSendStatus = await smsService.sendNotification(smsData);
      //     if (smsSendStatus) {
      //       await this.topupRepo.decrementField({}, "SMS", 1);
      //     }
      //   }
      // }
    } else {
      if (notificationData.push) {
        const inputMsg = {
          recipients: [data.id_customer || token._id],
          title: "Payment Received",
          message: `Your payment of ₹${data.payment_amount} was successfully received.`,
          channel: "push",
        };
        await smsService.sendNotification(inputMsg);
        await this.saveNotificationUsecase.saveNotification(
          {
            title: inputMsg.title,
            message: inputMsg.message,
            type: "alert",
            category: "Payment",
          },
          data.id_customer
        );
      }

      // if (
      //   notificationData.whatsapp.enabled &&
      //   notificationData.whatsapp.topupCount > 0
      // ) {
      //   const whatsappInfo = await this.smsRepo.findOne({ active: true });
      //   if (whatsappInfo) {
      //     const whatsappData = {
      //       numbers: [data.mobile],
      //       message: whatsappInfo.whatsappPayment,
      //       templateParams: { paymentAmount: data.payment_amount },
      //       channel: "whatsapp",
      //       customUrl: whatsappInfo.payment_url,
      //     };

      //     const whatsappOutput = await smsService.sendNotification(
      //       whatsappData
      //     );
      //     if (whatsappOutput) {
      //       await this.topupRepo.decrementField({}, "WhatsApp", 1);
      //     }
      //   }
      // }

      // if (notificationData.sms.enabled && notificationData.sms.topupCount > 0) {
      //   const smsInfo = await this.smsRepo.findOne({ active: true });
      //   if (smsInfo) {
      //     const smsData = {
      //       numbers: [data.mobile],
      //       message: smsInfo.payment_content,
      //       templateParams: { paymentAmount: data.payment_amount },
      //       sms_type: "",
      //       channel: "sms",
      //       delayBetweenSMS: 1000,
      //       customUrl: smsInfo.payment_url,
      //     };

      //     const smsSendStatus = await smsService.sendNotification(smsData);
      //     if (smsSendStatus) {
      //       await this.topupRepo.decrementField({}, "SMS", 1);
      //       message = "Payment added successfully, SMS delivered to customer";
      //     }
      //   }
      // } 
      else if (notificationData.sms.enabled) {
        message = "Payment added successfully. Topup to send SMS to customers";
      }
    }
  }

  paymentcalculation = async (id_scheme_account) => {
    try {
      const query = [
        {
          $match: {
            id_scheme_account: id_scheme_account,
            active: true,
            payment_status: 1,
          },
        },
        {
          $group: {
            _id: null,
            total_installments: { $sum: "$paid_installments" },
            total_paidamount: { $sum: "$total_amt" },
            fine_amount: { $sum: "$fine_amount" },
            gst_amount: { $sum: "$gst_amount" },
            cash_amount: { $sum: "$cash_amount" },
            card_amount: { $sum: "$card_amount" },
            gpay_amount: { $sum: "$gpay_amount" },
            debitcard_amount: { $sum: "$debitcard_amount" },
            phonepay_amount: { $sum: "$phonepay_amount" },
            total_weight: { $sum: { $toDouble: "$metal_weight" } },
          },
        },
        {
          $lookup: {
            from: "giftissues",
            localField: "_id",
            foreignField: "id_scheme_account",
            as: "gift_issues",
          },
        },
        {
          $addFields: {
            total_gifts_issued: { $size: "$gift_issues" },
          },
        },
        {
          $project: {
            _id: 0,
            total_installments: 1,
            total_paidamount: 1,
            total_weight: 1,
            fine_amount: 1,
            gst_amount: 1,
            cash_amount: 1,
            card_amount: 1,
            gpay_amount: 1,
            debitcard_amount: 1,
            phonepay_amount: 1,
            total_gifts_issued: 1,
          },
        },
      ];

      const result = await this.paymentRepository.aggregate(query);

      if (result.length > 0) {
        return {
          total_installments: result[0].total_installments || 0,
          total_paidamount: result[0].total_paidamount || 0,
          total_weight: result[0].total_weight || 0,
          fine_amount: result[0].fine_amount || 0,
          gst_amount: result[0].gst_amount || 0,
          cash_amount: result[0].cash_amount || 0,
          card_amount: result[0].card_amount || 0,
          gpay_amount: result[0].gpay_amount || 0,
          debitcard_amount: result[0].debitcard_amount || 0,
          phonepay_amount: result[0].phonepay_amount || 0,
          total_gifts_issued: result[0].total_gifts_issued || 0,
        };
      } else {
        return {
          total_installments: 0,
          total_paidamount: 0,
          total_weight: 0,
          fine_amount: 0,
          gst_amount: 0,
          cash_amount: 0,
          card_amount: 0,
          gpay_amount: 0,
          debitcard_amount: 0,
          phonepay_amount: 0,
          total_gifts_issued: 0,
        };
      }
    } catch (error) {
      console.error("Error in payment calculation:", error);
      return {
        total_installments: 0,
        total_paidamount: 0,
        total_weight: 0,
        fine_amount: 0,
        gst_amount: 0,
        cash_amount: 0,
        card_amount: 0,
        gpay_amount: 0,
        debitcard_amount: 0,
        phonepay_amount: 0,
        total_gifts_issued: 0,
      };
    }
  };

  async updatePaymentReceipt(generalSetting, scheme, recieptNumber, schemeId) {
    try {
      const lastPayment = await this.paymentRepository.lastPayment(schemeId);

      return lastPayment ?  lastPayment.payment_receipt + 1 : 1

    } catch (error) {
      console.error("Error updating payment receipt:", error.message);
      throw error;
    }
  }

  toDateOnlyString(date) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }

  async addPayment(data, token) {
    try {
      const schemeData = await this.schemeRepository.findById(data.id_scheme);

      if (schemeData.scheme_type !== 10 && schemeData.scheme_type !== 14) {
        if (!schemeData)
          return { success: false, message: "No related scheme found" };

        const lastPaidData = await this.paymentRepository.findPaymentData(
          data.id_scheme_account
        );

        const todayDate = new Date();

        if (lastPaidData) {
          const lastPaid = new Date(lastPaidData.createdAt);

          const todatPaidorNot =
            this.toDateOnlyString(todayDate) ===
            this.toDateOnlyString(lastPaid);

          if (todatPaidorNot) {
            return {
              status: false,
              message: "Already completed today's payment",
            };
          }
        }

        const totalInstallments =
          await this.paymentRepository.totalInstallments(
            data.id_scheme_account 
          );

        if (
          Number(totalInstallments) + Number(data.installments) >
          Number(schemeData.total_installments)
        ) {
          return { status: false, message: "Scheme installment limit reached" };
        }

        const monthlyPaiments = await this.paymentRepository.getMonthlyPayments(
          {
            id: data.id_scheme_account,
            date: todayDate,
          }
        );

        if (
          schemeData?.limit_installment &&
          Number(monthlyPaiments) + Number(data.installments) >
            Number(schemeData?.limit_installment)
        ) {
          return { status: false, message: "Monthly payment limit reached" };
        }

        const schemeAccData = await this.schemeAccountRepository.findById(
          data.id_scheme_account
        );

        const paymentMode = await this.paymenModeRepo.findById(
          data.payment_mode
        );

        let diffMonth = 0;
        if (lastPaidData) {
          const currentDate = moment();
          const lastDate = moment(lastPaidData.date_payment);
          diffMonth = this.getDifferenceInMonths(lastDate, currentDate);
        }

        if (schemeData.limit_notpaid > 0 && diffMonth > 5) {
          return {
            success: false,
            message:
              "Scheme Account has not paid continuously for 6 months, go to preclose only",
          };
        }

        const raw = `${data.id_customer}${Date.now()}`;
        const transactionId = crypto
          .createHash("sha256")
          .update(raw)
          .digest("hex")
          .slice(0, 15);

        const generalSettings = await this.generalSettingRepository.findOne(
          data.id_branch
        );

        if (!generalSettings) {
          return {
            success: false,
            message: "No general settings found for this branch",
          };
        }

        const paymentReceipt = await this.updatePaymentReceipt(
          generalSettings,
          schemeData,
          data.payment_receipt,
          data.id_scheme
        );

        let metalWeight = 0;
        if (!data?.metal_weight) {
          metalWeight = (data?.payment_amount / data?.metal_rate).toFixed(3);
        } else {
          metalWeight = data?.metal_weight;
        }
        const totalAmount =
          (Number(lastPaidData?.total_amt) || 0) + Number(data.payment_amount);
        const dataToSave = {
          ...data,
          id_employee: data.created_by,
          id_transaction: transactionId,
          payment_receipt: paymentReceipt,
          date_add: new Date(),
          payment_status: data.payment_status || 1,
          payment_type: data.payment_type || 1,
          paid_installments: data.installments || 1,
          cash_amount: data.cash_amount || 0,
          card_amount: data.card_amount || 0,
          gpay_amount: data.gpay_amount || 0,
          itr_utr: data.itr_utr || null,
          total_amt: totalAmount,
          paymentModeName: paymentMode.mode_name,
          metal_weight: metalWeight,
          installment:Number(schemeAccData.paid_installments) + Number(data.installments)
        };

        const savedPayment = await this.paymentRepository.addPayment(
          dataToSave
        );

        if (!savedPayment)
          return { success: false, message: "Failed to save payment" };

        const paymentCount = await this.paymentRepository.countDocuments(
          data.id_scheme_account
        );

        let paymentCountCalc = 1;
        if (!paymentCount) {
          paymentCountCalc = Number(schemeAccData.paymentcount) + 1;
        }

        const lastPaidDate = moment(data.date_payment).format("YYYY-MM-DD");

        const newTotalInstallmentcount =
          Number(schemeAccData.paid_installments) + Number(data.installments);
        const updatedSchemeData = {
          schemeAccountId: data.id_scheme_account,
          paymentcount: paymentCountCalc,
          last_paid_date: lastPaidDate,
          paid_installments: newTotalInstallmentcount || 1,
        };

        await this.schemeAccountRepository.updateAmountOrWeight(
          data?.id_scheme_account,
          data?.payment_amount || 0,
          metalWeight,
          // data?.metal_weight || 0,
          new Date()
        );

        if (
          Number(totalInstallments) + Number(data.installments) ==
          Number(schemeData.total_installments)
        ) {
          updatedSchemeData.status = 2;
          updatedSchemeData.completedDate = new Date();
        }

        const paymentCountIncrement =
          await this.schemeAccountRepository.updatePaymentCount(
            updatedSchemeData
          );

        const schemeCustomer = await this.customerRepo.findById(
          paymentCountIncrement.id_customer
        );

        if (paymentCountIncrement && schemeAccData.referral_id !== null) {
          if (
            schemeCustomer.referral_id !== null &&
            schemeData.referralPercentage !== null
          ) {
            const referral = {
              id_scheme_account: data?.id_scheme_account,
              reference_no: schemeCustomer.referral_code,
              reward_mode: 1,
              created_by: token.id_employee,
              modified_by: token.id_employee,
            };

            let walletOwner = null;

            if (schemeCustomer?.referral_type === "Customer") {
              referral.id_customer = schemeCustomer?.referral_id;
              referral.referred_by = "Customer";
              walletOwner = await this.customerRepo.findById(
                schemeCustomer?.referral_id
              );
            } else {
              referral.id_employee = schemeCustomer?.referral_id;
              referral.referred_by = "Employee";
              walletOwner = await this.employeeRepo.findById(
                schemeCustomer?.referral_id
              );
            }

            const mobile = walletOwner?.mobile;
            let wallet = await this.walletRepo.findWallet({ mobile: mobile });
            let creditedAmount = 0;
            const walletData = {};

            if (schemeCustomer?.referral_type === "Customer") {
              const paymentAmount = Number(data?.payment_amount) || 0;
              const referralPercentage =
                Number(schemeData?.referralPercentage) || 0;

              creditedAmount = (paymentAmount * referralPercentage) / 100;
              walletData.id_customer = walletOwner?._id;
            } else {
              creditedAmount =
                (Number(data.payment_amount) *
                  Number(walletOwner?.employeeIncentivePercentage)) /
                100;
              walletData.id_employee = walletOwner?._id;
            }

            if (creditedAmount !== 0 && creditedAmount !== "NaN") {
              referral.credited_amount = creditedAmount;

              if (!wallet) {
                walletData.mobile = mobile;
                walletData.balance_amt = creditedAmount;
                walletData.total_reward_amt = creditedAmount;
                walletData.created_by = token.id_employee;
                wallet = await this.walletRepo.addWallet(walletData);
              } else {
                await this.walletRepo.creditAmount(wallet.id, creditedAmount);
              }
              await this.paymentRepository.addReferralPoint(referral);
            }
          }
        }

        const transactionDetails = {
          transactionid: transactionId,
          id_customer: data.id_customer,
          id_branch: data.id_branch,
          total_account: 1,
          payment_type: 1,
          platform: 0,
          total_amount: data.total_amt,
          trans_date: new Date(),
          payment_mode: data.payment_mode,
          mobile: data.mobile || "",
          payment_status: 1,
        };

        const saveTransactionDetails =
          await this.transactionDetailsRepository.addTransactionDetails(
            transactionDetails
          );

        if (saveTransactionDetails) {
          const subtransaction = {
            transdetailid: saveTransactionDetails._id,
            transactionid: transactionId,
            id_customer: data.id_customer,
            id_branch: data.id_customer,
            payment_date: new Date(),
            id_scheme_account: data.id_scheme_account,
            id_scheme: data.id_scheme,
            payment_amount: data.payment_amount,
            paid_installments: data.installments,
            scheme_total: data.total_amt,
            metal_rate: data?.metal_rate,
            payment_mode: data.payment_mode,
            payment_type: 1,
            platform: 0,
            metal_weight: data.metal_weight !== "" ? data.metal_weight : null,
          };

          const savedTransaction =
            await this.transactionRepository.addTransaction(subtransaction);

          const notificationData = await isNotificationEnabled(
            "paymentProceed"
          );

          if (savedTransaction && notificationData) {
            let message = "Payment added successfully";
            const messageOut = await this.sendPaymentNotifications(
              data,
              token,
              message,
              notificationData,
              updatedSchemeData
            );

            return {
              success: true,
              message: messageOut ? messageOut : message,
            };
          } else {
            return {
              success: false,
              message:
                "There was a problem creating the transaction. Please try again.",
            };
          }
        }
      } else {
        const digiCalc = await this.digigoldCalculation(
          schemeData,
          data,
          token
        );

        if (digiCalc.success) {
          return { success: true, message: digiCalc.message };
        } else {
          return { success: false, message: digiCalc.message };
        }
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      return { success: false, message: "Failed to add payment" };
    }
  }

  async digigoldCalculation(scheme, data, token) {
    try {
      if (!scheme)
        return { success: false, message: "No related scheme found" };

      const todayDate = new Date();

      const lastPaidData = await this.paymentRepository.findPaymentData(
        data.id_scheme_account
      );

      const totalInstallments = await this.paymentRepository.totalInstallments(
        data.id_scheme_account
      );

      // if (Number(totalInstallments) + Number(data.installments) > Number(scheme.total_installments)) {
      //   return { success: false, message: "Scheme installment limit reached" };
      // }

      const monthlyPayments = await this.paymentRepository.getMonthlyPayments({
        id: data.id_scheme_account,
        date: todayDate,
      });

      // if (
      //   scheme.limit_installment &&
      //   Number(monthlyPayments) + Number(data.installments) > Number(scheme.limit_installment)
      // ) {
      //   return { success: false, message: "Monthly payment limit reached" };
      // }

      const schemeAccData = await this.schemeAccountRepository.findById(
        data.id_scheme_account
      );

      if (
        Number(schemeAccData?.amount) + Number(data?.payment_amount) >
          Number(scheme.maxLimit) &&
        scheme.maxLimit > 0
      ) {
        return { success: false, message: "Scheme payment limit reached" };
      }

      const paymentMode = await this.paymenModeRepo.findById(data.payment_mode);

      let diffMonth = 0;
      if (lastPaidData) {
        const currentDate = moment();
        const lastDate = moment(lastPaidData.date_payment);
        diffMonth = this.getDifferenceInMonths(lastDate, currentDate);
      }

      // if (scheme.limit_notpaid > 0 && diffMonth > 5) {
      //   return {
      //     success: false,
      //     message: "Scheme Account has not paid for over 6 months, move to preclose",
      //   };
      // }

      const args = {
        scheme,
        paymentDate: todayDate,
        paymentAmount: data.payment_amount,
        installmentNumber: Number(schemeAccData.paid_installments) + 1,
        schemeJoinDate: schemeAccData.start_date,
      };

      const digidata = calculateDigiGoldBonus(args);

      const transactionId = crypto
        .createHash("sha256")
        .update(`${data.id_customer}${Date.now()}`)
        .digest("hex")
        .slice(0, 15);

      const generalSettings = await this.generalSettingRepository.findOne(
        data.id_branch
      );
      if (!generalSettings)
        return {
          success: false,
          message: "No general settings found for this branch",
        };

      const paymentReceipt = await this.updatePaymentReceipt(
        generalSettings,
        scheme,
        data.payment_receipt,
        data.id_scheme
      );

      const totalAmount =
        (Number(lastPaidData?.total_amt) || 0) + Number(data.payment_amount);

      const dataToSave = {
        ...data,
        id_employee: data?.created_by,
        id_transaction: transactionId,
        payment_receipt: paymentReceipt,
        date_add: todayDate,
        payment_status: data.payment_status || 1,
        payment_type: data.payment_type || 1,
        paid_installments: data.installments || 1,
        cash_amount: data.cash_amount || 0,
        card_amount: data.card_amount || 0,
        gpay_amount: data.gpay_amount || 0,
        itr_utr: data.itr_utr || null,
        total_amt: totalAmount,
        paymentModeName: paymentMode.mode_name,
        digiBonus: digidata.appliedBonusPercent,
        metal_weight: Number(digidata?.finalAmount) / Number(data?.metal_rate),
      };

      const savedPayment = await this.paymentRepository.addPayment(dataToSave);
      if (!savedPayment)
        return { success: false, message: "Failed to save payment" };

      const paymentCount = await this.paymentRepository.countDocuments(
        data.id_scheme_account
      );

      const paymentCountCalc = paymentCount
        ? 1
        : Number(schemeAccData.paymentcount) + 1;

      const lastPaidDate = moment(data.date_payment).format("YYYY-MM-DD");
      const newTotalInstallments =
        Number(schemeAccData.paid_installments) + Number(data.installments);

      const updatedSchemeData = {
        schemeAccountId: data.id_scheme_account,
        paymentcount: paymentCountCalc,
        last_paid_date: lastPaidDate,
        paid_installments: newTotalInstallments || 1,
      };

      let metalWeight = 0;
      if (!data.metal_weight || data.metal_weight == "") {
        metalWeight = Number(data?.payment_amount) / Number(data?.metal_rate);
      }

      await this.schemeAccountRepository.updateAmountOrWeight(
        data?.id_scheme_account,
        data?.payment_amount || 0,
        data?.metal_weight || metalWeight || 0,
        new Date()
      );

      if (
        Number(totalInstallments) + Number(data.installments) ===
        Number(scheme.total_installments)
      ) {
        updatedSchemeData.status = 2;
        updatedSchemeData.completedDate = new Date();
      }

      const paymentCountIncrement =
        await this.schemeAccountRepository.updatePaymentCount(
          updatedSchemeData
        );

      // Referral Logic
      if (paymentCountIncrement?.referral_id) {
        const referral = {
          id_scheme_account: data.id_scheme_account,
          reference_no: paymentCountIncrement.referral_code,
          reward_mode: 1,
          created_by: token.id_employee,
          modified_by: token.id_employee,
        };

        let walletOwner = null;
        let creditedAmount = 0;
        const walletData = {};

        if (paymentCountIncrement.referral_type === "Customer") {
          referral.id_customer = paymentCountIncrement.referral_id;
          referral.referred_by = "Customer";
          walletOwner = await this.customerRepo.findById(
            paymentCountIncrement.referral_id
          );
          creditedAmount =
            (Number(data.payment_amount) * Number(scheme.referralPercentage)) /
            100;
          walletData.id_customer = walletOwner._id;
        } else {
          referral.id_employee = paymentCountIncrement.referral_id;
          referral.referred_by = "Employee";
          walletOwner = await this.employeeRepo.findById(
            paymentCountIncrement.referral_id
          );
          creditedAmount =
            (Number(data.payment_amount) *
              Number(walletOwner.employeeIncentivePercentage)) /
            100;
          walletData.id_employee = walletOwner._id;
        }

        if (creditedAmount > 0) {
          referral.credited_amount = creditedAmount;

          const wallet = await this.walletRepo.findWallet({
            mobile: walletOwner.mobile,
          });
          if (!wallet) {
            Object.assign(walletData, {
              mobile: walletOwner.mobile,
              balance_amt: creditedAmount,
              total_reward_amt: creditedAmount,
              created_by: token.id_employee,
            });
            await this.walletRepo.addWallet(walletData);
          } else {
            await this.walletRepo.creditAmount(wallet.id, creditedAmount);
          }

          await this.paymentRepository.addReferralPoint(referral);
        }
      }

      // Transaction Details
      const transactionDetails = {
        transactionid: transactionId,
        id_customer: data.id_customer,
        id_branch: data.id_branch,
        total_account: 1,
        payment_type: 1,
        platform: 0,
        total_amount: data.total_amt,
        trans_date: new Date(),
        payment_mode: data.payment_mode,
        mobile: data.mobile || "",
        payment_status: 1,
      };

      const saveTransactionDetails =
        await this.transactionDetailsRepository.addTransactionDetails(
          transactionDetails
        );
      if (!saveTransactionDetails) {
        return { success: false, message: "Transaction saving failed." };
      }

      const subtransaction = {
        transdetailid: saveTransactionDetails._id,
        transactionid: transactionId,
        id_customer: data.id_customer,
        id_branch: data.id_branch,
        payment_date: todayDate,
        id_scheme_account: data.id_scheme_account,
        id_scheme: data.id_scheme,
        payment_amount: data.payment_amount,
        paid_installments: data.installments,
        scheme_total: data.total_amt,
        metal_rate: data.metal_rate,
        payment_mode: data.payment_mode,
        payment_type: 1,
        platform: 0,
      };

      const savedTransaction = await this.transactionRepository.addTransaction(
        subtransaction
      );
      if (!savedTransaction) {
        return { success: false, message: "Failed to save sub-transaction" };
      }

      // Notification
      const notificationConfig = await this.notificationconfig.getConfig();
      const isSmsEnabled =
        notificationConfig?.sms?.enabled &&
        notificationConfig?.sms?.settings?.schemeWise?.paymentProceed;

      if (isSmsEnabled) {
        const smsLimit = await this.topupRepo.getTopupByClientId(
          token.id_client
        );
        if (smsLimit?.SMS > 0) {
          const smsInfo = await this.smsRepo.findOne({
            id_client: token.id_client,
            sms_access: 1,
            payment_sent: 1,
          });

          if (smsInfo) {
            const smsData = {
              channel: "sms",
              numbers: [data.mobile],
              message: smsInfo.payment_content,
              templateParams: { paymentAmount: data.payment_amount },
              type: "sms",
              delayBetweenSMS: 1000,
              customUrl: smsInfo.payment_url,
            };
            let smsSendStatus = true;

            // const smsSendStatus = await smsService.sendNotification(smsData);
            const msg =
              updatedSchemeData.status === 2
                ? "Scheme account completed, SMS delivered to customer"
                : "Payment added successfully, SMS delivered to customer";

            if (smsSendStatus) return { success: true, message: msg };
          }
        }
        return {
          success: true,
          message: "Payment added successfully. Topup SMS to notify customer.",
        };
      }

      return { success: true, message: "Payment added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to add payment" };
    }
  }

  async getPaymentById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const paymentData = await this.paymentRepository.findById(id);

      if (!paymentData) {
        return { success: false, message: "No payment data found" };
      }

      const extraData = await this.paymentcalculation(
        paymentData.id_scheme_account._id
      );

      paymentData.total_installments = extraData.total_installments;
      paymentData.total_paidamount = extraData.total_paidamount;
      paymentData.total_weight = extraData.total_weight;
      paymentData.total_gifts_issued = extraData.total_gifts_issued;

      return {
        success: true,
        message: "Payment data fetched successfully",
        data: paymentData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async getTodayMetalRate(date) {
    try {
      const metalRate = await this.metalRateRepository.getTodayMetalRate(date);

      if (!metalRate) {
        return { success: false, message: "No payment data found" };
      }

      return {
        success: true,
        message: "Payment data fetched successfully",
        data: metalRate,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async paymentTable(data) {
    try {
      const {
        page = 1,
        limit = 10,
        added_by,
        from_date,
        to_date,
        id_branch,
        id_scheme,
        id_classification,
        collectionuserid,
        search,
      } = data;

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const query = { is_deleted: { $ne: true } };

      if (from_date && to_date) {
        query.start_date = {
          $gte: from_date,
          $lte: to_date,
        };
      }

      if (added_by) {
        query.added_by = parseInt(added_by);
      }
      if (isValidObjectId(id_branch)) {
        query.id_branch = id_branch;
      }
      if (id_scheme) {
        query.id_scheme = id_scheme;
      }
      if (id_classification) {
        query["id_scheme_account.id_classification"] = id_classification;
      }
      if (collectionuserid) {
        query.id_employee = collectionuserid;
      }

      if (search) {
        const searchRegex = new RegExp(search, "i");
        query.$or = [
          { account_name: { $regex: searchRegex } },
          { scheme_acc_number: { $regex: searchRegex } },
          { "id_customer.firstname": { $regex: searchRegex } },
          { "id_customer.lastname": { $regex: searchRegex } },
          { "id_customer.mobile": { $regex: searchRegex } },
          { "id_scheme.scheme_type.scheme_typename": { $regex: searchRegex } },
        ];
      }

      const paymentData = await this.paymentRepository.paymentTable(
        query,
        documentskip,
        documentlimit
      );

      if (!paymentData) {
        return { success: false, message: "No payment data found" };
      }

      return {
        success: true,
        message: "Payment data fetched successfully",
        data: paymentData.documents,
        totalCount: paymentData.totalCount,
        totalPages: Math.ceil(paymentData.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async getPaymentsBySchemeId({
    id,
    isMobile = false,
    page = 1,
    limit = 10,
    from_date,
    to_date,
  }) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const query = { id_scheme_account: id, active: true, payment_status: 1 };

      // if (from_date && to_date) {
      //   query.start_date = {
      //     $gte: from_date,
      //     $lte: to_date,
      //   };
      // }

      const paymentData = await this.paymentRepository.getPaymentsBySchemeId(
        query,
        documentskip,
        documentlimit,
        isMobile
      );

      if (!paymentData) {
        return { success: false, message: "No payment data found" };
      }

      return {
        success: true,
        message: "Payment data fetched successfully",
        data: paymentData.documents,
        totalCount: paymentData.totalCount,
        totalPages: Math.ceil(paymentData.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async processPayment(paymentArray, token = null, extraData = null) {
    try {
      if (!Array.isArray(paymentArray) || paymentArray.length === 0) {
        return {
          success: false,
          message: "Payments should be a non-empty array",
        };
      }

      const userData = await this.customerRepo.findOne({
        mobile: token.mobile,
      });

      if (!userData) {
        return { status: false, message: "No user found", state: false };
      }

      const raw = `${token._id}${Date.now()}`;
      const transactionId = crypto
        .createHash("sha256")
        .update(raw)
        .digest("hex")
        .slice(0, 15);

      const todayDate = new Date();
      let totalAmount = 0;
      let schemeAccountsProcessed = [];
      let paymentIds = [];

      const generalSettings = await this.generalSettingRepository.find();
      if (!generalSettings) {
        return {
          success: false,
          message: "No general settings found for this branch",
        };
      }

      for (const data of paymentArray) {
        const schemeAccData = await this.schemeAccountRepository.findById(
          data.id_scheme_account
        );
        const schemeData = await this.schemeRepository.findById(
          schemeAccData.id_scheme
        );
        if (!schemeData)
          return { success: false, message: "No related scheme found" };

        const lastPaidData = await this.paymentRepository.findPaymentData(
          data.id_scheme_account
        );

        const lastPaid = lastPaidData ? new Date(lastPaidData.createdAt) : null;

        if(extraData?.digigold !== true){
          if (
            lastPaid &&
            this.toDateOnlyString(lastPaid) === this.toDateOnlyString(todayDate)
          ) {
            const schemeLength = paymentArray.length
           
            let message =""
            if(schemeLength == 1){
              message = "Aleady completed today's payment"
            }else{
              message = "Already completed today's payment for one of the schemes"
            }

            return {
              success: false,
              message:message,
            };
          }
        }

        const totalInstallments =
          await this.paymentRepository.totalInstallments(
            data.id_scheme_account
          );
          
        if (
          Number(totalInstallments) + Number(data.installments) >
          Number(schemeData.total_installments) &&  extraData?.digigold !== true
        ) {
          return {
            success: false,
            message: "Scheme installment limit reached",
          };
        }

        const monthlyPayments = await this.paymentRepository.getMonthlyPayments(
          { id: data.id_scheme_account, date: todayDate }
        );

        if (
          Number(monthlyPayments) + Number(data.installments) >
          Number(schemeData.limit_installment) &&  extraData?.digigold !== true
        ) {
          return { success: false, message: "Monthly payment limit reached" };
        }

        let diffMonth = 0;
        if (lastPaidData) {
          const currentDate = moment();
          const lastDate = moment(lastPaidData.date_payment);
          diffMonth = this.getDifferenceInMonths(lastDate, currentDate);
        }

        if (schemeData.limit_notpaid > 0 && diffMonth > 5 &&  extraData?.digigold !== true) {
          return {
            success: false,
            message:
              "Scheme Account has not paid continuously for 6 months, go to preclose only",
          };
        }
      }

      const transactionDetails = {
        transactionid: transactionId,
        id_customer: token?._id,
        id_branch: token.id_branch,
        total_account: paymentArray.length,
        payment_type: 2,
        platform: extraData.platform,
        total_amount: extraData.grandTotal,
        trans_date: new Date(),
        mobile: token.mobile || "",
        payment_status: 1,
      };

      const saveTransactionDetails =
        await this.transactionDetailsRepository.addTransactionDetails(
          transactionDetails
        );

      if (!saveTransactionDetails) {
        return {
          success: false,
          message: "Failed to save transaction details",
        };
      }

      for (const data of paymentArray) {
        const schemeAccData = await this.schemeAccountRepository.findById(
          data.id_scheme_account
        );
        const schemeData = await this.schemeRepository.findById(
          schemeAccData.id_scheme
        );

        const lastPaidData = await this.paymentRepository.findPaymentData(
          data.id_scheme_account
        );

        const paymentReceipt = await this.updatePaymentReceipt(
          generalSettings,
          schemeData,
          data.payment_receipt,
          data.id_scheme
        );
        const runningTotalAmount =
          (Number(lastPaidData?.total_amt) || 0) + Number(data.amount);

        const paymentData = {
          ...data,
          id_transaction: transactionId,
          payment_receipt: paymentReceipt,
          date_add: new Date(),
          date_payment: new Date(),
          payment_status: 2,
          payment_type: 2,
          paid_installments: data.installments || 1,
          cash_amount: data.cash_amount || 0,
          card_amount: data.card_amount || 0,
          gpay_amount: data.gpay_amount || 0,
          itr_utr: data.itr_utr || null,
          total_amt: runningTotalAmount,
          id_branch: token.id_branch,
          id_customer: token._id,
          id_scheme: schemeAccData.id_scheme,
          payment_amount: data.amount,
          metal_weight: data.weight || 0,
          installment: Number(schemeAccData.paid_installments) + 1
        };


        const savedPayment = await this.paymentRepository.addPayment(
          paymentData
        );
        if (!savedPayment)
          return { success: false, message: "Failed to save payment" };

        paymentIds.push(savedPayment.id_scheme_account);

        const subtransaction = {
          transdetailid: saveTransactionDetails._id,
          transactionid: transactionId,
          id_customer: token.id_customer || schemeAccData.id_customer || "",
          id_branch: schemeAccData.id_branch || token.id_branch,
          payment_date: new Date(),
          id_scheme_account: data.id_scheme_account,
          id_scheme: schemeAccData.id_scheme,
          payment_amount: data.amount,
          paid_installments: data?.installments || 1,
          scheme_total: data.amount,
          metal_rate: data?.metal_rate,
          // payment_mode: data.payment_mode,
          payment_type: 2,
          platform: 0,
          metal_weight: data?.weight || null,
          payment_status: 2,
        };

        await this.transactionRepository.addTransaction(subtransaction);
        totalAmount += data.payment_amount;
        schemeAccountsProcessed.push(data);

        // Update scheme account data
        // const paymentCount = await this.paymentRepository.countDocuments(data.id_scheme_account);
        // const lastPaidDate = moment(new Date()).format("YYYY-MM-DD");

        // const newTotalInstallmentcount = Number(schemeAccData.paid_installments) + Number(data.installments);
        // const updatedSchemeData = {
        //   schemeAccountId: data.id_scheme_account,
        //   paymentcount: paymentCount,
        //   last_paid_date: lastPaidDate,
        //   paid_installments: newTotalInstallmentcount,
        // };

        // const totalInstallments = await this.paymentRepository.totalInstallments(data.id_scheme_account);
        // if (Number(totalInstallments) + Number(data.installments) === Number(schemeData.total_installments)) {
        //   updatedSchemeData.status = 2;
        //   updatedSchemeData.completedDate = new Date();
        // }

        // await this.schemeAccountRepository.updatePaymentCount(updatedSchemeData);
      }

      function sanitizeAmount(value) {
        if (typeof value !== 'number') {
          value = Number(value);
        }
      
        return +value.toFixed(2);
      }

      const totalData = sanitizeAmount(extraData.grandTotal)
      const orderData = {
        order_id: transactionId,
        order_amount: totalData,
        order_currency: "INR",
        customer_details: {
          customer_id: token._id,
          customer_name: `${token.firstname} ${token.lastname}`,
          customer_email: "john.doe@example.com",
          customer_phone: token.mobile.toString(),
        },
        order_meta: {
          return_url: "https://example.com/return",
        },
        // order_tags: {
        //   paid_weight: extraData.paidWeight,
        // },
      };

      // if(extraData.digigold){
      //   orderData.order_tags.digigold = true
      // }

      if (extraData.schemeType) {
        orderData.order_note = "digi";
      }

      const createdOrder = await this.createOrder(orderData);

      const paymentOrderDetails = {
        orderId: transactionId,
        payment_amount: extraData?.grandTotal,
        total_schemes: schemeAccountsProcessed?.length,
        created_by: token?.id_employee,
        date_add: new Date(),
        id_customer: token?._id,
        scheme_payment_ids: paymentIds,
        cf_order_id: createdOrder?.cf_order_id,
        payment_session_id: createdOrder?.payment_session_id,
      };

      await this.paymentOrderRepo.addPaymentOrder(paymentOrderDetails);

      const data = {
        session: createdOrder?.payment_session_id,
        orderId: transactionId,
      };

      return {
        success: true,
        message: "Payment proceeded successfully",
        data,
        // session: createdOrder.payment_session_id,
        // transactionDetails: saveTransactionDetails,
      };
    } catch (error) {
      console.error("Error in multi-scheme payment:", error);
      return {
        success: false,
        message: "Something went wrong while processing payment",
      };
    }
  }

  async paymentStatus(orderid) {
    try {
      const orderData = await this.paymentOrderRepo.findOne({
        orderId: orderid,
      });

      if (!orderData) {
        return { success: false, message: "No order records found" };
      }

      const paymetStatus = await this.getOrderStatus(orderid);

      let status = false;

      if (paymetStatus?.order_status === "PAID") {
        status = true;
      }

      if (paymetStatus)
        return {
          success: true,
          message: "Payment data fetched successfully",
          data: status,
        };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  async webhook(data) {
    try {
      const secretKey = config.CASHFREE_SECRET;

      if (!secretKey) {
        console.error("SECRET_KEY is missing in environment variables.");
        return { status: false, message: "Secret key is not configured" };
      }

      const signature = data.headers["x-webhook-signature"];
      const payload = data.rawBody;
      const body = data.headers["x-webhook-timestamp"] + payload;

      if (!payload) {
        console.error("Raw payload is undefined");
        return { message: "Invalid payload" };
      }

      const generatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(body)
        .digest("base64");

      if (signature !== generatedSignature) {
        console.error("Invalid Signature: Possible spoofing attempt.");
        return { status: false, message: "Payment verification failed" };
      }

      await this.completePayment(data.body);

      return { status: true, message: "Webhook received successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting payment" };
    }
  }

  digigoldandsilverMaturity(startDateStr, noOfDays) {
    const startDate = new Date(startDateStr);
    const maturityDate = new Date(startDate);
    maturityDate.setDate(maturityDate.getDate() + noOfDays);
    return maturityDate.toISOString().split("T")[0];
  }

  async digiGoldPayment(data, token) {
    try {
      const customerId = token?._id;
      const {
        idScheme,
        idClassification,
        convenienceFee,
        amount,
        weight,
        metal_rate,
        grandTotal,
        platform,
        schemeType,
      } = data;
      console.log(data)

      const schemeAccount = await this.schemeAccountRepository.findOne({
        id_customer: customerId,
        id_scheme: idScheme,
        id_classification: idClassification,
        status:0
      });

      const schemeData = await this.schemeRepository.findById(data.idScheme);

      let newSchemeAcc = "";
      let customerData;
      if (!schemeAccount) {
        customerData = await this.customerRepo.findOne({ _id: customerId });
        const accountData = {
          active: false,
          id_customer: customerId,
          id_scheme: idScheme,
          id_classification: idClassification,
          id_branch: token.id_branch,
          account_name: customerData.firstname,
          added_by: data.platform == "android" ? 1 : 2,
        };

        if (!data.start_date) {
          accountData.start_date = new Date();
          accountData.maturity_date = this.digigoldandsilverMaturity(
            new Date(),
            schemeData.noOfDays
          );
        }

        newSchemeAcc = await this.schemeAccountRepository.addSchemeAccount(
          accountData
        );
      } else {
        const updateDate = {
          start_date: new Date(),
        };

        updateDate.maturity_date = this.digigoldandsilverMaturity(
          new Date(),
          schemeData.noOfDays
        );

        await this.schemeAccountRepository.updateOne(
          schemeAccount._id,
          updateDate
        );
      }

      const schemeInfo = await this.schemeAccountRepository.findInfo(
        newSchemeAcc._id
      );
      const schemeCode = schemeData.code;

      let schemeAccNumber;
      let isUnique = false;

      while (!isUnique) {
        const randomDigits = randomInt(1000, 9999);
        schemeAccNumber = `Digi${randomDigits}`;

        const existingAccount = await this.schemeAccountRepository.findOne({
          scheme_acc_number: schemeAccNumber,
        });

        if (!existingAccount) {
          isUnique = true;
        }
      }

      await this.schemeAccountRepository.updateSchemNumber(newSchemeAcc._id, {
        scheme_acc_number: schemeAccNumber,
      });
     
      const metalWeightSaved= Number(amount)/Number(metal_rate)

      const paymentData = {
        schemes: [
          {
            id_scheme_account: newSchemeAcc._id || schemeAccount._id,
            amount: amount,
            convenience_fee: convenienceFee,
            weight: Number(metalWeightSaved.toFixed(3)),
            metal_rate: metal_rate,
          },
        ],
        grandTotal: grandTotal,
        totalConvenience: convenienceFee,
        platform: platform,
        digigold: true,
      };

      const processData = [
        {
          id_scheme_account: newSchemeAcc._id || schemeAccount._id,
          amount: amount,
          convenience_fee: convenienceFee,
          weight: Number(metalWeightSaved.toFixed(3)),
          metal_rate: metal_rate,
        },
      ];

      const processedData = await this.processPayment(
        processData,
        token,
        paymentData
      );

      let message =
        schemeType == 10
          ? "Digigold payment proceeded successfully"
          : "Digisilver payment proceeded successfully";

      if (processedData) {
        return processedData;
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while initiating payment" };
    }
  }

  //!helper function for mobile
  async createOrder(data) {
    try {
      console.log(this.url)
      const url = `${this.url}`;
      const headers = {
        "Content-Type": "application/json",
        "x-client-id": config.CASHFREE_CLIENT_ID,
        "x-client-secret": config.CASHFREE_SECRET,
        "x-api-version": config.API_VERSION,
      };
      const response = await axios.post(url, data, { headers });
      
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getOrderStatus(orderid) {
    try {
      const url = `${this.url}/${orderid}`;
      const headers = {
        "Content-Type": "application/json",
        "x-client-id": config.CASHFREE_CLIENT_ID,
        "x-client-secret": config.CASHFREE_SECRET,
        "x-api-version": config.API_VERSION,
      };

      const response = await axios.get(url, { headers });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async terminateOrder(orderid) {
    try {
      const url = `${this.url}/${orderid}`;
      const headers = {
        "Content-Type": "application/json",
        "x-client-id": config.CASHFREE_CLIENT_ID,
        "x-client-secret": config.CASHFREE_SECRET,
        "x-api-version": config.API_VERSION,
      };

      const data = {
        order_status: "TERMINATED",
      };

      const response = await axios.patch(url, data, { headers });

      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

 formatPaymentGroup(paymentGroup) {
    if (!paymentGroup) return '';
    const formatted = paymentGroup
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  
    return `${formatted}-cashfree`;
  }

  
  async completePayment(data) {
    try {
      const orderId = data?.data?.order?.order_id;
      const cfPaymentId = data?.data?.payment?.cf_payment_id;
      const customerId = data?.data?.customer_details?.customer_id;

      if (data?.data?.payment?.payment_status !== "SUCCESS") {
        return;
      }

      const updatedPaymentOrder = await this.paymentOrderRepo.findAndUpdate(
        { orderId, status: { $ne: 1 } },
        { cf_payment_id: cfPaymentId, status: 1 },
        { returnDocument: "after" }
      );

      if (!updatedPaymentOrder) {
        return;
      }

      const schemeAccounts = updatedPaymentOrder.scheme_payment_ids || [];
      const uniqueAccountIds = [...new Set(schemeAccounts.map(id => id.toString()))];

      // Get all required data in parallel
      const [schemeAccountDetails, payments, customer] = await Promise.all([
        Promise.all(uniqueAccountIds.map(accountId => 
          this.schemeAccountRepository.findById(accountId)
        )),
        this.paymentRepository.findNew({
          id_transaction: updatedPaymentOrder.orderId,
          id_scheme_account: { $in: uniqueAccountIds },
          payment_status: { $ne: 1 }
        }),
        this.customerRepo.findById(customerId)
      ]);

      if (!customer) {
        console.error('Customer not found');
        return;
      }

      const paymentMode = this.formatPaymentGroup(data?.data?.payment?.payment_group);

      const schemeBulk = [];
      const paymentBulk = [];

      for (const accountId of uniqueAccountIds) {
        const accountDetails = schemeAccountDetails.find(a => a?._id.toString() === accountId);
        if (!accountDetails) continue;

        const paymentData = payments.find(p => p.id_scheme_account.toString() === accountId);
        if (!paymentData) continue;

        // Calculate totals for this account
        const totals = {
          amount: paymentData.payment_amount || 0,
          weight: paymentData.metal_weight || 0
        };

        // Prepare scheme account update
        const isFinalInstallment = (accountDetails.paid_installments + 1) === accountDetails.total_installments;
        const update = {
          $set: { last_paid_date: new Date(),active:true},
          $inc: {
            paid_installments: 1,
            paymentcount: 1,
            amount: totals.amount,
            weight: totals.weight,
          }
        };

        if (isFinalInstallment) {
          update.$set.status = 2;
        }

        schemeBulk.push({
          updateOne: {
            filter: { _id: accountId },
            update: update
          }
        });

        // Prepare payment update
        paymentBulk.push({
          updateOne: {
            filter: {
              id_scheme_account: accountId,
              id_transaction: updatedPaymentOrder.orderId,
              payment_status: { $ne: 1 }
            },
            update: {
              $set: { 
                payment_status: 1, 
                updatedAt: new Date(),
                payment_mode:"67682cf7666e32053d05e051",
                paymentModeName: paymentMode 
              },
            },
          },
        });
      }

      // Execute bulk operations
      await Promise.all([
        this.schemeAccountRepository.bulkWrite(schemeBulk),
        this.paymentRepository.bulkWrite(paymentBulk),
      ]);

      if (customer?.referral_id) {
        const referralScheme = schemeAccountDetails.find(a =>
          a?.id_scheme?.referralPercentage !== null &&
          a?.referral_id?.toString() === customer.referral_id.toString()
        );
      
        if (!referralScheme) return;
      
        const paymentData = payments.find(p =>
          p.id_scheme_account.toString() === referralScheme._id.toString()
        );
      
        if (!paymentData) return;
      
        const referral = {
          id_scheme_account: referralScheme._id,
          reference_no: customer.referral_code, 
          reward_mode: 1,
          created_by: data?.token?.id_employee || null,
          modified_by: data?.token?.id_employee || null,
        };
      
        // Get the referrer details based on referral_id
        let referrer = null;
        if (customer.referral_type === "Customer") {
          referral.id_customer = customer.referral_id;
          referral.referred_by = "Customer";
          referrer = await this.customerRepo.findById(customer.referral_id);
        } else if (customer.referral_type === "Employee") {
          referral.id_employee = customer.referral_id;
          referral.referred_by = "Employee";
          referrer = await this.employeeRepo.findById(customer.referral_id);
        }
      
        if (!referrer) {
          console.error('Referrer not found');
          return;
        }
      
        const mobile = referrer.mobile;
        let wallet = await this.walletRepo.findWallet({ mobile });
        const paymentAmount = Number(paymentData.payment_amount) || 0;
        const referralPercentage = Number(referralScheme?.id_scheme?.referralPercentage) || 0;
        const creditedAmount = (paymentAmount * referralPercentage) / 100;
      
        if (creditedAmount > 0 && !isNaN(creditedAmount)) {
          referral.credited_amount = creditedAmount;
      
          if (!wallet) {
            const walletData = {
              mobile,
              balance_amt: creditedAmount,
              total_reward_amt: creditedAmount,
              created_by: data?.token?.id_employee || null,
              ...(customer.referral_type === "Customer" 
                ? { id_customer: referrer._id } 
                : { id_employee: referrer._id })
            };
      
            await this.walletRepo.addWallet(walletData);
          } else {
            await this.walletRepo.creditAmount(wallet.id, creditedAmount);
          }
      
          await this.paymentRepository.addReferralPoint(referral);
        }
      }      
    } catch (error) {
      console.error("Error in completePayment:", error);
      throw error;
    }
  }
}

export default PaymentUseCase;
