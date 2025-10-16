// class PrintUseCase {
//   constructor(printRepository) {
//     this.printRepository = printRepository;
//   }
 
//   async getReceipt(filter){
//     try{
   
//       const result = await this.printRepository.getReceipt(filter)
//     if(result){
//         return{
//           success:true,
//           message:"Payment Receipt",
//           data:result
//         }
//       }
     
//       return{
//         success:false,
//         message:"Failed to get payments"
//       }
 
//     }catch(error){
//       return{
//         success:false,
//         message:error
//       }
//     }
//   }


//   async getReceiptByPaymentId(paymentIds,userData){
//     try{
//       const findSchemeInfo = await this.printRepository.findSchemeInfoByPaymentId(paymentIds[0])
//       const branchDetails = await this.printRepository.getBranchDetails(userData?.id_branch)
//       const result = await this.printRepository.getReceiptByPaymentId(paymentIds)
//       if(result){
//         return{
//           success:true,
//           message:"Payment Receipt",
//           data:{schemeInfo:findSchemeInfo,data:result,branchDetails}
//         }
//       }
     
//       return{
//         success:false,
//         message:"Failed to get payments"
//       }
 
//     }catch(error){
//       return{
//         success:false,
//         message:error
//       }
//     }
//   }
// }
 
// export default PrintUseCase;