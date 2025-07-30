import mongoose, { isValidObjectId, mongo } from "mongoose";
import crypto, { randomInt } from "crypto";
import CustomerRepository from "../../../../infrastructure/repositories/chit/CustomerRepository.js";
import smsService from "../../../../config/chit/smsService.js";
import WalletRepository from "../../../../infrastructure/repositories/chit/walletRepository.js";
import isNotificationEnabled from "../../../../utils/notificationEnableChecket.js";
import SaveNotificationUsecase from "./saveNotificationUsecase.js";
import SaveNotificationRepo from "../../../../infrastructure/repositories/chit/saveNotificationRepo.js";
import EmployeeRepository from "../../../../infrastructure/repositories/chit/EmployeeRepository.js";


const customerRepo = new CustomerRepository();
class SchemeAccountUseCase {
  constructor(
    schemeAccountRepository,
    employeeRepository,
    schemeRespo,
    closeAccRepo,
    customerRepo,
    schemetypeRepo,
    metalRepo,
    paymentRepo,
    giftIssueRepo,
    purityRepo,
    smsRepo,
    generalsettingRepo,
    otpRepo,
    smsSender,
    topupRepo,
    saveNotificationRepo = new SaveNotificationRepo(),
    saveNotificationUsecase = new SaveNotificationUsecase(saveNotificationRepo)
  ) {
    this.schemeAccountRepository = schemeAccountRepository;
    this.employeeRepository = employeeRepository || null;
    this.schemeRespo = schemeRespo || null;
    this.closeAccRepo = closeAccRepo || null;
    this.customerRepo = customerRepo;
    this.schemetypeRepo = schemetypeRepo;
    this.metalRepo = metalRepo;
    this.paymentRepo = paymentRepo;
    this.giftIssueRepo = giftIssueRepo;
    this.purityRepo = purityRepo;
    this.smsRepo = smsRepo;
    this.generalsettingRepo = generalsettingRepo;
    this.otpRepo = otpRepo;
    this.smsSender = smsSender;
    this.topupRepo = topupRepo;
    this.saveNotificationUsecase= saveNotificationUsecase;
  }

  async sendAccountCreationNotifications(data, schemeData, savedData, notificationData,referralNotification) {
    const schemeInfo = await this.schemeAccountRepository.findInfo(savedData._id);
    
    if (notificationData.push) {
      const input = {
        recipients: [data.id_customer],
        title: "Scheme Account Created",
        message: `Congratulations! Your ${schemeInfo.id_scheme.scheme_name} Scheme Account has been successfully created at KEERTHI JWELLERS.`,
        channel: "push",
      }
      await smsService.sendNotification(input);
      
      await this.saveNotificationUsecase.saveNotification({
        title: input.title,
        message: input.message,
        type:"alert",
        category:'Scheme account'
      },data.id_customer)
    }
  
    // if (notificationData.whatsapp.enabled && notificationData.whatsapp.topupCount > 0) {
    //   const whatsappInfo = await this.smsRepo.findOne({ active: true });
    //   if (whatsappInfo) {
    //     const whatsappData = {
    //       numbers: [data.mobile],
    //       message: whatsappInfo.whatsappPayment,
    //       templateParams: { paymentAmount: data.payment_amount },
    //       channel: "whatsapp",
    //       customUrl: whatsappInfo.payment_url,
    //     };
    //     const whatsappOutput = await smsService.sendNotification(whatsappData);
    //     if (whatsappOutput) {
    //       await this.topupRepo.decrementField({}, "WhatsApp", -1);
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
    //     }
    //   }
    // }

    if(data.referral_id && referralNotification){
      if (notificationData.push) {
        const input= {
          recipients: [data.referral_id],
          title: "Scheme Account Created",
          message: `Thank you for referring ${data?.customer_name} to KEERTHI JEWELERS! Your referral has successfully created a ${schemeInfo.id_scheme.scheme_name} Scheme Account.`,
          channel: "push",
        }
        await smsService.sendNotification(input);
        await this.saveNotificationUsecase.saveNotification({
          title: input.title,
          message: input.message,
          type:"alert",
          category:'Referral'
        },data.referral_id)
      }
    }

    // if (notificationData.whatsapp.enabled && notificationData.whatsapp.topupCount > 0) {
    //   const whatsappInfo = await this.smsRepo.findOne({ active: true });
    //   if (whatsappInfo) {
    //     const whatsappData = {
    //       numbers: [data.mobile],
    //       message: whatsappInfo.whatsappPayment,
    //       templateParams: { paymentAmount: data.payment_amount },
    //       channel: "whatsapp",
    //       customUrl: whatsappInfo.payment_url,
    //     };
    //     const whatsappOutput = await smsService.sendNotification(whatsappData);
    //     if (whatsappOutput) {
    //       await this.topupRepo.decrementField({}, "WhatsApp", -1);
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
    //     }
    //   }
    // }
  }

  async generateOtp() {
    const otp = crypto.randomInt(1000, 10000).toString();
    return otp;
  }

  getallpayment = async (id_scheme_account) => {
    const payment = await this.paymentRepo.find(id_scheme_account);
    return payment;
  };

  getcloseaccount = async (id_scheme_account) => {
    const latestCloseBill = await this.closeAccRepo.getCloseaccount(
      id_scheme_account
    );
    let arraydata = {};
    if (latestCloseBill) {
      arraydata.bill_no = latestCloseBill.bill_no;
      arraydata.bill_date = latestCloseBill.bill_date;
    } else {
      arraydata.bill_no = "";
      arraydata.bill_date = "";
    }
    return arraydata;
  };

  async urlConstructor(url, text, replacements) {
    try {
      const content = text.replace(
        /xxxschemenamexxx/g,
        replacements.schemename
      );

      const constructedUrl = url
        .replace(/xxxmobilexxx/g, replacements.mobile)
        .replace(/xxxmessagexxx/g, content);

      return constructedUrl;
    } catch (error) {
      console.error("Error constructing URL:", error);
      throw error;
    }
  }

  convertNumberToWord(number) {
    const decimal = Math.round((number - Math.floor(number)) * 100);
    let no = Math.floor(number);
    let str = [];
    const words = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const digits = ["", "Hundred", "Thousand", "Lakh", "Crore"];
    let i = 0;

    while (i < no.toString().length) {
      let divider = i === 2 ? 10 : 100;
      let numberPart = Math.floor(no % divider);
      no = Math.floor(no / divider);
      i += divider === 10 ? 1 : 2;

      if (numberPart) {
        let plural = str.length > 0 && numberPart > 9 ? "s" : "";
        let hundred = str.length === 1 && str[0] ? " and " : "";
        str.push(
          numberPart < 21
            ? words[numberPart] + " " + digits[str.length] + plural + hundred
            : words[Math.floor(numberPart / 10) * 10] +
                " " +
                words[numberPart % 10] +
                " " +
                digits[str.length] +
                plural +
                hundred
        );
      } else {
        str.push(null);
      }
    }

    let rupees = str.reverse().join("");

    let paise =
      decimal > 0
        ? "." +
          words[Math.floor(decimal / 10)] +
          " " +
          words[decimal % 10] +
          " Paise"
        : "";

    return (rupees ? rupees + "Rupees " : "") + paise;
  }

  getpurity = async (id_purity) => {
    return await this.purityRepo.findById(id_purity);
  };

