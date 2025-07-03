class otpUseCase{
    constructor(otprepo){
        this.otprepo= otprepo;
    }

    async verifyOtp(data) {
        try {
           const {mobile,type,otp}= data;
           const mobileNumber = Number(mobile)
          const otpData = await this.otprepo.findOtpByMobileAndType(mobileNumber,type);
    
          if (!otpData) {
            return { success: false, message: "Not permited action"};
          }
          const timeNow = new Date();
          const otpSentTime = new Date(otpData.send_otptime);
          const timeDifferenceInSeconds = (timeNow - otpSentTime) / (1000 * 60);
          if (timeDifferenceInSeconds > 30) {
            await this.otprepo.deleteOtpByMobile(otpData.mobile);
            return { success: false, message: "OTP has expired,try again" };
          }
    
          if (otpData.otp_code != otp || otpData.type!=type) {
            return { success: false, message: "Invalid OTP" };
          }
    
          await this.otprepo.changeOtpStatus(otpData.mobile,type);
    
          return { success: true, message: "Otp verified successfully" };
        } catch (error) {
          console.error(error);
          return { success: false, message: "Failed to verify otp" };
        }
      }
}

export default otpUseCase;