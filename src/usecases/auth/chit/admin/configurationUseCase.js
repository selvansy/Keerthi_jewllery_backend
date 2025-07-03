class ConfigurationUseCase {
    constructor(branchRepository, projectAccessRepository, appSettingRepository, gatewaySettingRepository, layoutRepository, notificationSettingRepository, s3BucketRepository, smsSettingRepository, whatsappRepository
        ,generalSettingRepository,projectRepository
    ) {
      this.branchRepository = branchRepository;
      this.projectAccessRepository = projectAccessRepository;
      this.appSettingRepository = appSettingRepository;
      this.gatewaySettingRepository = gatewaySettingRepository;
      this.layoutRepository = layoutRepository;
      this.notificationSettingRepository = notificationSettingRepository;
      this.s3BucketRepository = s3BucketRepository;
      this.smsSettingRepository = smsSettingRepository;
      this.whatsappRepository = whatsappRepository;
      this.generalSettingRepository= generalSettingRepository;
      this.projectRepository = projectRepository;
    }
  
    async getConfigurations({ pageInt, limitInt, project_type, search }) {
      try {
        let id_project = ''
        const projectData = await this.projectRepository.findId({id_project:project_type})

        if(!projectData){
          return {success:false,message:"No project found"}
        }

        id_project = projectData._id;

        let filter = { active: { $ne: false } };
  
        if (id_project && Array.isArray(id_project) && id_project.length > 0) {
          filter.id_project = { $in: id_project };
        }
  
        if (search) {
          const searchRegex = new RegExp(search, 'i');
          filter.$or = [{ branch_name: { $regex: searchRegex } }, { mobile: { $regex: searchRegex } }];
        }
  
        const skip = (pageInt - 1) * limitInt;
        const accessRecords = await this.projectAccessRepository.findWithPagination(filter, skip, limitInt);
  
        const arrayData = await Promise.all(
          accessRecords.map(async (account) => {
            let arrobject = {
              _id: account._id,
              id_client: account.id_client._id,
              id_project: id_project,
              project_name:projectData.project_name,
              id_branch: account.id_branch._id,
              branch_name: account.id_branch.branch_name,
              company_name: account.id_client.company_name,
              aupay_url: account.id_client.aupay_url,
              pawn_url: account.id_client.pawn_url,
              ausale_url: account.id_client.ausale_url,
              launch_date:account.launch_date,
              sign_date:account.sign_date,
              app: await this.appSettingRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              gateway: await this.gatewaySettingRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              general: await this.generalSettingRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              layout: await this.layoutRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              notification: await this.notificationSettingRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              bucket: await this.s3BucketRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              sms: await this.smsSettingRepository.exists(account.id_branch._id, id_project, account.id_client._id),
              whatsapp: await this.whatsappRepository.exists(account.id_branch._id, id_project, account.id_client._id),
            };
  
            return arrobject;
          })
        );
  
        const totalBranches = await this.branchRepository.count(filter);

        return {
          success:true,
          data: arrayData,
          totalbranch: totalBranches,
          totalPages: Math.ceil(totalBranches / limitInt),
          currentPage: pageInt,
        };
      } catch (error) {
        console.error('Error in ConfigurationUseCase:', error);
        return {success:false,message:'Error while getting configuration data'}
      }
    }
  }
  
  export default ConfigurationUseCase;