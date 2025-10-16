class PrintUseCase {
  constructor(printRepository) {
    this.printRepository = printRepository;
  }

  async getReceipt(filter){
    try{
    
      const result = await this.printRepository.getReceipt(filter)
      if(result){
        return{
          success:true,
          message:"Payment Receipt",
          data:result
        }
      }
      
      return{
        success:false,
        message:"Failed to get payments"
      }

    }catch(error){
      return{
        success:false,
        message:error
      }
    }
  }


  async getReceiptByPaymentId(paymentIds,userData){
    try{
      const findSchemeInfo = await this.printRepository.findSchemeInfoByPaymentId(paymentIds[0])
      const result = await this.printRepository.getReceiptByPaymentId(paymentIds)
      const companyData = await this.printRepository.findCompanyDetails(userData?.id_branch)
      if(result){
        return{
          success:true,
          message:"Payment Receipt",
          data:{schemeInfo:findSchemeInfo,data:result,companyData}
        }
      }
      
      return{
        success:false,
        message:"Failed to get payments"
      }

    }catch(error){
      return{
        success:false,
        message:error
      }
    }
  }
}

export default PrintUseCase;
