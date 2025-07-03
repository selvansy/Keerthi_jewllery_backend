class NotificationSettingController {
  constructor(notificationUseCase) {
    this.notificationUseCase = notificationUseCase;
  }

  addNotificationSetting = async (req, res) => {
    try {
      const {
        id_branch,
        id_project,
        id_client,
        notifyappid,
        notifyauthirization,
        notify_sent,
        newarrival_sent,
        product_sent,
        offers_sent,
      } = req.body;

      const requiredFields = ["id_client", "id_branch", "id_project"];
      for (const field of requiredFields) {
        if (!req.body[field] || req.body[field] === "") {
          return res
            .status(400)
            .json({
              status: "Failed",
              message: `${field.replace("id_", "")} is required`,
            });
        }
      }

      const result = await this.notificationUseCase.addOrUpdateNotificationSetting({
        id_branch,
        id_project,
        id_client,
        notifyappid,
        notifyauthirization,
        notify_sent,
        newarrival_sent,
        product_sent,
        offers_sent,
      });

       if(!result.success){
        return res.status(400).json({status:"Failed",message:result.message})
       }

       return res.status(200).json({status:"true",message:result.message})
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  async getNotificationSettByBranchId(req,res){
      const {branchId} = req.params;
    try {
        if(!branchId){
            return res.status(400).json({status:"Failed",message:'No object id provided'})
        }

        const result = await this.notificationUseCase.getByBranchId(branchId);

        if(!result.success){
            return res.status(400).json({status:"Failed",message:"No notification settings found"})
        }

        return res.status(200).json({message:result.message,status:"true",data:result.data})
    } catch (error) {
        console.error(error);
        return res.status(500).json({status:"Failed",message:"Internal server error"})
    }
  }

  async getSettingByProjectAndBranchId(req,res){
    const {projectId,branchId} = req.params;
  try {
       if(!projectId){
        return res.status(400).json({status:"Failed",message:'No project id provided'})
       }

      if(!branchId){
          return res.status(400).json({status:"Failed",message:'No branch id provided'})
      }

      const result = await this.notificationUseCase.getByProjectAndBranch(projectId,branchId);

      if(!result.success){
          return res.status(400).json({status:"Failed",message:"No notification settings found"})
      }

      return res.status(200).json({message:result.message,status:"true",data:result.data})
  } catch (error) {
      console.error(error);
      return res.status(500).json({status:"Failed",message:"Internal server error"})
  }
}
}

export default NotificationSettingController;