  getStatusName = (status) => {
    if (status == 0) {
      return "Open";
    } else if (status == 1) {
      return "Closed";
    } else if (status == 2) {
      return "Completed";
    } else if (status == 3) {
      return "Preclose";
    } else if (status == 4) {
      return "Refund";
    } 
    // else if (status == 5) {
    //   return "Partially Preclose";
    // } else {
    //   return "Unknown";
    // }
  };

  addedby = (type) => {
    if (type == 3) {
      return "Admin";
    } else if (type == 1) {
      return "Android";
    } else if (type == 2) {
      return "IOS";
    } else {
      return "Web";
    }
  };

  getschemetype = async (scheme_type) => {
    const schemeType = await this.schemetypeRepo.findOne({
      scheme_type: scheme_type,
    });
    return schemeType;
  };

  getmetal = async (id_metal) => {
    const metal = await this.metalRepo.findById(id_metal);
    return metal;
  };

  lastpaymentlist = async (id_scheme_account) => {
    try {
      const result = await this.paymentRepo.findOne({
        id_scheme_account: id_scheme_account,
        active: true,
      });
      if (result) {
        return {
          last_paid_date: result.date_payment,
          last_paid_installment: result.paid_installments,
          last_paid_amount: result.payment_amount,
          last_paid_weight: result.metal_weight,
        };
      } else {
        return {
          last_paid_date: "",
          last_paid_installment: 0,
          last_paid_amount: 0,
          last_paid_weight: 0,
        };
      }
    } catch (error) {
      console.error("Error in payment calculation:", error);
      return {
        last_paid_date: "",
        last_paid_installment: 0,
        last_paid_amount: 0,
        last_paid_weight: 0,
      };
    }
  };

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
            total_paidamount: { $sum: "$payment_amount" },
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
      ];

      const result = await this.paymentRepo.aggregate(query);

      if (result.length > 0) {
        return {
          total_installments: result[0].total_installments,
          total_paidamount: result[0].total_paidamount,
          total_weight: result[0].total_weight,
        };
      } else {
        return {
          total_installments: 0,
          total_paidamount: 0,
          total_weight: 0,
        };
      }
    } catch (error) {
      console.error("Error in payment calculation:", error);
      return {
        total_installments: 0,
        total_paidamount: 0,
        total_weight: 0,
      };
    }
  };

  giftcalculation = async (id_scheme_account) => {
    try {
      let query = [
        {
          $match: {
            "gifts.id_scheme_account": id_scheme_account,
            active: true,
          },
        },
        {
          $unwind: "$gifts",
        },
        {
          $match: { "gifts.id_scheme_account": id_scheme_account },
        },
        {
          $group: {
            _id: null,
            received_gift: { $sum: "$gifts.qty" },
            excess_amount: { $sum: "$gifts.excess_amount" },
            gift_amount: { $sum: "$gifts.divsion" },
          },
        },
      ];

      const result = await this.giftIssueRepo.aggregate(query);

      if (result.length > 0) {
        return {
          received_gift: result[0].received_gift,
          excess_amount: result[0].excess_amount,
          gift_amount: result[0].gift_amount || 0,
        };
      } else {
        return {
          received_gift: 0,
          excess_amount: 0,
          gift_amount: 0,
        };
      }
    } catch (error) {
      console.error("Error in gift calculation:", error);
      return {
        received_gift: 0,
        excess_amount: 0,
        gift_amount: 0,
      };
    }
  };

   calculateMaturityDate(startDate, maturityPeriod, installmentType) {
    let date = new Date(startDate);

    switch (installmentType) {
      case 3:
        date.setDate(date.getDate() + maturityPeriod);
        break;
      case 2:
        date.setDate(date.getDate() + maturityPeriod * 7);
        break;
      case 1:
        date.setMonth(date.getMonth() + maturityPeriod);
        break;
      case 4:
        date.setFullYear(date.getFullYear() + maturityPeriod);
        break;
      default:
        throw new Error("Invalid installment type");
    }

    const formattedDate = `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;

    return formattedDate;
  }

    digigoldandsilverMaturity(startDateStr, noOfDays) {
    const startDate = new Date(startDateStr);
    const maturityDate = new Date(startDate);
    maturityDate.setDate(maturityDate.getDate() + noOfDays);
    return maturityDate.toISOString().split("T")[0];
  }
 

  async addSchemeAccount(data, tokenData) {
    try {
      data.created_by = tokenData.id_employee;
      data.typeofcustomer = 0;
      data.date_add = new Date();
      data.date_upd = new Date();
      data.added_by = 0;
      // data.status = 0;
      data.amount=0;
      data.weight=0

      if(data?.platform){
         if(data?.platform?.toLowerCase() === "android"){
          data.added_by = 1
         }else{
          data.added_by =2
         }
      }

      const customerData = await this.customerRepo.findById(data.id_customer);
      const schemeData = await this.schemeRespo.findById(data.id_scheme);

      const digiExists = await this.schemeAccountRepository.findOne({id_customer:data?.id_customer,id_scheme:data?.id_scheme,status:0})

    if ((schemeData.scheme_type == 10 || schemeData.scheme_type == 14) && digiExists) {
      return {
        success: false,
        message: "Each customer is allowed to hold only one DigiGold/DigiSilver account"
      };
    }

     if ((schemeData.scheme_type == 10 || schemeData.scheme_type == 14)) {
       data.maturity_date = this.digigoldandsilverMaturity(
          data.start_date || new Date(),
          schemeData.noOfDays
        );
    }
      const schemeAccCounts = await this.schemeAccountRepository.find({
        id_scheme: data.id_scheme,
        status:0
      });
      

      if(!data.start_date){
        const startDate = new Date()
        const maturiytDate = this.calculateMaturityDate(startDate,schemeData.maturity_period,schemeData.installment_type)
        data.start_date = startDate
        data.maturity_date= maturiytDate
      }

      const currentCount = schemeAccCounts.length;
      const customerLimit = schemeData.limit_customer;

      if (customerLimit > 0 && currentCount >= customerLimit) {
        return {
          statu: false,
          message: "Scheme limit reached, not able to add more customers",
        };
      }

      if (data?.referral_type === "Employee" || data?.typeof_referral === 1) {
        data.typeofcustomer = 2;
      }


      if (customerData) {
        if (customerData.referral_id == null && data.referral_id !== "") {
          
          const refData = {
            referral_type: data?.referral_type,
            referral_id: data?.referral_id,
          };

          await this.customerRepo.updateUniversal(data.id_customer, refData);
        } else if (
          customerData.referral_id !== null &&
          data.referral_id !== null
        ) {
          return {
            status: false,
            message: "This user has already been referred",
          };
        }
      }

      if (data.referral_id === "") {
        delete data.referral_id;
      }

      const savedData = await this.schemeAccountRepository.addSchemeAccount(
        data
      );

      if (!savedData) {
        return { success: false, message: "Failed to add scheme account" };
      }

      const schemeInfo = await this.schemeAccountRepository.findInfo(
        savedData._id
      );
      const schemeCode = schemeData.code;

      let schemeAccNumber;
      let isUnique = false;

      while (!isUnique) {
        const randomDigits = randomInt(1000, 9999);
        schemeAccNumber = `${schemeCode}${randomDigits}`;

        const existingAccount = await this.schemeAccountRepository.findOne({
          scheme_acc_number: schemeAccNumber,
        });

        if (!existingAccount) {
          isUnique = true;
        }
      }

      await this.schemeAccountRepository.updateSchemNumber(
        savedData._id.toString(),
        { scheme_acc_number: schemeAccNumber }
      );

      const notificationData = await isNotificationEnabled("schemeJoining");
      const referralNotification = await isNotificationEnabled("schemeReferral")
      if (notificationData) {
        await this.sendAccountCreationNotifications(data, schemeData, savedData, notificationData,referralNotification);
      }

      return {
        success: true,
        message: "Scheme account added successfully",
        id: savedData._id,
      };
    } catch (error) {
      console.error("Error while adding scheme account:", error);
      return {
        success: false,
        message: "Error while adding scheme account",
        error: error.message,
      };
    }
  }

  async editSchemeAccount(id, data, tokenData) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provided id is not a object id" };
      }

      const existingAccount = await this.schemeAccountRepository.findById(id);

      if (!existingAccount) {
        return res
          .status(404)
          .json({ status: "Failed", message: "Scheme Account not found" });
      }

      //   data.created_by = tokenData.id_employee;
      //   data.referal_id = 0;
      //   data.typeofcustomer = 1;
      //   data.date_add = new Date();
      //   data.date_upd = new Date();
      //   data.added_by = 0;
      //   data.status = 0;

      const employeeData = this.employeeRepository.findOne({
        mobile: data.referal_code,
        id_branch: data.id_branch,
        active: true,
      });

      if (employeeData) {
        data.referal_id = employeeData;
        data.typeofcustomer = 2;
      }

      const updateData = {
        total_installments: data.total_installments,
        id_classification: data.id_classification,
        collectionuserid: data.collectionuserid || 0,
        id_scheme: data.id_scheme,
        id_customer: data.id_customer,
        id_branch: data.id_branch,
        account_name: data.account_name,
        start_date: data.start_date,
        amount: data.amount,
        maturity_date: data.maturity_date,
        referal_code: data.referral_code,
        referal_id: data.referral_id || 0,
        typeofcustomer: data.typeofcustomer || 1,
        date_upd: new Date(),
        updated_by: tokenData.id_employee,
        status: 0,
      };

      const savedData = await this.schemeAccountRepository.editSchemeAccount(
        id,
        updateData
      );

      if (savedData) {
        return {
          success: true,
          message: "Scheme account updated successfully",
        };
      } else {
        return { success: false, message: "Failed to add scheme account" };
      }
    } catch (error) {
      console.error("Error while adding scheme account:", error);

      return {
        success: false,
        message: "Error while adding scheme account",
        error: error.message,
      };
    }
  }

  async deleteSchemeAccount(id) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Scheme account id is not a valid object id",
        };
      }

      const schemData = await this.schemeAccountRepository.findById(id);

      if (!schemData) {
        return { success: false, message: "No scheme account found" };
      }

      if (schemData.is_deleted) {
        return { success: false, message: "Already deleted scheme account" };
      }

      const result = await this.schemeAccountRepository.deleteSchemeAccount(id);

      if (!result) {
        return { success: false, message: "Failed to deleted scheme account" };
      }

      return { success: true, message: "Scheme account deleted successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting scheme account" };
    }
  }

  async activateSchemeAccount(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }

    const schemeData = await this.schemeAccountRepository.findById(id);

    if (!schemeData) {
      return { success: false, message: "No classification found" };
    }

    if (schemeData.is_deleted) {
      return {
        success: false,
        message: "Deleted classification unable to activate",
      };
    }

    const updatedScheme =
      await this.schemeAccountRepository.activateSchemeAccount(
        id,
        schemeData.active
      );

    if (!updatedScheme) {
      return {
        success: false,
        message: "Failed to change classification status",
      };
    }

    let message = !schemeData.active
      ? "Scheme activated successfully"
      : "Scheme deactivated";

    return { success: true, message: message };
  }

  // async getSchemeAccountById(id) {
  //   try {
  //     if (!isValidObjectId(id)) {
  //       return { success: false, message: "Provide a valid object id" };
  //     }

  //     const account = await this.schemeAccountRepository.getSchemeAccountById(id);
  //     if (!account) {
  //       return { success: false, message: "No scheme account found" };
  //     }

  //     const arrobject = {
  //       _id: account._id,
  //       id_scheme_account: account._id,
  //       account_name: account.account_name,
  //       start_date: account.start_date,
  //       maturity_date: account.maturity_date,
  //       last_paid_date: account.last_paid_date,
  //       scheme_acc_number: account.scheme_acc_number,
  //       active: account.active,
  //       id_customer: account.id_customer,
  //       id_classification: account.id_classification,
  //       branch_name: account.id_branch?.name,
  //       amount: account.amount,
  //       total_installments:account?.id_scheme?.total_installments,
  //       gift_issues:account?.gift_issues
  //     };

  //     const scheme = account.id_scheme;
  //     if ([0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 13, 14].includes(scheme.scheme_type)) {
  //       arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme.min_amount} - ${scheme.max_amount})`;
  //     } else if ([12, 3, 4].includes(scheme.scheme_type)) {
  //       arrobject.scheme_name = `${scheme.scheme_name} (Gm ${scheme?.min_weight} - ${scheme?.max_weight})`;
  //     } else {
  //       arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme.amount})`;
  //     }

  //     const [
  //       schemetype,
  //       metalrow,
  //       purityrow,
  //       lastpayment,
  //       gift_issues,
  //       calcpayment,
  //       billrow
  //     ] = await Promise.all([
  //       this.getschemetype(scheme.scheme_type),
  //       this.getmetal(scheme.id_metal),
  //       this.getpurity(scheme.id_purity),
  //       this.lastpaymentlist(account._id),
  //       this.giftcalculation(account._id),
  //       this.paymentcalculation(account._id),
  //       this.getcloseaccount(account._id)
  //     ]);

  //     arrobject.scheme_type = scheme.scheme_type;
  //     arrobject.id_scheme = scheme;
  //     arrobject.scheme_typename = schemetype.scheme_typename;
  //     arrobject.metal_name = metalrow.metal;
  //     arrobject.purity_name = purityrow.purity_name;
  //     arrobject.last_paid_date = lastpayment.last_paid_date;
  //     arrobject.last_paid_installment = lastpayment.last_paid_installment;
  //     arrobject.last_paid_amount = lastpayment.last_paid_amount;
  //     arrobject.last_paid_weight = lastpayment.last_paid_weight;
  //     arrobject.total_gifts_issued = gift_issues.received_gift;
  //     arrobject.gift_type = scheme.gift_type;
  //     arrobject.issue_gift = scheme.gift_percentage;
  //     arrobject.received_gift = gift_issues.received_gift;
  //     arrobject.excess_amount = gift_issues.excess_amount;
  //     arrobject.balance_gift = parseInt(scheme.gift_percentage) - parseInt(gift_issues.received_gift);
  //     arrobject.received_gift_amount = parseFloat(gift_issues.gift_amount) - parseFloat(gift_issues.excess_amount);
  //     arrobject.scheme_amount = scheme.amount;
  //     arrobject.gift_percentage = scheme.gift_percentage;
  //     arrobject.allocate_gift_amount = 0;
      
  //     let allocate_gift_amount = 0;
  //     let balance_gift_amount = 0;
  //     if (scheme.gift_type === 1 && parseInt(scheme.gift_percentage) > 0) {
  //       allocate_gift_amount = (scheme.amount * scheme.gift_percentage) / 100;
  //       balance_gift_amount = allocate_gift_amount - (parseFloat(gift_issues.gift_amount) - parseFloat(gift_issues.excess_amount));
  //     }
  //     arrobject.allocate_gift_amount = allocate_gift_amount;
  //     arrobject.balance_gift_amount = balance_gift_amount;

  //     arrobject.bill_no = billrow.bill_no;
  //     arrobject.bill_date = billrow.bill_date;
  //     arrobject.return_amount = billrow.return_amount;
  //     arrobject.word_convert = this.convertNumberToWord(billrow.return_amount);

  //     arrobject.fine_amount = calcpayment.fine_amount || 0;
  //     arrobject.total_paidinstallments = calcpayment.total_installments;
  //     arrobject.total_paidamount = calcpayment.total_paidamount;
  //     arrobject.total_weight = calcpayment.total_weight;
  //     arrobject.status_name = this.getStatusName(account.status);
  //     arrobject.created_through = this.addedby(account.created_through);

  //     const paymentresult = await this.getallpayment(account._id);
  //     arrobject.paymentdata = paymentresult;

  //     // Create scheme summary similar to searchAccMobile
  //     const schemeSummary = [{
  //       scheme_acc_no: arrobject.scheme_acc_number,
  //       scheme_acc_id: arrobject._id,
  //       scheme_type: arrobject.scheme_type,
  //       scheme_name: arrobject.scheme_name,
  //       Allottedgifts: arrobject.id_scheme.no_of_gifts,
  //       total_giftIssues: arrobject.total_gifts_issued
  //     }];

  //     return {
  //       success: true,
  //       message: "Scheme account data retrieved successfully",
  //       data: arrobject,
  //       schemeSummary: schemeSummary
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     return {
  //       success: false,
  //       message: "Error while getting scheme account data",
  //     };
  //   }
  // }
  async getSchemeAccountById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const account = await this.schemeAccountRepository.getSchemeAccountById(id);
      if (!account) {
        return { success: false, message: "No scheme account found" };
      }

      const arrobject = {
        _id: account._id,
        id_scheme_account: account._id,
        account_name: account.account_name,
        start_date: account.start_date,
        maturity_date: account.maturity_date,
        last_paid_date: account.last_paid_date,
        scheme_acc_number: account.scheme_acc_number,
        // accountschemeid: account.accountschemeid,
        active: account.active,
        id_customer: account.id_customer,
        id_classification: account.id_classification,
        branch_name: account.id_branch?.name,
        amount: account?.amount,
        weight:account?.weight,
        total_installments:account?.id_scheme?.total_installments,
        paid_installments:account?.paid_installments,
        gift_issues:account?.gift_issues
      };

      const scheme = account.id_scheme;
      if ([0, 1, 2, 5, 6, 7, 8, 9, 10, 11, 13, 14].includes(scheme.scheme_type)) {
        arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme.min_amount} - ${scheme.max_amount})`;
      } else if ([12, 3, 4].includes(scheme.scheme_type)) {
        arrobject.scheme_name = `${scheme.scheme_name} (Gm ${scheme?.min_weight} - ${scheme?.max_weight})`;
      } else {
        arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme.amount})`;
      }

      const [
        schemetype,
        metalrow,
        purityrow,
        lastpayment,
        gift_issues,
        calcpayment,
        billrow
      ] = await Promise.all([
        this.getschemetype(scheme.scheme_type),
        this.getmetal(scheme.id_metal),
        this.getpurity(scheme.id_purity),
        this.lastpaymentlist(account._id),
        this.giftcalculation(account._id),
        this.paymentcalculation(account._id),
        this.getcloseaccount(account._id)
      ]);

      arrobject.scheme_type = scheme?.scheme_type;
      arrobject.id_scheme = scheme;
      arrobject.scheme_typename = schemetype?.scheme_typename;
      arrobject.metal_name = metalrow?.metal;
      arrobject.purity_name = purityrow?.purity_name;
      arrobject.last_paid_date = lastpayment?.last_paid_date;
      arrobject.last_paid_installment = lastpayment?.last_paid_installment;
      arrobject.last_paid_amount = lastpayment?.last_paid_amount;
      arrobject.last_paid_weight = lastpayment?.last_paid_weight;
      arrobject.total_gifts_issued = gift_issues?.received_gift;
      arrobject.gift_type = scheme?.gift_type;
      arrobject.issue_gift = scheme?.gift_percentage;
      arrobject.received_gift = gift_issues?.received_gift;
      arrobject.excess_amount = gift_issues?.excess_amount;
      arrobject.balance_gift = parseInt(scheme?.gift_percentage) - parseInt(gift_issues?.received_gift);
      arrobject.received_gift_amount = parseFloat(gift_issues?.gift_amount) - parseFloat(gift_issues?.excess_amount);
      arrobject.scheme_amount = scheme?.amount;
      arrobject.gift_percentage = scheme?.gift_percentage;
      arrobject.allocate_gift_amount = 0;
      
      let allocate_gift_amount = 0;
      let balance_gift_amount = 0;
      if (scheme.gift_type === 1 && parseInt(scheme?.gift_percentage) > 0) {
        allocate_gift_amount = (scheme?.amount * scheme?.gift_percentage) / 100;
        balance_gift_amount = allocate_gift_amount - (parseFloat(gift_issues?.gift_amount) - parseFloat(gift_issues?.excess_amount));
      }
      arrobject.allocate_gift_amount = allocate_gift_amount;
      arrobject.balance_gift_amount = balance_gift_amount;

      arrobject.bill_no = billrow?.bill_no;
      arrobject.bill_date = billrow?.bill_date;
      arrobject.return_amount = billrow?.return_amount;
      arrobject.word_convert = this.convertNumberToWord(billrow?.return_amount);

      arrobject.fine_amount = calcpayment.fine_amount || 0;
      // arrobject.total_paidinstallments = calcpayment.total_installments;
      arrobject.total_paidamount = calcpayment.total_paidamount;
      arrobject.total_weight = calcpayment.total_weight;
      arrobject.status_name = this.getStatusName(account.status);
      arrobject.created_through = this.addedby(account.created_through);

      const paymentresult = await this.getallpayment(account._id);
      arrobject.paymentdata = paymentresult;

      // Create scheme summary similar to searchAccMobile
      const schemeSummary = [{
        scheme_acc_no: arrobject?.scheme_acc_number,
        scheme_acc_id: arrobject?._id,
        scheme_type: arrobject?.scheme_type,
        scheme_name: arrobject?.scheme_name,
        Allottedgifts: arrobject?.id_scheme.no_of_gifts,
        total_giftIssues: arrobject?.total_gifts_issued
      }];

      return {
        success: true,
        message: "Scheme account data retrieved successfully",
        data: arrobject,
        schemeSummary: schemeSummary
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting scheme account data",
      };
    }
  }

  async getAllSchemeAccounts() {
    try {
      const result = await this.schemeAccountRepository.find({ active: true });

      if (result.length === 0) {
        return { success: false, message: "No scheme account found" };
      }

      delete result.active;
      return {
        success: true,
        message: "Scheme account data retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting scheme account data",
      };
    }
  }

  async revertSchemeAccount(id, tokenData) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Provided id is not a valid object id",
        };
      }

      const deletedData = await this.closeAccRepo.revertAccount(id);

      if (!deletedData) {
        return { success: false, message: "Failed to delete close account" };
      }

      if(deletedData.previousStatus == 2){
        return {success:false,message:"Operation not allowed"}
      }

      const createdBy = tokenData.id_employee;

      const updateData = {
        closebill_id: 0,
        status: deletedData.previousStatus,
        revert_date: new Date(),
        revert_by: createdBy,
        closed_date: null,
        closed_by: 0,
        active: true,
        is_deleted: false,
      };

      const revertData = await this.schemeAccountRepository.revertSchemeAccount(
        deletedData.id_scheme_account,
        updateData
      );

      if (!revertData) {
        return {
          success: false,
          message: "Failed to revert scheme account",
        };
      }

      return {
        success: true,
        message: "Scheme account reverted successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while reveritng scheme account",
      };
    }
  }

  async closeSchemeAccount(id, data, tokenData) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Provided id is not a valid object id",
        };
      }

      const employee = await this.employeeRepository.findOne({_id:tokenData?.id_employee,active:true,is_deleted:false})

      if(!employee){
        return {success:false,message:"Operation not permitted"}
      }

      const schemeAccount= await this.schemeAccountRepository.findById(id)

      if(!schemeAccount){
        return {success:false,message:"No scheme account found"}
      }

      const {
        status,
        id_scheme_account,
        id_branch,
        comments,
        bill_no,
        bill_date,
        total_paidamount,
        refund_paymenttype,
      } = data;

      const createdBy = tokenData.id_employee;
      const newcloseaccount = {
        comments,
        id_scheme_account: id,
        id_branch,
        closed_by: createdBy,
        bill_no,
        bill_date,
        status,
        return_amount: total_paidamount,
        refund_paymenttype,
        previousStatus:schemeAccount?.status
      };

      let newClosedAccount = "";
      if (refund_paymenttype !== "") {
        newClosedAccount = await this.closeAccRepo.addCloseAccount(
          newcloseaccount
        );
      } else {
        delete newcloseaccount.refund_paymenttype;
        newClosedAccount = await this.closeAccRepo.addCloseAccount(
          newcloseaccount
        );
      }

      if (!newClosedAccount) {
        return { success: false, message: "Failed to add close account" };
      }

      const closeSchemeAccount = {
        closed_by: createdBy,
        closed_date: new Date(),
        status: status,
      };

      const revertData = await this.schemeAccountRepository.closeSchemeAccount(
        id,
        closeSchemeAccount
      );

      if (!revertData) {
        return {
          success: false,
          message: "Failed to close scheme account",
        };
      }

      const notificationData = await isNotificationEnabled("schemeClose");

      if (notificationData.push) {
        const schemeData = await this.schemeAccountRepository.find({ _id: id });

        const input = {
          recipients: [data.id_customer],
          title: "Scheme Account Closed",
          message: `Your ${schemeData.scheme_name} Scheme Account with KEERTHI JWELLERS has been successfully closed. We appreciate your association with us`,
          channel: "push",
        }
        await smsService.sendNotification(input);
        
        await this.saveNotificationUsecase.saveNotification({
          title: input.title,
          message: input.message,
          type:"alert",
          category:'Scheme account'
        },data.id_customer)
      }

      return {
        success: true,
        message: "Scheme account closed successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while closing the account",
      };
    }
  }

  async searchMobieSchemeAccount(branchId, searchValue) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }
  
      const query = {};
      let customerData = null;
  
      // First, try to find customer by mobile
      if (searchValue.length === 10 && /^\d{10}$/.test(searchValue)) {
        customerData = await this.customerRepo.findOne({
          id_branch: branchId,
          mobile: searchValue,
        });
      }

      if (customerData) {
        query.id_customer = customerData._id;
      } else {
        query.scheme_acc_number = searchValue;
      }
  
      query.active = true;
      query.status = { $nin: [1, 2,3,4] };
  
      const schemeAccount =
        await this.schemeAccountRepository.searchMobieSchemeAccount(query);
  
      if (!schemeAccount || schemeAccount.length === 0) {
        return { success: false, message: "No scheme account found" };
      }
  
      if (!customerData) {
        const customerId = schemeAccount[0]?.id_customer;
        customerData = await this.customerRepo.findById(customerId);
      }
  
      const generalsetting = await this.generalsettingRepo.findOne(branchId);
  
      const additionalDataPromises = schemeAccount?.map(async (account) => {
        const arrobject = {
          _id: account._id,
          id_scheme_account: account?._id,
          account_name: account?.account_name,
          start_date: account?.start_date,
          maturity_date: account?.maturity_date,
          last_paid_date: account?.last_paid_date,
          scheme_acc_number: account?.scheme_acc_number,
          // accountschemeid: account?.accountschemeid,
          active: account?.active,
          flexFixed: account?.flexFixed
        };
  
        const scheme = account?.id_scheme;
  
        if ([0, 1, 2, 5, 6, 7, 8, 9, 10, 11,13,14].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme?.scheme_name} (Rs. ${scheme?.min_amount} - ${scheme?.max_amount})`;
        } else if ([12, 3, 4].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme?.scheme_name} (Gm ${scheme?.min_weight} - ${scheme?.max_weight})`;
        } else {
          arrobject.scheme_name = `${scheme?.scheme_name} (Rs. ${scheme?.amount})`;
        }
  
        const [
          schemetype,
          metalrow,
          purityrow,
          lastpayment,
          gift_issues,
          calcpayment,
        ] = await Promise.all([
          this.getschemetype(scheme?.scheme_type),
          this.getmetal(scheme?.id_metal),
          this.getpurity(scheme?.id_purity),
          this.lastpaymentlist(account?._id),
          this.giftcalculation(account?._id),
          this.paymentcalculation(account?._id),
        ]);
  
        arrobject.scheme_type = scheme?.scheme_type;
        arrobject.id_scheme = scheme;
        arrobject.id_customer = customerData;
        arrobject.scheme_typename = schemetype?.scheme_typename;
        arrobject.metal_name = metalrow?.metal;
        arrobject.purity_name = purityrow?.purity_name;
        arrobject.id_classification = {
          name: account?.id_classification?.name,
          _id: account?.id_classification?._id,
          order: account?.id_classification?.order,
          payment_editable: account?.id_classification?.payment_editable,
        };
        arrobject.branch_name = account?.id_branch?.name;
        arrobject.last_paid_date = lastpayment?.last_paid_date;
        arrobject.last_paid_installment = lastpayment?.last_paid_installment;
        arrobject.last_paid_amount = lastpayment?.last_paid_amount;
        arrobject.last_paid_weight = lastpayment?.last_paid_weight;
        arrobject.total_gifts_issued = account?.gift_issues;
        arrobject.fine_amount = calcpayment?.fine_amount || 0;
        arrobject.total_paidinstallments = account?.paid_installments;
        arrobject.total_paidamount = calcpayment?.total_paidamount;
        arrobject.total_weight = calcpayment?.total_weight;
        arrobject.amount = account?.amount;
        arrobject.weight = account?.weight;
        arrobject.status = account?.status;
        arrobject.status_name = this.getStatusName(account?.status);
        arrobject.created_through = this.addedby(account?.created_through);
  
        return arrobject;
      });
  
      const processedData = await Promise.all(additionalDataPromises);
  
      processedData.sort((a, b) => {
        return (
          new Date(b.last_paid_date || 0) - new Date(a.last_paid_date || 0)
        );
      });
  
      return {
        success: true,
        message: "Customer scheme account fetched successfully",
        data: processedData,
        general: generalsetting,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }
  

  async extendInstallment(id, data) {
    try {
      if (!isValidObjectId(id)) {
        return {
          success: false,
          message: "Provided id is not a valid object id",
        };
      }

      const schemeAccount = await this.schemeAccountRepository.findById(id);

      if (!schemeAccount) {
        return { success: false, message: "Scheme account not found" };
      }

      const dataToUpdate = {};

      const totalInstallments =
        parseInt(schemeAccount.total_installments) +
        parseInt(data.extend_installment);
      dataToUpdate.status = 0;
      dataToUpdate.total_installments = totalInstallments;

      const extendedInstallment = await this.schemeAccountRepository.updateOne(
        id,
        dataToUpdate
      );

      if (!extendedInstallment) {
        return {
          success: false,
          message: "Failed to update extend installment",
        };
      }
      return {
        success: true,
        message: "Scheme installment extended successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while closing the account",
      };
    }
  }

  async getCustomerAccount(branchId, customerId,skip,limit,ema) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }

      if (!isValidObjectId(customerId)) {
        return {
          success: false,
          message: "Customer id is not a valid object id",
        };
      }

      const Data = await this.schemeAccountRepository.getCustomerAccount({
        id_branch: new mongoose.Types.ObjectId(branchId),
        id_customer: new mongoose.Types.ObjectId(customerId),
        active: true,
        status:0
      },Number(skip),Number(limit),ema);

      if (!Data) {
        return { success: false, message: "No scheme account found" };
      }
      

      return {
        success: true,
        message: "Shceme account fetched successfully",
        data: Data,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async getSchemeAccountTable(passedData) {
    try {
      const {
        page,
        limit,
        from_date,
        to_date,
        id_branch,
        search,
        type,
      } = passedData;
  
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;
  
      // Main pipeline for data fetching
      const pipeline = [];
  
      pipeline.push({ $match: { is_deleted: false, active: true } });
  
      if (from_date && to_date) {
        pipeline.push({
          $match: {
            start_date: {
              $gte: new Date(from_date),
              $lte: new Date(to_date),
            },
          },
        });
      }
  
      if (type !== "") {
        pipeline.push({ $match: { status: type } });
      } else {
        pipeline.push({ $match: { status: { $in: [0, 1, 2, 3, 4] } } });
      }
      
      if (search) {
        const regex = new RegExp(search, "i");
        const isMobile = /^\d{10}$/.test(search);
        if (isMobile) {
          const customer = await this.customerRepo.findOne({ mobile: Number(search) });

          if (customer) {
            pipeline.push({ $match: { id_customer: customer._id } });
          } else {
            pipeline.push({ $match: { _id: null } });
          }
        } else {
          pipeline.push({
            $match: {
              $or: [
                { account_name: { $regex: regex } },
                { scheme_acc_number: { $regex: regex } },
              ],
            },
          });
        }
      }
  
      // Lookup stages
      pipeline.push(
        { $lookup: { from: "customers", localField: "id_customer", foreignField: "_id", as: "customer" } },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "schemes", localField: "id_scheme", foreignField: "_id", as: "scheme" } },
        { $unwind: { path: "$scheme", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "branches", localField: "id_branch", foreignField: "_id", as: "branch" } },
        { $unwind: { path: "$branch", preserveNullAndEmptyArrays: true } },
        { $lookup: { from: "schemeclassifications", localField: "id_classification", foreignField: "_id", as: "classification" } },
        { $unwind: { path: "$classification", preserveNullAndEmptyArrays: true } }
      );
  
      // Add computed fields
      pipeline.push({
        $addFields: {
          customer_name: {
            $concat: [
              { $ifNull: ["$customer.firstname", ""] },
              " ",
              { $ifNull: ["$customer.lastname", ""] },
            ],
          },
          mobile: "$customer.mobile",
          address: "$customer.address",
          scheme_name: "$scheme.scheme_name",
          min_amount: "$scheme.min_amount",
          max_amount: "$scheme.max_amount",
          min_weight: "$scheme.min_weight",
          max_weight: "$scheme.max_weight",
          scheme_type: "$scheme.scheme_type",
          total_installments: "$scheme.total_installments",
          gift_type: "$scheme.gift_type",
          gift_percentage: "$scheme.gift_percentage",
          allottedgifts: "$scheme.no_of_gifts",
          metal: "$scheme.id_metal",
          purity: "$scheme.id_purity",
          branch_name: "$branch.branch_name",
          branch_id: "$branch._id",
          classification: {
            _id: "$classification._id",
            name: "$classification.name",
          },
        },
      });

      // Create a copy of the pipeline for counting (without pagination/sorting)
      const countPipeline = [...pipeline];
      
      // Add sorting and pagination to main pipeline
      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: (pageNum - 1) * pageSize },
        { $limit: pageSize }
      );

      // Add count stage to count pipeline
      countPipeline.push({ $count: "totalCount" });

      // Execute both pipelines in parallel
      const [data, countResult] = await Promise.all([
        this.schemeAccountRepository.getAccounts(pipeline),
        this.schemeAccountRepository.aggregate(countPipeline)
      ]);

      const totalCount = countResult[0]?.totalCount || 0;

      // Enrich the data with additional information
      const enrichedData = await Promise.all(
        data?.map(async (account) => {
          const [
            schemetype,
            metalrow,
            purityrow,
            billrow,
            gift_issues,
            calcpayment,
          ] = await Promise.all([
            this.getschemetype(account.scheme_type),
            this.getmetal(account.metal),
            this.getpurity(account.purity),
            this.getcloseaccount(account._id),
            this.giftcalculation(account._id),
            this.paymentcalculation(account._id),
          ]);
  
          return {
            ...account,
            scheme_typename: schemetype?.scheme_typename,
            metal_name: metalrow?.metal_name,
            purity_name: purityrow?.purity_name,
            bill_no: billrow?.bill_no,
            bill_date: billrow?.bill_date,
            received_gift: gift_issues?.received_gift,
            excess_amount: gift_issues?.excess_amount,
            balance_gift:
              parseInt(account.gift_percentage) - parseInt(gift_issues?.received_gift || 0),
            received_gift_amount:
              parseFloat(gift_issues?.gift_amount || 0) -
              parseFloat(gift_issues?.excess_amount || 0),
            fine_amount: calcpayment?.fine_amount,
            total_paidinstallments: calcpayment?.total_installments,
            total_paidamount: calcpayment?.total_paidamount,
            total_weight: calcpayment?.total_weight,
            status_name: this.getStatusName(account.status),
            created_through: this.addedby(account.added_by),
          };
        })
      );
  
      return {
        success: true,
        message: "Data fetched successfully",
        data: enrichedData,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error("Error in getSchemeAccountTable:", error);
      return {
        success: false,
        message: "An error occurred while fetching data",
      };
    }
}

  async getPaymentByAccNumber(accNum) {
    try {
      const paymentData =
        await this.schemeAccountRepository.getPaymentByAccNumber(accNum);
      if (paymentData) {
        const calculation = {
          total_paid_installments:
            paymentData[0].related_payments[0].total_paid_installments,
          total_paid_amount:
            paymentData[0].related_payments[0].total_paid_amount,
          total_paid_weight:
            paymentData[0].related_payments[0].total_paid_weight,
        };
        return {
          success: true,
          message: "Scheme account payment fetched successfully",
          data: paymentData[0].related_payments[0].related_payments,
          calculation: calculation,
        };
      }

      return {
        success: false,
        message: "No payments found related to the scheme account number",
      };
    } catch (error) {
      console.error(error);
    }
  }

  async sendOtpForClose(mobile, branchId) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }

      const smsInfo = await this.smsRepo.findOne({
        id_branch: branchId,
        otp_sent: 1,
      });

      if (smsInfo) {
        const smsurl = smsInfo.otp_url;
        let smsContent = smsInfo.otp_content;
        const replacements = {
          mobile: mobile,
        };

        let otp = await this.generateOtp();
        smsContent = smsContent.replace(/{{otp}}/g, otp);

        const saveData = {
          mobile: mobile,
          send_otptime: new Date(),
          otp_code: otp,
          type: "preclose",
        };

        const otpsaved = await this.otpRepo.saveOtp(saveData);

        if (!otpsaved) {
          return { success: false, message: "Otp send failed, try again" };
        }

        const data = {
          numbers: [mobile],
          message: smsContent,
          templateParams: { otp: otp },
          sms_type: "",
          type: "sms",
          delayBetweenSMS: 1000,
          customUrl: smsurl,
        };

        const otpSent = await smsService._sendSMS(data.numbers, data.message, null, data.type, data.customUrl);

        if (otpSent) {
          return {
            success: true,
            message: "Otp delivered to the mobile number",
          };
        }
      } else {
        return { success: false, message: "Otp congfiguration is not enabled,Failed to send otp" };
      }
      // return { success: true, message: "" };
    } catch (error) {
      console.error(error);
    }
  }

  async verifyOtp(mobile, otp) {
    try {
      const otpData = await this.otpRepo.findOtpByMobile(mobile);

      if (!otpData) {
        return { success: false, message: "Not permited action" };
      }

      const timeNow = new Date();
      const otpSentTime = new Date(otpData.send_otptime);
      const timeDifferenceInSeconds = (timeNow - otpSentTime) / 1000;

      if (timeDifferenceInSeconds > 60) {
        await this.otpRepo.deleteOtpById(otpData._id);
        return { success: false, message: "OTP has expired,try again" };
      }

      if (otpData.otp_code !== otp) {
        return { success: false, message: "Invalid OTP" };
      }

      await this.otpRepo.deleteOtpById(otpData._id);

      return { success: true, message: "Otp verified successfully" };
    } catch (error) {
      console.error(error);
    }
  }

  async findCustomerAccountCounts(mobile, schemeId) {
    try {
      const customerData = await this.customerRepo.findOne({ mobile: mobile });

      if (!customerData) {
        return { success: false, message: "No customers found", data: 0 };
      }

      const customerId = customerData._id;
      const shcemeAccountData =
        await this.schemeAccountRepository.findCustomerAccountCounts(
          customerId,
          schemeId
        );

      if (!shcemeAccountData) {
        return {
          success: false,
          message: "Not accounts found",
          data: Number(shcemeAccountData)+1,
        };
      }

      return {
        success: true,
        message: "Scheme accounts found",
        data: Number(shcemeAccountData)+1,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async getRevertedDetails(cusId, schemeNum) {
    try {
      const customerData = await this.customerRepo.findOne({
        _id: cusId,
        active: true,
      });

      if (!customerData) {
        return { success: false, message: "No customers found" };
      }

      const shcemeAccountData = await this.schemeAccountRepository.find({
        id_customer: cusId,
        scheme_acc_number: schemeNum,
      });

      if (!shcemeAccountData) {
        return { success: false, message: "Not scheme accounts found" };
      }

      const schemeAccId = shcemeAccountData[0]._id;

      const closeAccDetails = await this.closeAccRepo.getCloseaccount(
        schemeAccId
      );
      const returnData = {
        _id: closeAccDetails._id,
        bill_no: closeAccDetails.bill_no,
        bill_date: closeAccDetails.bill_date,
      };

      return {
        success: true,
        message: "Closed account data fetched successfully",
        data: returnData,
      };
    } catch (error) {
      console.error(error);
    }
  }

  async searchAccMobile(branchId, value) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }

      const searchterm = value || "";

      const Data = await customerRepo.findOne({
        id_branch: branchId,
        mobile: searchterm,
      });

      const query = {
        active: true,
        status: { $nin: [1,4,3] },
      };

      if (Data) {
        query.id_customer = Data._id;
      }

      if (!Data) {
        query.scheme_acc_number = searchterm;
      }

      const schemeAccount =
        await this.schemeAccountRepository.searchMobieSchemeAccount(query);

      if (!Data && !schemeAccount) {
        return { success: false, message: "No customer found" };
      }

      if (!schemeAccount || schemeAccount.length === 0) {
        return { success: false, message: "No scheme account found" };
      }

      const generalsetting = await this.generalsettingRepo.findOne(branchId);

      const additionalDataPromises = schemeAccount.map(async (account) => {
        const arrobject = {
          _id: account._id,
          id_scheme_account: account?._id,
          account_name: account?.account_name,
          start_date: account?.start_date,
          maturity_date: account?.maturity_date,
          last_paid_date: account?.last_paid_date,
          scheme_acc_number: account?.scheme_acc_number,
          // accountschemeid: account?.accountschemeid,
          active: account?.active,
          paidInstallments: account?.paid_installments
        };

        const scheme = account?.id_scheme;
        if ([0, 1, 2, 5, 6, 7, 8, 9, 10, 11,13,14].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme?.scheme_name} (Rs. ${scheme?.min_amount} - ${scheme?.max_amount})`;
        } else if ([12, 3, 4].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme?.scheme_name} (Gm ${scheme?.min_weight} - ${scheme?.max_weight})`;
        } else {
          arrobject.scheme_name = `${scheme?.scheme_name} (Rs. ${scheme?.amount})`;
        }

        const [
          schemetype,
          metalrow,
          purityrow,
          lastpayment,
          gift_issues,
          calcpayment,
        ] = await Promise.all([
          this.getschemetype(scheme?.scheme_type),
          this.getmetal(scheme?.id_metal),
          this.getpurity(scheme?.id_purity),
          this.lastpaymentlist(account?._id),
          this.giftcalculation(account?._id),
          this.paymentcalculation(account?._id),
        ]);

        arrobject.scheme_type = scheme?.scheme_type;
        arrobject.id_scheme = scheme;
        arrobject.id_customer = Data;
        arrobject.scheme_typename = schemetype?.scheme_typename;
        arrobject.metal_name = metalrow?.metal;
        arrobject.id_classification = {
          name: account?.id_classification?.name,
          _id: account?.id_classification?._id,
          order: account?.id_classification?.order,
        };
        arrobject.branch_name = account?.id_branch?.name;
        arrobject.last_paid_date = lastpayment?.last_paid_date;
        arrobject.last_paid_installment = lastpayment?.last_paid_installment;
        arrobject.last_paid_amount = lastpayment?.last_paid_amount;
        arrobject.last_paid_weight = lastpayment?.last_paid_weight;
        arrobject.total_gifts_issued = gift_issues?.received_gift;
        arrobject.fine_amount = calcpayment?.fine_amount || 0;
        arrobject.total_paidinstallments = calcpayment?.total_installments;
        arrobject.total_paidamount = calcpayment?.total_paidamount;
        arrobject.total_weight = calcpayment?.total_weight;
        arrobject.amount = account?.amount;
        arrobject.status_name = this.getStatusName(account?.status);
        arrobject.created_through = this.addedby(account?.created_through);

        return arrobject;
      });

      const processedData = await Promise.all(additionalDataPromises);

      processedData.sort((a, b) => {
        return (
          new Date(b.last_paid_date || 0) - new Date(a.last_paid_date || 0)
        );
      });

      const schemeSummary = processedData.map((item) => ({
        scheme_acc_no: item.scheme_acc_number,
        scheme_acc_id: item._id,
        scheme_type: item.scheme_type,
        scheme_name: item.scheme_name,
        Allottedgifts: item.id_scheme.no_of_gifts,
        total_giftIssues: item.total_gifts_issued,
      }));

      return {
        success: true,
        message: "Customer scheme account fetched successfully",
        data: processedData,
        schemeSummary: schemeSummary,
        general: generalsetting,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async searchPaymentData(branchId, value) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }

      const searchterm = value || "";

      const Data = await customerRepo.findOne({
        id_branch: branchId,
        mobile: searchterm,
      });

      const query = {
        active: true,
        status: { $nin: [1, 2] },
      };

      if (Data) {
        query.id_customer = Data._id;
      }

      if (!Data) {
        query.scheme_acc_number = searchterm;
      }

      const schemeAccount =
        await this.schemeAccountRepository.searchMobieSchemeAccount(query);
      if (!Data && !schemeAccount) {
        return { success: false, message: "No customer found" };
      }

      if (!schemeAccount || schemeAccount.length === 0) {
        return { success: false, message: "No scheme account found" };
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: schemeAccount,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  //!dynamic customer search
  async customMobileSearch(branchId, mobile, status) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }

      const searchTerm = mobile || "";
      const isMobileNumber = /^[6-9]\d{9}$/.test(searchTerm);

      let Data;
      if(isMobileNumber){
        Data = await this.customerRepo.findOne({
          id_branch: branchId,
          mobile: searchTerm,
        });
      }

      const query = {
        active: true,
      };

      if (Data) {
        query.id_customer= Data?._id
      }

      if (Array.isArray(status) && status.length > 0) {
        query.status = { $in: status };
      }

      if(!Data){
        query.scheme_acc_number= mobile
        delete query.id_customer
      }

      const schemeAccount =
        await this.schemeAccountRepository.searchMobieSchemeAccount(query);

      if (!schemeAccount) {
        return { success: false, message: "No scheme account found" };
      }

      const generalsetting = await this.generalsettingRepo.findOne(branchId);

      const additionalDataPromises = schemeAccount?.map(async (account) => {
        const arrobject = {};

        arrobject._id = account._id;
        arrobject.id_scheme_account = account?._id;
        arrobject.account_name = account?.account_name;
        arrobject.start_date = account?.start_date;
        arrobject.maturity_date = account?.maturity_date;
        arrobject.last_paid_date = account?.last_paid_date;
        arrobject.scheme_acc_number = account?.scheme_acc_number;
        // arrobject.accountschemeid = account?.accountschemeid;
        arrobject.active = account?.active;

        const scheme = account?.id_scheme;
        // if ([0, 1, 2].includes(scheme.scheme_type)) {
        //   arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme.amount})`;
        // } else
        if ([0, 1, 2, 5, 6, 7, 8, 9, 10, 11].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme.scheme_name} (Rs. ${scheme?.min_amount} - ${scheme?.max_amount})`;
        } else if ([12, 3, 4].includes(scheme?.scheme_type)) {
          arrobject.scheme_name = `${scheme?.scheme_name} (Gm ${scheme?.min_weight} - ${scheme?.max_weight})`;
        } else {
          arrobject.scheme_name = `${scheme?.scheme_name} (Rs. ${scheme?.amount})`;
        }

        const [
          schemetype,
          metalrow,
          purityrow,
          lastpayment,
          gift_issues,
          calcpayment,
        ] = await Promise.all([
          this.getschemetype(scheme?.scheme_type),
          this.getmetal(scheme?.id_metal),
          this.getpurity(scheme?.id_purity),
          this.lastpaymentlist(account?._id),
          this.giftcalculation(account?._id),
          this.paymentcalculation(account?._id),
        ]);

        arrobject.scheme_type = scheme?.scheme_type;
        arrobject.id_scheme = scheme;
        arrobject.id_customer = Data;
        arrobject.scheme_typename = schemetype?.scheme_typename;
        arrobject.metal_name = metalrow?.metal;
        arrobject.purity_name = purityrow?.purity_name;
        arrobject.id_classification = {
          name: account?.id_classification?.name,
          _id: account?.id_classification?._id,
          order: account?.id_classification?.order,
          payment_editable: account.id_classification?.payment_editable,
        };
        arrobject.branch_name = account?.id_branch.name;
        arrobject.last_paid_date = lastpayment?.last_paid_date;
        arrobject.last_paid_installment = lastpayment?.last_paid_installment;
        arrobject.last_paid_amount = lastpayment?.last_paid_amount;
        arrobject.last_paid_weight = lastpayment?.last_paid_weight;
        // arrobject.total_gifts_issued = gift_issues.received_gift;
        arrobject.total_gifts_issued = account?.gift_issues;
        arrobject.fine_amount = calcpayment?.fine_amount || 0;
        // arrobject.total_paidinstallments = calcpayment.total_installments;
        arrobject.total_paidinstallments = account?.paid_installments;
        arrobject.total_paidamount = calcpayment?.amount || account?.amount;
        arrobject.total_weight = calcpayment?.total_weight;
        arrobject.amount = account?.amount;
        arrobject.weight = account?.weight;
        arrobject.status = account?.status;
        arrobject.scheme_acc_number = account?.scheme_acc_number;
        arrobject.status_name = this.getStatusName(account?.status);
        arrobject.created_through = this.addedby(account?.added_by);

        return arrobject;
      });

      const processedData = await Promise.all(additionalDataPromises);

      processedData.sort((a, b) => {
        return (
          new Date(b.last_paid_date || 0) - new Date(a.last_paid_date || 0)
        );
      });

      return {
        success: true,
        message: "Customer shceme account fetched successfully",
        data: processedData,
        general: generalsetting,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async getAllSchemeAccountsForMobile(customerId,weight=false){
    try {
      const customer = await this.customerRepo.findOne({_id:customerId,active:true,is_deleted:false})

      if(!customer){
        return {status:false,message:"No customer found"}
      }

      const result = await this.schemeAccountRepository.getAllSchemeAccountsForMobile(customerId,weight)

      if(result){
        return {status:true,message:"Scheme accounts fetched successfully",result}
      }

      return {status:false,message:"Failed to get scheme account data"}
    } catch (error) {
      console.error(error)
    }
  }

  async getMetalBasedSavings(customerId){
    try {
      const customer = await this.customerRepo.findOne({_id:customerId,active:true,is_deleted:false})

      if(!customer){
        return {status:false,message:"No customer found"}
      }

      const result = await this.schemeAccountRepository.getMetalBasedSavings(customerId)

      if(result){
        return {status:true,message:"Scheme accounts fetched successfully",result}
      }

      return {status:false,message:"Failed to get scheme account data"}
    } catch (error) {
      console.error(error)
    }
  }

  async overdueCalculation(mobile){
    try {
      const customer= await this.customerRepo.findOne({mobile:mobile})

      const customerId = new mongoose.Types.ObjectId(customer._id)
      const result = await this.schemeAccountRepository.overdueCalculation(customerId)

      if(result){
        return {status:true,message:"Scheme accounts fetched successfully",result}
      }

      return {status:false,message:"Failed to get scheme account data"}
    } catch (error) {
      console.error(error)
    }
  }
}
export default SchemeAccountUseCase;