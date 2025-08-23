class OrganisationUsecase {
    constructor(organisationRepo,s3Service,s3Repo){
        this.organisationRepo = organisationRepo;
        this.s3Service= s3Service;
        this.s3Repo = s3Repo;
    }

    async s3Helper(clientId){
        try {
          const s3settings = await this.s3Repo.getSetting();
    
          if (!s3settings) {
            return { success: false, message: "S3 configuration not found" };
          }

          const configuration = {
            s3key: s3settings.s3key,
            s3secret: s3settings.s3secret,
            s3bucket_name: s3settings.s3bucket_name,
            s3display_url: s3settings.s3display_url,
            region: s3settings.region,
          };
    
          return configuration
        } catch (error) {
          console.error(error)
        }
      }

      async addOrgDetails(data, token, files) {
        try {
            const existing = await this.organisationRepo.findOne();
    
            if (files) {
                const clientId = token.id_client;
                const s3Configs = await this.s3Helper(clientId);
                const imageKeys = ["logo", "small_logo", "favicon", "login", "background", "bottom_logo"];
    
                for (const key of imageKeys) {
                    if (files[key] && files[key][0]) {
                        try {
                            if (existing && existing[key]) {
                                await this.s3Service.deleteFromS3(existing[key], s3Configs);
                            }
                            data[key] = await this.s3Service.uploadToS3(
                                files[key][0],
                                "organisation",
                                s3Configs
                            );
                        } catch (error) {
                            console.error(`Error handling ${key}:`, error);
                        }
                    }
                }
            }
    
            if (existing) {
                const updatedData = await this.organisationRepo.updateOne(existing._id, data);
    
                if (!updatedData) {
                    return { success: false, message: "Failed to update organisation details" };
                }
    
                return { success: true, message: "Organisation details updated successfully" };
            }
    
            const addData = await this.organisationRepo.insertOne(data);
    
            if (!addData) {
                return { success: false, message: "Failed to add organisation details" };
            }
    
            return { success: true, message: "Organisation details added successfully" };
        } catch (error) {
            console.error("Error while adding organisation details:", error);
            return { success: false, message: "Error while adding organisation details" };
        }
    }
    
    
    async getDetails(){
        try {
            const existsing  = await this.organisationRepo.findOne()

            if(existsing){
               existsing.pathurl = 'https://aupay-img.s3.eu-north-1.amazonaws.com/keerthijewellery/webadmin/assets/organisation/'
               return {success:true,message:"Organisation detials fetched successfully",data:existsing}
            }

            return {success:false,message:"No organisation details found"}
        } catch (error) {
            console.error(error);
            return {success:false,message:"Error while adding organisation detials"}
        }
    }
}

export default OrganisationUsecase;