import otpModel from "../../../infrastructure/models/chit/otpModel.js";

class OtpRepository {
  async saveOtp(data) {
    try {
      const { mobile,type } = data;
      const existingOtp = await otpModel.findOneAndUpdate({ mobile,type }, data, {
        new: true,
        upsert: true,
      });

      return existingOtp;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findOtpById(id) {
    try {
      const otpData = await otpModel.findById(id);

      if (!deletedData) {
        return null;
      }

      return otpData;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteOtpById(id) {
    try {
      const deletedData = await otpModel.deleteOne({ _id: id });

      if (deletedData.deletedCount === 0) {
        return null;
      }

      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async findOtpByMobile(mobile) {
    try {
      const otpData = await otpModel
        .findOne({ mobile: mobile })
        .sort({ createdAt: -1 });

      if (!otpData) {
        return null;
      }

      return otpData;
    } catch (error) {
      console.error(error);
    }
  }
  async findOtpByMobileAndType(mobile,type) {
    try {
      const otpData = await otpModel
        .findOne({mobile,type })
        .sort({ createdAt: -1 });
      if (!otpData) {
        return null;
      }

      return otpData;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteOtpByMobile(mobile,type) {
    try {
      const deletedData = await otpModel.deleteMany({ mobile,type });
      if (deletedData.deletedCount === 0) {
        return null;
      }

      return true;
    } catch (error) {
      console.error(error);
    }
  }

  async changeOtpStatus(mobile,type) {
    try {
        const changeStatus = await otpModel.updateOne({mobile,type},{is_verified:true})
        return changeStatus
    } catch (err) {
        console.error(err)
    }
  }

  async checkStatus (mobile,type){
    try{
        const status = await otpModel.findOne({mobile,type,is_verified:true})
        return status
    }catch(err){
        console.err(err)
    }
  }
}

export default OtpRepository;
