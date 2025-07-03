import DepartmentModel from '../../models/chit/departmentModel.js'

class DepartmentRepository{
    
    async findOne(query) {
        const Data = await DepartmentModel.findOne(query);
        if (!Data) return null;
        return {
            name: Data.name,
            // _id:Data._id,
        };
    }

    async find(query) {
        const Data = await DepartmentModel.find(query)
        .select('_id name active is_deleted ')

        if (!Data) return null;
        return Data
    }

    async addDepartment (data){
        const {name}= data
        const newDepartment = new DepartmentModel({
            name
        });
        
        const savedData = await newDepartment.save();
        if (!savedData) return null;
        
        return savedData;
    }
    
    async findById(id){
        const Data= await DepartmentModel.findById(id);

        if(!Data) return null;
        return {
            name:Data.name,
            _id:Data._id,
            active:Data.active,
        };
    }

    async editDepartment(id,data){
        const updatedData = await DepartmentModel.findOneAndUpdate(
            { _id: id }, 
            { $set: data },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async changeDepartmentStatus(id,active){
        const updatedType = await DepartmentModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:!active} },
            { new: true } 
        );

        if(!updatedType) return null;

        return updatedType;
    }

    
    async deleteDepartment(id){
        const updatedProject = await DepartmentModel.findOneAndUpdate(
            { _id: id }, 
            { $set: {is_deleted: true,active:false} },
            { new: true } 
        );
        
        if(!updatedProject){
            return null
        }
        
        return updatedProject;
    }

    async departmentTable({query,documentskip,documentlimit}){
        const modifiedQuery = { ...query, is_deleted: false };

        const totalCount= await DepartmentModel.countDocuments(modifiedQuery)
        const Data= await DepartmentModel.find(modifiedQuery).skip(documentskip).limit(documentlimit)
        .select('name _id active is_deleted');
        if(!Data) return null;
    
        return {data:Data,totalCount};
    }
}

export default DepartmentRepository;