import projectAccessModel from '../../../models/chit/projectAccessModel.js';

class ProjectAccessRepository { 
    async addProjectAccess(data) {
        return await projectAccessModel.create(data);
    }

    async updateProjectAccess(id, data) {
        return await projectAccessModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteProjectAccess(id) {
        return await projectAccessModel.updateOne(
            {_id:id},
            {$set:{is_deleted:true,active:false}}
        );
    }

    async activateProjectAccess(id,active) {
        return await projectAccessModel.updateOne({_id:id}, { active: !active }, { new: true });
    }

    async getProjectAccessById(id) {
        return await projectAccessModel.findById(id)
        .select('-__v -createdAt -updatedAt')
    }

    async getAllActiveProjectAccess() {
        return await projectAccessModel.find({ active: true });
    }

    async projectAccessTable(filter,skip, limit) {
        try {
            const documnetCount = projectAccessModel.countDocuments(filter);
            const data = projectAccessModel.find(filter)
            .populate(
                [
                    {
                        path:"id_client",
                        select:('company_name')
                    },
                    {
                        path:'id_branch',
                        select:('branch_name')
                    },
                    {
                        path:'id_project',
                        select:('project_name _id')
                    }
                ]
            )
            .skip(skip)
            .limit(limit)

            if(!data){
                return null
            }

            return {data,documnetCount};
        } catch (error) {
            
        }
        return await projectAccessModel.find(filter);
    }

    async findWithPagination(filter, skip, limit) {
        try {
          return await projectAccessModel.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_branch')
            .populate('id_client')
            .populate({
              path: 'id_client',
              populate: {
                path: 'id_project',
                model: 'Project',
              },
            })
            .exec();
        } catch (error) {
          console.error('Error fetching project access:', error);
          throw error;
        }
      }

      async getBranchByClientId(id) {
        try {
            const data = await projectAccessModel
                .find({ id_client: id })
                .populate({
                    path: "id_branch",
                    select: "branch_name _id",
                })
                .select("_id id_branch")
                .lean();
                
            return data.length > 0 ? data : null;
        } catch (error) {
            console.error("Error in getBranchByClientId:", error);
            throw new Error("Failed to get branch by client ID");
        }
    }  
}

export default ProjectAccessRepository;