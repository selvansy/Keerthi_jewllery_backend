class GeneralSettingController {
    constructor(generalSettingUseCase,validator) {
      this.generalSettingUseCase = generalSettingUseCase;
      this.validator=validator;
    }
  
    async addSettings(req, res) {
      try {
        const {id_client,id_branch, id_project}=req.body;
        
        const validate = {id_branch,id_client,id_project}

        const {error} = this.validator.generalSettingValidator.validate(validate)

        if(error){
            return res.staus(400).json({message:error.details[0].message})
        }

        const response = await this.generalSettingUseCase.addSettings(req.body);
        return res.status(response.success ? 200 : 400).json({status:response.status,message:response.message});
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  
    async getSettingByBranch(req, res) {
      try {
        const { branchId } = req.params;
        if(!branchId){
          return res.status(400).json({message:"No branch id provided"})
        }

        const response = await this.generalSettingUseCase.getSettingByBranch(branchId);
        return res.status(response.success ? 200 : 404).json(response);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  
    async getByProjectAndBranch(req, res) {
      try {
        const { projectId, branchId } = req.params;
        const response = await this.generalSettingUseCase.getByProjectAndBranch(projectId, branchId);
        return res.status(response.success ? 200 : 404).json(response);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
      }
    }
  }
  
  export default GeneralSettingController;