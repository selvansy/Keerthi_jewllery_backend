import { isValidObjectId } from "mongoose";

class userRoleUseCase{
    constructor(userRoleRepository){
        this.userRoleRepository= userRoleRepository;
    }

    async addUserRole(name){
        try {
            const check = name.toUpperCase()
            const exists = await this.userRoleRepository.findOne(check);

            if(exists){
                return {success:false,message:"User role already exists"}
            }
            
            const data = {role_name:name.toUpperCase()}
            const savedData = await this.userRoleRepository.addUserRole(data);

            if(!savedData){
                return {success:false,message:"Failed to create user role"}
            }

            return {success:true,message:'User role created successfully'}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Error while adding user role'}
        }
    }

    async updateUserRole(id,name){
        try {
            if(!isValidObjectId(id)){
                return {success:false,message:"Provide a valid object id"}
            }

            const exists = await this.userRoleRepository.checkExists(id,name.toUpperCase());

            if(exists){
                return {success:false,message:"User role already exists"}
            }

            const data = {role_name:name.toUpperCase()}
            const savedData = await this.userRoleRepository.updateUserRole(id,data);

            if(!savedData){
                return {success:false,message:"Failed to update user role"}
            }

            return {success:true,message:'User role updated successfully'}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Error while updating user role'}
        }
    }

    async deletedRole(id){
        try {
            if(!isValidObjectId(id)){
                return {success:false,message:"Provide a valid object id"}
            }
            
            const exists = await this.userRoleRepository.findById(id);

            if(!exists){
                return {success:false,message:"User role not found"}
            }

            if(exists.is_deleted){
                return {success:false, message:"Already deleted user role"}
            }
            
            const savedData = await this.userRoleRepository.deleteUserRole(id);

            if(!savedData){
                return {success:false,message:"Failed to delete user role"}
            }

            return {success:true,message:'User role deleted successfully'}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Error while deleting user role'}
        }
    }

    async activateUserRole(id){
        try {
            if(!isValidObjectId(id)){
                return {success:false,message:"Provide a valid object id"}
            }
            
            const exists = await this.userRoleRepository.findById(id);

            if(!exists){
                return {success:false,message:"User role not found"}
            }

            if(exists.is_deleted){
                return {success:false, message:"Deleted role action not permited"}
            }
            
            const savedData = await this.userRoleRepository.activateUserRole(id,exists.active);

            if(!savedData){
                return {success:false,message:"Failed to update user role"}
            }

            let message = exists.active ?
            "User role successfully deactivated" : "User role activated successfully"

            return {success:true,message:message}
        } catch (error) {
            console.error(error);
            return {success:false,message:'Error while updating user role'}
        }
    }

    async getUserRoleById(id){
        try {
            if(!isValidObjectId(id)){
                return {success:false,message:'Provide a valid object id'}
            }

            const roleData = await this.userRoleRepository.findById(id)

            if(!roleData){
                return {success:false,message:"No user roles found"}
            }

            return {success:true, message:'User roles fetched successfully',data:roleData}
        } catch (error) {
            console.error(error);
            return {success:false, message:'Error while fetching user role data'}
        }
    }

    async getByBranchId(branchId){
        try {
            if(!isValidObjectId(id)){
                return {success:false,message:'Provide a valid object id'}
            }

            const roleData = await this.userRoleRepository.findByBranch(branchId)

            if(!roleData){
                return {success:false,message:"No user roles found"}
            }

            return {success:true, message:'User roles fetched successfully',data:roleData}
        } catch (error) {
            console.error(error);
            return {success:false, message:'Error while fetching user role data'}
        }
    }

    async getUserRolesTable(page, limit, search) {
        try {
          const pageNum = page ? parseInt(page) : 1;
          const pageSize = limit ? parseInt(limit) : 10;
    
          const searchTerm = search || "";
    
          const searchCriteria = searchTerm
            ? {
                $or: [
                  { role_name: { $regex: searchTerm, $options: "i" } }
                ],
              }
            : {};
    
          const query = {
            is_deleted:false,
            ...searchCriteria,
          };
    
          const documentskip = (pageNum - 1) * pageSize;
          const documentlimit = pageSize;
    
          const Data = await this.userRoleRepository.getUserRolesTable({
            query,
            documentskip,
            documentlimit,
          });
    
          if (!Data || Data.length === 0) {
            return { success: false, message: "No data found" };
          }
    
          return {
            success: true,
            message: "Data fetched successfully",
            data: Data.data,
            totalCount: Data.totalCount,
            totalPages: Math.ceil(Data.totalCount / pageSize),
            currentPage: pageNum,
          };
        } catch (error) {
          console.error("Error in getAllActiveSubMenus:", error);
          return { success: false, message: "An error occurred while fetching data" };
        }
      }

      async getAllUserRoles(){
        try {
            const roleData = await this.userRoleRepository.find({active:true})
            
            if(!roleData){
                return {success:false,message:"No user roles found"}
            }

            return {success:true, message:'User roles fetched successfully',data:roleData}
        } catch (error) {
            console.error(error);
            return {success:false, message:'Error while fetching user role data'}
        }
    }

    async getAllUserRoleSetting(data){
        try {
            const {id_project, id_client, id_branch}= data;

            let filter = {};
            if (id_project) {
              filter.id_project = id_project;
            }
          
            if (id_client) {
              filter.id_client = id_client;
            }
          
            if (id_branch) {
              filter.id_branch = id_branch;
            }
          
            filter = {active: { $ne: false }};
            const roleData = await this.userRoleRepository.getAllUserRoleSetting(filter)

            if(!roleData){
                return {success:false,message:"No user roles found"}
            }

            return {success:true, message:'User roles fetched successfully',data:roleData}
        } catch (error) {
            console.error(error);
            return {success:false, message:'Error while fetching user role data'}
        }
    }
}

export default userRoleUseCase;