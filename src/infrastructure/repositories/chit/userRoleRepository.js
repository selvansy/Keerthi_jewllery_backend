import userRoleModel from '../../models/chit/userRoleModel.js'

class UserRoleRepository{
    async findById(id){
        try {
            const roleData = await userRoleModel.findById(id)

            if(!roleData){
                return null
            }

            return roleData;
        } catch (error) {
            console.error(error)
        }
    }

    async findByBranch(branchId){
        try {
            const roleData = await userRoleModel.findOne({id_branch:branchId})

            if(!roleData){
                return null
            }

            return roleData;
        } catch (error) {
            console.error(error)
        }
    }

    async addUserRole(data){
        try {
            const savedData = await userRoleModel.create(data)

            if(!savedData){
                return null
            }

            return savedData;
        } catch (error) {
            console.error(error)
        }
    }

    async findOne(name){
        try {
            const exists = await userRoleModel.findOne({role_name:name,is_deleted:false});

            if(!exists){
                return null
            }

            return exists;
        } catch (error) {
            console.error(error)
        }
    }

    async checkExists(id, name) {
        try {
            const exists = await userRoleModel.findOne(
                { _id: { $ne: id }, role_name: name }
            );
    
            if (!exists) {
                return null;
            }
    
            return exists;
        } catch (error) {
            console.error(error);
        }
    }

    async updateUserRole(id,data){
        try {
            const updatedData = await userRoleModel.updateOne(
              {_id:id},
              {$set:data}
            );

            if(updatedData.matchedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }

    async deleteUserRole(id){
        try {
            const updatedData = await userRoleModel.updateOne(
              {_id:id},
              {$set:{is_deleted:true,active:false}}
            );

            if(updatedData.modifiedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }

    async activateUserRole(id,active){
        try {
            const updatedData = await userRoleModel.updateOne(
              {_id:id},
              {$set:{active:!active}}
            );

            if(updatedData.modifiedCount === 0){
                return null
            }

            return updatedData;
        } catch (error) {
            console.error(error)
        }
    }

    async getUserRolesTable({ query, documentskip, documentlimit }) {
        try {
            const totalCount = await userRoleModel.countDocuments(query);
            const data = await userRoleModel
                .find(query)
                .skip(documentskip)
                .limit(documentlimit)
                .select('_id role_name id_role active')

            if (!data || data.length === 0) return null;

            return { data, totalCount };
        } catch (error) {
            console.error("Error in getAllMetals:", error);
            throw new Error("Database error occurred while fetching all metals.");
        }
    }
    
    async find(query) {
        try {
            const exists = await userRoleModel.find(query);
    
            if (!exists) {
                return null;
            }
    
            return exists;
        } catch (error) {
            console.error(error);
        }
    }

    async getAllUserRoleSetting(filte) {
        try {
            const exists = await userRoleModel.find(filte).sort({_id:-1});
    
            if (!exists) {
                return null;
            }
    
            return exists;
        } catch (error) {
            console.error(error);
        }
    }
}

export default UserRoleRepository;