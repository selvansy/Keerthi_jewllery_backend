import ProjectModel from '../../models/chit/projectMode.js'

class ProjectRepository { 
    
    async findByName(name) {
        const projectData = await ProjectModel.findOne({
            project_name: name});
        if (!projectData) return null;
        return {
            project_name: projectData.project_name,
            _id:projectData._id
        };
    }

    async getAllProjects() {
        const projectData = await ProjectModel.find({is_deleted:false});
        if (!projectData) return null;
        return projectData;
    }

    async findById(id){
        const projectData= await ProjectModel.findById(id);

        if(!projectData) return null;

        return projectData;
    }

    async addProject (data){
        const savedProject = await ProjectModel.create(data);
        if (!savedProject) return null;

        return {
            name: savedProject.name
        };
    }

    async updateProject(id,name){
        const updatedProject = await ProjectModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { name: name } },
            { new: true } 
        );

        if(!updatedProject) return null;

        return updatedProject
    }

    async toggleProjectStatus(id,active){
        const updatedProject = await ProjectModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:!active} },
            { new: true } 
        );

        if(!updatedProject) return null;

        return updatedProject
    }

    async getAllActiveProjects({query,documentskip,documentlimit}){
        const projectData= await ProjectModel.find(query).skip(documentskip).limit(documentlimit)

        if(!projectData) return null;

        return projectData;
    }

    async deleteProject(id){
        const updatedProject = await ProjectModel.findOneAndUpdate(
            { _id: id }, 
            { $set: {is_deleted: true,active:false} },
            { new: true } 
        );

        if(!updatedProject){
            return null
        }

        return updatedProject;
    }

    async findId(query){
        const projectData= await ProjectModel.findOne(query);

        if(!projectData) return false;

        return projectData;
    }
}

export default ProjectRepository;