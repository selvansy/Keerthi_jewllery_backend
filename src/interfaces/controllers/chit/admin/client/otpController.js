class otpController{
  constructor(otpusecase){
    this.otpusecase = otpusecase;
  }

  async verifyOtp(req, res) {
    try {
        const data = { ...req.body };
        const result = await this.otpusecase.verifyOtp(data)

        if (!result.success) {
            return res.status(400).json({ message: result.message })
        }

        return res.status(201).json({status:true, message: result.message })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
}

export default otpController;