import { isValidObjectId } from "mongoose";

class WeddingUsecase {
    constructor(weddingRepo,s3Respo,s3Service,
        productUsecase,newArrivalUsecase,offerUseCase
    ){
        this.weddingRepo= weddingRepo;
        this.s3Respo=s3Respo;
        this.s3Service=s3Service,
        this.productUsecase= productUsecase;
        this.newArrivalUsecase=newArrivalUsecase;
        this.offerUseCase=offerUseCase;
    }

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

      async addWeddingBirthday(data, files) {
        try {
            if (!files.image) {
                return { success: false, message: "Image is required" };
            }
    
            if (data.id && !isValidObjectId(data.id)) {
                return { success: false, message: "Invalid wedding notification ID" };
            }
    
            const exists = data.id ? await this.weddingRepo.findById(data.id) : null;

            const s3Configs = await this.s3Helper(data.id_branch);
            if (!s3Configs) {
                return { success: false, message: "S3 configuration not found" };
            }
    
            if (exists) {
                try {
                    data.image = await this.s3Service.uploadToS3(files.image[0], "wedding", s3Configs);
                    const updatedData = await this.weddingRepo.updateOne(data.id, data);
    
                    if (!updatedData) {
                        return { success: false, message: "Failed to update wedding notification" };
                    }
    
                    return { success: true, message: "Wedding notification updated successfully" };
                } catch (error) {
                    console.error("Error while updating:", error);
                    return { success: false, message: "Error while updating wedding notification" };
                }
            } else {
                try {
                    data.image = await this.s3Service.uploadToS3(files.image[0], "wedding", s3Configs);
                    const createNew = await this.weddingRepo.addWedding(data);
    
                    if (!createNew) {
                        return { success: false, message: "Failed to add wedding notification" };
                    }
    
                    return { success: true, message: "Wedding notification added successfully" };
                } catch (error) {
                    console.error("Error while adding:", error);
                    return { success: false, message: "Error while adding wedding notification" };
                }
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            return { success: false, message: "Error while processing wedding data" };
        }
    }
    

    async findBranch(id){
        try {
                if(!isValidObjectId(id)){
                    return 
                }
            const exists = await this.weddingRepo.findById(id);

            if(!exists){
                return {success:false,message:"No wedding notification found"}
            }

            return {success:true,message:"Successfully fetched wedding notification",data:exists}
        } catch (error) {
            console.error(error)
            return {successs:false,message:"Error while adding wedding data"}
        }
    }

    async dataTable(){
        try {
            const data = await this.weddingRepo.dataTable();
            
            if(!data){
                return {success:false,message:"No wedding notifications found"}
            }

            return {success:true,message:"Successfully fetched wedding notification",data:data}
        } catch (error) {
            console.error(error)
            return {successs:false,message:"Error while adding wedding data"}
        }
    }

    async findById(id){
        try {
            const exists = await this.weddingRepo.getByType(id);

            if(!exists){
                return {success:false,message:"No wedding notification found"}
            }

            return {success:true,message:"Successfully fetched wedding notification",data:exists}
        } catch (error) {
            console.error(error)
            return {successs:false,message:"Error while adding wedding data"}
        }
    }
}

export default WeddingUsecase