import SchemeTypeModel from '../../models/chit/schemeTypeModel.js'

class SchemeTypeRepository{
    async findOne(query) {
        const Data = await SchemeTypeModel.findOne(query);
        if (!Data) return null;
        return {
            scheme_typename: Data.scheme_typename,
            _id:Data._id,
            scheme_type:Data.scheme_type
        };
    }

    async find(query) {
        const Data = await SchemeTypeModel.find(query)
        .select('_id scheme_typename active is_deleted scheme_type')

        if (!Data) return null;
        return Data
    }

    async addSchemeType (data){
        const {scheme_typename}= data
        const newSchemetype = new SchemeTypeModel({
            scheme_typename
        });
        
        const savedData = await newSchemetype.save();
        if (!savedData) return null;
        
        return savedData;
    }
    
    async findById(id){
        const Data= await SchemeTypeModel.findById(id);

        if(!Data) return null;
        return {
            scheme_typename:Data.scheme_typename,
            _id:Data._id,
            active:Data.active,
            scheme_type:Data.scheme_type
        };
    }

    async editSchemeType(id,data){
        const updatedData = await SchemeTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: data },
            { new: true } 
        );

        if(!updatedData) return null;

        return updatedData
    }

    async changeSchemeTypeStatus(id,active){
        const updatedType = await SchemeTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: { active:!active} },
            { new: true } 
        );

        if(!updatedType) return null;

        return updatedType;
    }

    
    async deleteSchemeType(id){
        const updatedProject = await SchemeTypeModel.findOneAndUpdate(
            { _id: id }, 
            { $set: {is_deleted: true,active:false} },
            { new: true } 
        );
        
        if(!updatedProject){
            return null
        }
        
        return updatedProject;
    }

    async schemeTypeTable({query,documentskip,documentlimit}){
        const totalCount= await SchemeTypeModel.countDocuments()
        const Data= await SchemeTypeModel.find(query).skip(documentskip).limit(documentlimit)
        .select('scheme_typename _id active scheme_type');
        if(!Data) return null;
    
        return {data:Data,totalCount};
    }
}

export default SchemeTypeRepository;