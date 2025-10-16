class PrintController {
  constructor(printUseCase) {
    this.printUseCase = printUseCase;
  }

  async getReceipt(req, res) {
    try {
        const {accountNumber}=req.body
        if(!accountNumber){
          return res.status(400).json({ message: "Account number or mobile number required" });
        }
        console.log("accountNumber",accountNumber)
        const result = await this.printUseCase.getReceipt({accountNumber})
        console.log("resultttttt",result)
        if(result.success){
          return res.status(200).json({ message:result.message,data:result.data });
        }
          return res.status(400).json({ message: result.message });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getReceiptByPaymentId(req, res) {
    try {
        const {paymentIds}=req.body
        if(paymentIds.length==0){
          return res.status(400).json({ message: "Payment ids required" });
        }
        const result = await this.printUseCase.getReceiptByPaymentId(paymentIds,req.user)
        console.log(result)
        if(result.success){
          return res.status(200).json({ message:result.message,data:result.data });
        }
          return res.status(400).json({ message: result.message });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default PrintController;
