 import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import config from "../../../../config/chit/env.js";
import crypto from "crypto";
import { generateReferralCode } from "../../../../utils/cryptoGenerator.js";
import smsService from "../../../../config/chit/smsService.js";
import SchemeAccountRepository from '../../../../infrastructure/repositories/chit/schemeAccountRepository.js'

class CustomerUseCase {
  constructor(
    customerRepository,
    s3service,
    s3Repo,
    smsSender,
    smsRepo,
    otpRepo,
    hashingService,
    tokenService
  ) {
    this.customerRepository = customerRepository;
    this.s3service = s3service;
    this.s3Repo = s3Repo;
    this.smsSender = smsSender;
    this.smsRepo = smsRepo;
    this.otpRepo = otpRepo;
    this.hashingService = hashingService;
    this.tokenService = tokenService;
    this.schemeAccountRepo = new SchemeAccountRepository()
  }

  
  async s3Helper(id_clientId) {
    try {
      let s3settings
      if(!id_clientId){
         s3settings = await this.s3Repo.getSetting();
      }else{
        s3settings = await this.s3Repo.getSettingByClient(id_clientId);
      }

      if (!s3settings && s3settings.length < 0) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings?.s3key,
        s3secret: s3settings?.s3secret,
        s3bucket_name: s3settings?.s3bucket_name,
        s3display_url: s3settings?.s3display_url,
        region: s3settings?.region,
      };

      return configuration;
    } catch (error) {
      console.error(error);
    }
  }

  async generateOtp() {
    const otp = crypto.randomInt(1000, 10000).toString();
    return otp;
  }

  async urlConstructor(url, content, replacements) {
    try {
      const constructedUrl = url
      .replace(/xxxmobilexxx/g, replacements.mobile)
      .replace(/xxxmessagexxx/g, content);

      return constructedUrl;
    } catch (error) {
      console.error("Error constructing URL:", error);
      throw error;
    }
  }

  async addCustomer(data, uploads, token) {
    try {
      const existingUser = await this.customerRepository.existingUser(
        data.mobile
      );

      if (existingUser) {
        return {
          success: false,
          message: "User already exists with same mobile number",
        };
      }
      
      let dataToSave = {};
      dataToSave = {
        ...data,
        bank_accountname: data.bank_accountname || null,
        bank_accno: data?.bank_accno || null,
        bank_ifsccode: data?.bank_ifsccode || null,
        notification: data?.notification || null,
        mpin: data?.mpin || null,
        password: data?.password || null,
        username: data?.username || null,
        authorno: data?.authorno || null,
        pan: data?.pan || null,
        nominee_mobile: data?.nominee_mobile || null,
        nominee_relationship: data?.nominee_relationship || null,
        nominee_name: data?.nominee_name || null,
        whatsapp: data?.whatsapp || data.mobile || null,
        added_by: data?.added_by || 0,
        address: data?.address || "",
        email:data?.email || null
      };

      const s3Configs = await this.s3Helper(token.id_client);

      if (!s3Configs) {
        return { success: false, messsage: "No s3bucket configuraiton found" };
      }

      if (uploads) {
        if (uploads.cus_img) {
          try {
            if (uploads.cus_img[0]) {
              dataToSave.cus_img = await this.s3service.uploadToS3(
                uploads.cus_img[0],
                "customer",
                s3Configs
              );
            }
            if (uploads.id_proof[0]) {
              dataToSave.id_proof = await this.s3service.uploadToS3(
                uploads.id_proof[0],
                "customer",
                s3Configs
              );
            }
          } catch (error) {
            console.error(error);
          }
        }
      }

      const referralCode = generateReferralCode(data.mobile);
      dataToSave.referral_code = `Cus-${referralCode}`;
      if (data.password) {
        const hashPassword = await this.hashingService.hashPassword(
          data.password
        );
        dataToSave.password = hashPassword;
      }
      
      const empCode = generateReferralCode(data.mobile,new Date())
      data.employeeId = `CUS${empCode}`
      const savedData = await this.customerRepository.addCustomer(dataToSave);

      if (!savedData) {
        return { success: false, message: "Failed to add customer" };
      }
      
      const smsInfo = await this.smsRepo.findOne({
        id_branch: data.id_branch,
        customer_sent: 1,
      });

      if (smsInfo) {
        const userInfo = await this.customerRepository.findInfo(savedData._id);
        const smsurl = smsInfo.customer_url;
        const smsContent = smsInfo.customer_content;
        const replacements = {
          mobile: userInfo.mobile,
        };
        
        const urlToSend = await this.urlConstructor(
          smsurl,
          smsContent,
          replacements
        );
        
        const smsSendStatus = await this.smsSender.sendSms(urlToSend);
        
        if (smsSendStatus) {
          return {
            success: true,
            message: "Customer added successfully, Message delivered",
            data: savedData,
          };
        }
      }

      return {
        success: true,
        message: "Customer added successfully",
        data: savedData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, messsage: "Error while adding customer" };
    }
  }

  async editCustomer(id, data, uploads, token) {
    const genderImages = [null,'1749878256269.webp',"1749878753243.webp", '1749878926644.webp', ]; //null,male,female, other
    
    try {
        if (!isValidObjectId(id)) {
            return { success: false, message: "Provide a valid object id" };
        }

        const userExists = await this.customerRepository.findById(id);
        if (!userExists) {
            return { success: false, message: "No user found" };
        }

        const existingUser = await this.customerRepository.checkUser(id, data.mobile);
        if (existingUser) {
            return {
                success: false,
                message: "User already exists with same mobile number",
            };
        }

        const normalizeValue = (key, value) => {
            if (["gender", "mobile", "pincode", "notification"].includes(key)) {
                return Number(value);
            }
            if (value instanceof mongoose.Types.ObjectId) {
                return value.toString();
            }
            if (value instanceof Date) {
                return value.toISOString();
            }
            return value;
        };

        const fieldsToUpdate = {};

        Object.keys(data).forEach((key) => {
            const newValue = data[key];

            if (
                ["_id", "createdAt", "updatedAt", "__v", "is_deleted"].includes(key) ||
                normalizeValue(key, userExists[key]) === normalizeValue(key, newValue) ||
                newValue === "" || newValue === null
            ) {
                return;
            }
        
            fieldsToUpdate[key] = newValue;
        });

        if (Object.keys(fieldsToUpdate).length === 0) {
            return { success: false, message: "No fields to update" };
        } else {
            fieldsToUpdate.date_upd = Date.now();
        }

        const s3Configs = await this.s3Helper(token.id_client);
        if (!s3Configs) {
            return { success: false, messsage: "No s3bucket configuration found" };
        }

        if (uploads) {
            try {
                if (uploads.cus_img && uploads.cus_img[0]) {
                    if (
                        userExists.cus_img &&
                        userExists.cus_img !== uploads.cus_img[0].filename &&
                        !genderImages.includes(userExists.cus_img)
                    ) {
                        const keyPath = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}customer/${userExists?.cus_img}`;
                        await this.s3service.deleteFromS3(keyPath, s3Configs);
                    }
                    fieldsToUpdate.cus_img = await this.s3service.uploadToS3(
                        uploads.cus_img[0],
                        "customer",
                        s3Configs
                    );
                } else if (data.gender !== undefined && data.gender !== null) {
                    const genderIndex = Number(data.gender);
                    if (!isNaN(genderIndex) && (!userExists.cus_img || genderImages.includes(userExists.cus_img))) {
                        const selectedImage = genderImages[genderIndex % genderImages.length];
                        fieldsToUpdate.cus_img = selectedImage;
                    }
                }

                if (uploads.id_proof && uploads.id_proof[0]) {
                    if (
                        userExists.id_proof &&
                        userExists.id_proof !== uploads.id_proof[0].filename
                    ) {
                        const keyPath = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}customer/${userExists?.id_proof}`;
                        await this.s3service.deleteFromS3(keyPath, s3Configs);
                    }
                    fieldsToUpdate.id_proof = await this.s3service.uploadToS3(
                        uploads.id_proof[0],
                        "customer",
                        s3Configs
                    );
                }
            } catch (error) {
                console.error(error);
                return { success: false, message: "Error uploading files" };
            }
        } else if (data.gender !== undefined && data.gender !== null) {
            const genderIndex = Number(data.gender);
            if (!isNaN(genderIndex)) {
                const currentImage = userExists.cus_img;
                if (!currentImage || genderImages.includes(currentImage)) {
                    // const selectedImage = genderImages[genderIndex % genderImages.length];
                    const selectedImage = genderImages[genderIndex];
                    fieldsToUpdate.cus_img = selectedImage;
                }
            }
        }

        const updatedCustomer = await this.customerRepository.findByIdAndUpdate(
            id,
            fieldsToUpdate
        );

        return {
            success: true,
            message: "Customer updated successfully",
            data: updatedCustomer,
        };
    } catch (error) {
        console.error(error);
        return { success: false, message: "Error updating customer" };
    }
}

  async deleteCustomer(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existsData = await this.customerRepository.findById(id);

      if (!existsData) {
        return { success: false, message: "No customer found" };
      }

      if (existsData.is_deleted) {
        return { success: false, message: "Already deleted customer" };
      }

      const newData = await this.customerRepository.deleteCustomer(id);

      if (!newData) {
        return { success: false, message: "Failed to delete customer" };
      }

      return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while deleting customer" };
    }
  }

  async activateCustomer(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Invalid customer ID provided" };
      }

      const existsData = await this.customerRepository.findById(id);

      if (!existsData) {
        return { success: false, message: "Customer not found" };
      }

      if (existsData.is_deleted) {
        return {
          success: false,
          message: "Action not permitted for deleted customers",
        };
      }

      const newData = await this.customerRepository.activateCustomer(
        id,
        existsData.active
      );

      if (!newData) {
        return { success: false, message: "Failed to update customer status" };
      }

      const message = existsData.active
        ? "Customer successfully deactivated"
        : "Customer successfully activated";

      return { success: true, message };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while updating customer status",
      };
    }
  }

  async getCustomersByBranch(branchId) {
    if (!branchId) throw new Error("Branch ID is required");

    const customers = await this.customerRepository.getCustomersByBranch(
      branchId
    );
    
    return customers.length > 0 ? customers : [];
  }

  async getCustomerById(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existsData = await this.customerRepository.findById(id);

      if (!existsData) {
        return { success: false, message: "No customer found" };
      }

     if(existsData.mpin){
       existsData.mpinStatus = true
     }else{
      existsData.mpinStatus = false
     }

      return {
        success: true,
        message: "Customer data fetched successfully",
        data: existsData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting customer data" };
    }
  }

  async searchCustomerByMobile(search,customer) {
    try {
      const searchTerm = search;

      let Data = "";

      if (search.length == 10) {
        Data = await this.customerRepository.searchCustomerByMobile(searchTerm);
      } else {
        const code = `Cus-${search}`;
        Data = await this.customerRepository.finByReferralCode(code);
      }

      if (!Data || Data.length === 0) {
        return { success: true, message: "No customers found" };
      }

      const customerData = await this.customerRepository.findOne({mobile:customer})

      if(customerData){
        const code = `Cus-${search}`;
        if(customerData.mobile ==  search){
          return {stauts:false,message:"Self referring not allowed"}
        }else if(customerData.referral_code == code){
          return {stauts:false,message:"Self referring not allowed"}
        }
      }

      return {
        success: true,
        message: "Data fetched successfully",
        data: Data,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async getAllCustomers(
    page,
    limit,
    search,
    fromDate,
    toDate,
    id_branch,
    active
  ) {
    try {
      const pageNum = parseInt(page) || 1;
      const pageSize = parseInt(limit) || 10;
      const searchTerm = search?.trim() || "";

      const searchConditions = [];
      const isNumericSearch = !isNaN(searchTerm) && searchTerm !== "";

      if (searchTerm) {
        searchConditions.push({
          firstname: { $regex: searchTerm, $options: "i" },
        });

        if (isNumericSearch) {
          searchConditions.push({ mobile: Number(searchTerm) });
        }
      }

      const searchQuery =
        searchConditions.length > 0 ? { $or: searchConditions } : {};

      const dateFilter = {};
      if (fromDate) dateFilter.createdAt = { $gte: fromDate };
      if (toDate) {
        dateFilter.createdAt = dateFilter.createdAt
          ? { ...dateFilter.createdAt, $lte: toDate }
          : { $lte: toDate };
      }

      const query = {
        is_deleted: { $ne: true },
        ...searchQuery,
        ...dateFilter,
      };

      if (isValidObjectId(id_branch)) {
        query.id_branch = id_branch;
      }

      if (active === undefined || active === null || active === "") {
        query.active = { $in: [true, false] };
      } else {
        query.active = { $in: active };
      }

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.customerRepository.getAllCustomers({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No active customers found" };
      }

      return {
        success: true,
        message: "Customer data fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async searchCustomerByMobileAndBranch(branchId, mobile) {
    try {
      if (!isValidObjectId(branchId)) {
        return {
          success: false,
          message: "Branch id is not a valid object id",
        };
      }
      const searchTerm = mobile || "";

      const Data = await this.customerRepository.find({
        id_branch: branchId,
        mobile: searchTerm,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No customer found" };
      }

      if (!Data[0].active) {
        return { success: false, message: "Customer is not active" };
      }

      return {
        success: true,
        message: "Customer data fetched successfully",
        data: Data[0],
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async verifyOtpAndResetPassword(mobile, otp, newPassword) {
    try {
      const user = await this.customerRepository.findByMobile(mobile);

      if (!user) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      if (user.otp !== otp) {
        return { success: false, message: "Invalid OTP" };
      }

      if (new Date() > user.otpExpiry) {
        return { success: false, message: "OTP has expired" };
      }

      // Update password and clear OTP
      await this.customerRepository.updatePassword(user._id, newPassword);

      return { success: true, message: "Password reset successful" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error verifying OTP" };
    }
  }

  async sendOtp(data, userCheck) {
    try {
      const { mobile, type } = data;
      const checkAlready = await this.customerRepository.searchCustomerByMobile(
        mobile
      );

      if (userCheck && checkAlready) {
        return {
          success: false,
          message:
            "Mobile number is already registered. Please use a different number.",
        };
      }
      if (data.type == "forgotpassword" && !checkAlready) {
        return {
          success: false,
          message: "No user found",
        };
      }

      const smsInfo = await this.smsRepo.findOne({
        sms_access: 1,
        otp_sent: 1,
      });

      let otp;
      if (smsInfo) {
        const smsUrl = smsInfo.otp_url;
        let smsContent = smsInfo.otp_content;
        otp = await this.generateOtp();
        smsContent = smsContent.replace(/{{otp}}/g, otp);

        const data = {
          numbers: mobile,
          message: smsContent,
          templateParams: { otp: otp },
          sms_type: "",
          type: "sms",
          delayBetweenSMS: 1000,
          customUrl: smsUrl,
        };

        const otpSent = await smsService._sendSMS(data.numbers, data.message, null, data.type, data.customUrl);

        if (!otpSent) {
          return { success: false, message: "Failed to sent OTP" };
        }
        const saveOtp = await this.otpRepo.saveOtp({
          otp_code: otp,
          mobile: mobile,
          channel:"sms",
          send_otptime: new Date(),
          type,
        });
        if (saveOtp) {
          return { success: true, message: "Otp sent successfully" };
        }

        return { success: false, message: "Failed to sent OTP" };
      }
      return { success: false, message: "Failed to sent OTP" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error sending OTP" };
    }
  }

  async verifyOtp(mobile, otp, type) {
    try {
      const otpData = await this.otpRepo.findOtpByMobileAndType(mobile, type);

      if (!otpData) {
        return { success: false, message: "Not permited action" };
      }
      const timeNow = new Date();
      const otpSentTime = new Date(otpData.send_otptime);
      const timeDifferenceInSeconds = (timeNow - otpSentTime) / (1000 * 60);
      if (timeDifferenceInSeconds > 30) {
        await this.otpRepo.deleteOtpByMobile(otpData.mobile);
        return { success: false, message: "OTP has expired,try again" };
      }

      if (otpData.otp_code != otp || otpData.type != type) {
        return { success: false, message: "Invalid OTP" };
      }

      await this.otpRepo.changeOtpStatus(otpData.mobile, type);

      return { success: true, message: "Otp verified successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to verify otp" };
    }
  }

  async login(loginData) {
    try {
      const checkCusmoter =
        await this.customerRepository.searchCustomerByMobile(loginData.mobile);
      if (!checkCusmoter) {
        return { success: false, message: "User not found" };
      }
      const comparePassword = await this.hashingService.comparePassword(
        loginData.password,
        checkCusmoter.password
      );
      if (!comparePassword) {
        return { success: false, message: "Incorrect password." };
      }
      let payload = {
        _id: checkCusmoter._id,
        firstname: checkCusmoter.firstname,
        lastname: checkCusmoter.lastname,
        id_branch: checkCusmoter.id_branch,
        mobile: checkCusmoter.mobile,
      };
      const token = this.tokenService.generateToken(payload, "15d");
      return { success: true, message: "Login successful", token };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Failed to login" };
    }
  }

  async signup(userData) {
    try {

      const existingUser = await this.customerRepository.existingUser(
        userData.mobile
      );

      if (existingUser) {
        return {
          success: false,
          message: "User already exists with this mobile number",
        };
      }

      const isOtpVerify = await this.otpRepo.checkStatus(
        userData.mobile,
        "signup"
      );

      if (!isOtpVerify) {
        return { success: false, message: "Otp not verified" };
      }
      const hashPassword = await this.hashingService.hashPassword(
        userData.password
      );
      userData.password = hashPassword;
      const referralCode = generateReferralCode(userData.mobile);
      userData.referral_code = `Cus-${referralCode}`;
      
      const savedUser = await this.customerRepository.addCustomer(userData);
      if (!savedUser) {
        return { success: false, message: "Failed to create user" };
      }

      await this.otpRepo.deleteOtpByMobile(userData.mobile, "signup");
      return { success: true, message: "Registration completed successfully." };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error during signup process" };
    }
  }

  async forgetPassword(mobile, newPassword) {
    try {
      const user = await this.customerRepository.existingUser(mobile);

      if (!user) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      const isOtpVerify = await this.otpRepo.checkStatus(
        mobile,
        "forgotpassword"
      );

      if (!isOtpVerify) {
        return { success: false, message: "Otp not verified" };
      }

      const checkOldPassword = await this.hashingService.comparePassword(
        newPassword,
        user.password
      );

      if (checkOldPassword) {
        return {
          success: false,
          message:
            "Your new password cannot be the same as your previous password.",
        };
      }

      const password = await this.hashingService.hashPassword(newPassword);

      const updatePassword = await this.customerRepository.editCustomer(
        user._id,
        { password }
      );
      if (updatePassword) {
        await this.otpRepo.deleteOtpByMobile(user.mobile, "signup");
        return { success: true, message: "Password changed successfully" };
      }
      return { success: false, message: "Failed to change password" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while changing password" };
    }
  }

  async verifyMpin(mobile, mpin) {
    try {
      const checkCusmoter = await this.customerRepository.existingUser(mobile);
      if (!checkCusmoter) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      const checkMpin = await this.customerRepository.verifyMpin(mobile, mpin);
      if (checkMpin) {
        return { success: true, message: "User MPIN verified successfully." };
      }
      return { success: false, message: "Incorrect MPIN. Please try again" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while verifing mpin" };
    }
  }

  async forgetMpin(mobile, mpin) {
    try {
      const checkCusmoter = await this.customerRepository.existingUser(mobile);
      if (!checkCusmoter) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      const isOtpVerify = await this.otpRepo.checkStatus(mobile, "forgotmpin");

      if (!isOtpVerify) {
        return { success: false, message: "Otp not verified" };
      }

      if (checkCusmoter.mpin == mpin) {
        return {
          success: false,
          message: "Your new MPIN cannot be the same as your previous MPIN.",
        };
      }

      const updateMpin = await this.customerRepository.editCustomer(
        checkCusmoter._id,
        { mpin }
      );
      if (updateMpin) {
        await this.otpRepo.deleteOtpByMobile(
          checkCusmoter.mobile,
          "forgotmpin"
        );
        return { success: true, message: "MPIN changed successfully" };
      }
      return { success: false, message: "Failed to change MPIN" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while verifing mpin" };
    }
  }

  async changeMpin(mobile, mpin, oldMpin) {
    try {
      const checkCusmoter = await this.customerRepository.existingUser(mobile);
      if (!checkCusmoter) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      if (checkCusmoter.mpin != oldMpin) {
        return {
          success: false,
          message: "The entered current MPIN is incorrect.",
        };
      }

      if (checkCusmoter.mpin == mpin) {
        return {
          success: false,
          message: "Your new MPIN cannot be the same as your previous MPIN.",
        };
      }

      const updateMpin = await this.customerRepository.editCustomer(
        checkCusmoter._id,
        { mpin }
      );
      if (updateMpin) {
        return { success: true, message: "MPIN changed successfully" };
      }
      return { success: false, message: "Failed to change MPIN" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while verifing mpin" };
    }
  }

  async getReferralDetals(customerId) {
    try {
      if(!isValidObjectId(customerId)){
        return {status:false,message:"Customer id is not a valid object id"}
      }

      const checkCusmoter = await this.customerRepository.findOne({_id:customerId});
      if (!checkCusmoter) {
        return {
          success: false,
          message: "No user found with this mobile number",
        };
      }

      let code=''
      if(checkCusmoter.referral_code == "0" || checkCusmoter.referral_code == null){
        const referralCode = generateReferralCode(checkCusmoter.mobile);
         code = `Cus-${referralCode}`;
        await this.customerRepository.updateUniversal(customerId,{referral_code:code})
      }

       const referralData = await this.customerRepository.getReferrlMessage();

      if (referralData) {
        const outputData ={
          referralCode: checkCusmoter.referral_code || code,
          referralMessage:referralData?.message,
          applink: referralData?.appLink,
          faq: referralData?.faq
         }

        return { success: true, message: "Referral details fetched successfully" ,data:outputData};
      }

      return { success: false, message: "Failed to get referral details" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting referral data" };
    }
  }

  async customerOverview(branch,mobile,idCustomer) {
    try {
      if(!isValidObjectId(idCustomer) && idCustomer){
        return {success:false,message:"Customer id is not valid object id"}
      }

      if(!isValidObjectId(branch) && !idCustomer){
        return {success:false,message:"Branch id is not valid object id"}
      }

      const customerData= await this.customerRepository.customerOverview({branch,mobile,idCustomer})

      if(customerData){
        const s3Configs = await this.s3Helper();
        customerData.customerDetails.pathUrl = `${s3Configs.s3display_url}keerthijewellery/webadmin/assets/customer/`;
      }
      
      if(!customerData){
        return {success:false,message:"No customer details found"}
      }

      const overdueData = await this.schemeAccountRepo.overdueCalculation(customerData.customerDetails._id)

      customerData.overDueData = {
        overdueSchemes:overdueData?.totalOverdueSchemes,
        overdueCount:overdueData?.totalOverdueAccounts,
        overdueAmount:overdueData?.totalFlexFixedOverdue
      }

      return { success: true, message: "Customer details fetched successfully",data:customerData};
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while getting referral data" };
    }
  }

  async findUsersBySchema (data){
    try{
      const result = await this.customerRepository.findUsersBySchema(data)
       if(!result){
        return {success:false,message:"No customers found"}
      }
      return { success: true, message: "Customers fetched successfully",data:result};
    }catch(error){
      console.error(error);
      return { success: false, message: "Error while getting customers by scheme" };
    }
  }

  async changePassword ({idCustomer,newPass,oldPass}){
    try{
      const existingCustomer = await this.customerRepository.getCustomerDataLess(idCustomer)

      if(existingCustomer.is_deleted){
        return {success:false,message:"Deleted customer operation not allowed"}
      }

      if(!existingCustomer.active){
        return {success:false,message:"Customer not active opetation not allowed,Contact admin"}
      }

      const comparePass = await this.hashingService.comparePassword(oldPass,existingCustomer.password)

      if(!comparePass){
        return {success:false,message:"Current password is wrong"}
      }

      const newPassCompare = await this.hashingService.comparePassword(newPass,existingCustomer.password)

      if(newPassCompare){
        return {success:false,message:"New password cannot be same as your old password"}
      }

      const updatedPassword = await this.customerRepository.updatePassword(existingCustomer._id,newPass)

      if(updatedPassword){
        return {success:true,message:"Password successfully updated"}
      }

      return {scuccess:false,message:"Failed to update password,try again"}
    }catch(error){
      console.error(error);
      return { success: false, message: "Error while changing password" };
    }
  }

  async verfiyPassword ({password,idCustomer}){
    try{
      const existingCustomer = await this.customerRepository.getCustomerDataLess(idCustomer)

      if(existingCustomer.is_deleted){
        return {success:false,message:"Deleted customer,operation not allowed"}
      }

      if(!existingCustomer.active){
        return {success:false,message:"Customer not active opetation not allowed,Contact admin"}
      }

      const comparePass = await this.hashingService.comparePassword(password,existingCustomer.password)

      if(!comparePass){
        return {success:false,message:"Wrong password"}
      }

      return {success:true,message:"Password verified successfully"}
    }catch(error){
      console.error(error);
      return { success: false, message: "Error while changing password" };
    }
  }
}

export default CustomerUseCase;
