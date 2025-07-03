import { isValidObjectId } from "mongoose";

class WhatsappMessageUsecas{
    constructor(
        whatsappMsgRepo,
        customersRepository,
        configurationRespo,
        notificationRepository,
        s3Respo,
        productRepo,
        newArrivalRepo,offersRepo,whatsappSettingRepo
    ){
    this.whatsappMsgRepo= whatsappMsgRepo;
    this.customersRepository = customersRepository;
    this.configurationRespo = configurationRespo;
    this.notificationRepository = notificationRepository;
    this.s3Respo = s3Respo;
    this.productRepo = productRepo;
    this.newArrivalRepo = newArrivalRepo;
    this.offersRepo = offersRepo;
    this.whatsappSettingRepo = whatsappSettingRepo;
    }

    getDataForSentType = (senttype, id, id_branch) => {
        let data = { senttype };
      
        switch (senttype) {
          case 1:
            data.id_offers = id;
            break;
          case 2:
            data.id_new_arrivals = id;
            break;
          case 3:
            data.id_product = id;
            break;
          default:
            throw new Error("Invalid senttype");
        }
      
        data.id_branch = id_branch;
        return data;
      };

    async s3Helper(id_branch){
        try {
          const s3settings = await this.s3Respo.getSettingByBranch(id_branch);
    
          if (!s3settings) {
            return { success: false, message: "S3 configuration not found" };
          }
    
          const configuration = {
            s3key: s3settings[0].s3key,
            s3secret: s3settings[0].s3secret,
            s3bucket_name: s3settings[0].s3bucket_name,
            s3display_url: s3settings[0].s3display_url,
            region: s3settings[0].region,
          };
    
          return configuration
        } catch (error) {
          console.error(error)
        }
      }

      async queryConstrunctor(senttype, id) {
        let data = { success: true};
        let query;
    
        switch (senttype) {
            case 1:
                query = await this.offersRepo.findById(id);
                if(query.whatsapp_sent===1){
                    data.success = false
                    data.message = "Offers whatsapp notificaiton already sent"
                }else{
                    data.activeState= "offers_sent"
                    data.key= "offers_key"
                    data.img= query.offer_image[0]
                    data.text= "offer"
                }
                break;
            case 2:
                query = await this.newArrivalRepo.findById(id);
                if(query.whatsapp_sent===1){
                    data.success = false
                    data.message = "Newarrival whatsapp notificaiton already sent"
                }else{
                    data.activeState= "newarrival_sent"
                    data.key= "newarrival_key",
                    data.img= query.images_Url[0],
                    data.text="new arrival"
                }
                break;
            case 3:
                query = await this.productRepo.findById(id);
                if(query.whatsapp_sent===1){
                    data.success = false
                    data.message = "Product whatsapp notificaiton already sent"
                }else{
                    data.activeState= "product_sent"
                    data.key= "product_key",
                    data.img= query.product_image[0]
                    data.text= "product"
                }
                break;
            default:
                throw new Error("Invalid senttype");
        }
    
        return data;
    }

    async updateDatabase(senttype,id,count) {
      let data={}
      let query
      switch (senttype) {
          case 1:
              query = await this.offersRepo.updateCount(id,count);
              if(query){
                  data.success = true
                  data.message = "Offers count updated"
              }else{
                  data.success =false,
                  data.message = "Failed to set customer count in offers"
              }
              break;
          case 2:
              query = await this.newArrivalRepo.updateCount(id,count);
              if(query){
                data.success = true
                data.message = "Newarrival whatsapp message count updated"
            }else{
                data.success =false,
                data.message = "Failed to set customer count in newarrivals"
            }
            break;
          case 3:
              query = await this.productRepo.updateCount(id,count);
              if(query){
                data.success = true
                data.message = "Product whatsapp message count updated"
            }else{
                data.success =false,
                data.message = "Failed to set customer count in products"
            }
            break;
          default:
              throw new Error("Invalid senttype");
      }
  
      return data;
  }

    async urlConstructor(url,replacements){
        return url
        .replace(/xxxcusmobilexxx/g, replacements.cusmobile)
        .replace(/xxximagepathxxx/g, replacements.imagepath)
        .replace(/xxxcusnamexxx/g, replacements.cusname);
    }
    

    async sendWhatsappMessage(data){
        try {
            const {id_branch, id, senttype} = data;
            if(!isValidObjectId(id_branch)){
                return {success:false, message:"Branch id is not valid object id"}
            }else if(!isValidObjectId(id)){
                return {success:false, message:"Id is not a valid object id"}
            }

            const result = await this.queryConstrunctor(senttype,id)

            if(!result.success){
                return {success:false,message:result.message}
            }

            const whatstappSettings = await this.whatsappSettingRepo.findByBranch(id_branch)

            if(!whatstappSettings){
              return {success:false,message:"No whatsapp settings found"}
            }
            
            if (!whatstappSettings[result.activeState]) {
                return {success:false,message:"Notification setting is not enabled"}
            }
            
            const whatsappUrl= whatstappSettings[result.key];

            if(!whatsappUrl){
              return {success:false,message:`No whatapp url found for ${result.text}`}
            }
            const notifysetting = await this.notificationRepository.getNotificaitonSettings(id_branch);
            
            if(notifysetting.notify_sent !== 1){
                return {success:false,message:"Notificatin is not enabled"}
            }

            const customers = await this.customersRepository.find({
                id_branch: id_branch,
                active: true,
              });

              if (customers.length === 0) {
                return { success: false, message: "No active customers found" };
              }

              const s3Configs = await this.s3Helper(data.id_branch)

              if (!s3Configs) {
                return { success: false, message: "S3 configuration not found" };
              }

              const dataToSave = this.getDataForSentType(senttype,id,id)

              const savedResult = await this.whatsappMsgRepo.addWhatsappMessage(dataToSave);

              if(!savedResult){
                return {success:false,message:"Failed to create whatsapp message"}
              }

               let total_sent = 0;
              for (let customer of customers){
                 if(customer.whatsapp !== ''){
                    const resplacements ={
                        cusmobile:customer.whatsapp,
                        imagepath:`${s3Configs.s3display_url}webadmin/assets/img/${result.img}`,
                        cusname:`${customer?.firstname} ${customer?.lastname}`
                    }
                    const message = await this.urlConstructor(whatsappUrl,resplacements)
                    total_sent = total_sent + 1
                 }
              }

              const countUpdate = await this.updateDatabase(senttype,id,total_sent)
              return {success:true,message:"Whatsapp notificaitons delivered"}
        } catch (error) {
            console.error(error)
            return {success:false,message:"Error while sending whatsapp notification"}
        }
    }

    async deleteWhatsappMessage(id){
      try {
          if(!isValidObjectId(id)){
              return {success:false,message:"Provided id is not a valid object id"}
          }

          const result = await this.whatsappMsgRepo.deleteWhatsappMessage(id);

          if(!result){
            return {success:false,message:'Failed to delete whatsapp message'}
          }

          return {success:true,message:"whatsapp message successfully deleted"}
      } catch (error) {
          console.error(error);
          return {success:false,message:"Error while deleting whatsapp message"}
      }
  }
}

export default WhatsappMessageUsecas;