class UseAccessController {
  constructor(useraccessUseCase) {
    this.useraccessUseCase = useraccessUseCase;
  }

  async getUserAccess(req, res) {
    const { roleId } = req.params;
    try {
      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      const result = await this.useraccessUseCase.getUserAccess(roleId);

      if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
      }

      return res
        .status(200)
        .json({ status: true, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserPrermission(req, res) {
    const { roleId } = req.params;
    try {
      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      const result = await this.useraccessUseCase.getUserPrermission(roleId);

      if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
      }

      return res
        .status(200)
        .json({ status: true, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getActiveMenuAccess(req, res) {
    // const { roleId } = req.params;
    try {
      const roleId = req.user.id_role._id
      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      const result = await this.useraccessUseCase.getActiveMenuAccess(roleId);

      if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
      }

      return res
        .status(200)
        .json({ status: true, message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateMenuPermission(req,res){
    const {roleId}= req.params;
    try {
        const {id_submenu}= req.body;

        if(!id_submenu){
            return res.status(400).json({message:"Submenu id is required"})
        }
        if(!roleId){
            return res.status(400).json({message:'Role id is required'})
        }

        const result = await this.useraccessUseCase.updateMenuPermission(req.body,roleId);

        if(!result.success){
            return res.status(400).json({message:result.message})
        }

        return res.status(201).json({message:result.message})
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'Internal server error'})
    }
  }
}

export default UseAccessController;
