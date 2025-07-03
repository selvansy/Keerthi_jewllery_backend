class UserRoleController{
    constructor(userRoleUseCase){
        this.userRoleUseCase= userRoleUseCase;
    }

    async addUserRole(req,res){
        try {
            const {role_name} = req.body;
            
            if(!role_name){
                return res.statu(400).json({message:'Provide role name'})
            }

            const result = await this.userRoleUseCase.addUserRole(role_name);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'Internal server error'})
        }
    }

    async updateUserRole(req,res){
        const {id}= req.params;
        try {
            const {role_name} = req.body;

            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }
            
            if(!role_name){
                return res.statu(400).json({message:'Provide role name'})
            }

            const result = await this.userRoleUseCase.updateUserRole(id,role_name);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'Internal server error'})
        }
    }

    async deletedRole(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }
            const result = await this.userRoleUseCase.deletedRole(id);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'Internal server error'})
        }
    }

    async activateUserRole(req,res){
        const {id}= req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }
            const result = await this.userRoleUseCase.activateUserRole(id);

            if(!result.success){
                return res.status(400).json({message:result.message})
            }

            return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:'Internal server error'})
        }
    }

    async getUserRoleById(req,res){
        const {id} = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await  this.userRoleUseCase.getUserRoleById(id);

            if(!result.success){
                return res.status(200).json({message:result.message,data:[]})
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getByBranchId(req,res){
        const {branchId} = req.params;
        try {
            if(!id){
                return res.status(400).json({message:"No valid id provided"})
            }

            const result = await  this.userRoleUseCase.getByBranchId(branchId);

            if(!result.success){
                return res.status(200).json({message:result.message,data:[]})
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getUserRolesTable(req, res) {
        try {
            const { page, limit, search } = req.body;
      
            if (!page || isNaN(page) || parseInt(page) <= 0) {
              return res.status(400).json({ message: "Invalid page number" });
            }
            if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
              return res.status(400).json({ message: "Invalid limit number" });
            }
      
            const result = await this.userRoleUseCase.getUserRolesTable(
              page,
              limit,
              search
            );
      
            if (!result || !result.success) {
              return res.status(404).json({ message: result.message });
            }
      
            res.status(200).json({
              message: result.message,
              data: result.data,
              totalDocument: result.totalCount,
              totalPages: result.totalPages,
              currentPage: result.currentPage,
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
          }
      }

      async getAllUserRoles(req,res){
        try {
            const result = await  this.userRoleUseCase.getAllUserRoles();

            if(!result.success){
                return res.status(200).json({message:result.message,data:[]})
            }

            return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getAllUserRoleSetting(req, res) {
        try {
            const data = {...req.body};
            const result = await this.userRoleUseCase.getAllUserRoleSetting(data);
      
            if (!result || !result.success) {
              return res.status(404).json({ message: result.message });
            }
      
            res.status(200).json({
              message: result.message,
              data: result.data,
            });
          } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
          }
      }
}

export default UserRoleController;