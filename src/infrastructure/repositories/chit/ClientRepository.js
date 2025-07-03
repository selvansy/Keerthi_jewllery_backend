import clientModel from '../../models/chit/clientModel.js'

class clientRepository {
    async findByName(name) {
        try {
            const clientData = await clientModel.findOne({ company_name: name });
        if (!clientData) return null;

        return clientData;
        } catch (error) {
            console.error(error)
        }
    }

    async findById(id) {
        try {
            const clientData = await clientModel.findById(id);
        if (!clientData) return null;

        return clientData
        } catch (error) {
            console.error(error)
        }
    }

    async find() {
        try {
            const clientData = await clientModel.find()
            .select('-createdAt -upatedAt')

        if (!clientData) return null;

        return clientData
        } catch (error) {
            console.error(error)
        }
    }

    async addClient(data) {
        try {
            const clientData=  await clientModel.create(data)

        if(!clientData){
            return null
        }

        return clientData;
        } catch (error) {
            console.error(error)
        }
    }

    async updateClient(id,data) {
        try {
            const clientData=  await clientModel.updateOne(
                {_id:id},
                {$set:data}
            )

        if(clientData.matchedCount === 0){
            return null
        }

          return clientData;
        } catch (error) {
            console.error(error)
        }
    }

    async clientTable({query,documentskip,documentlimit}) {
        try {
        const totalCount = await clientModel.countDocuments(query);
        const clientData= await clientModel.find(query).skip(documentskip).limit(documentlimit)
        .select('-createdAt -updatedAt -__v')

        if (!clientData || clientData.length === 0) return null;

        return { clientData, totalCount };
        } catch (error) {
            console.error(error)
        }
    }

    async deleteClient(id){
        try {
            const data = await clientModel.updateOne(
                {_id:id},
                {$set:{is_deleted:true,active:false}}
            )

            if(data.modifiedCount === 0){
                return null;
            }

            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async activateClient(id,active){
        try {
            const data = await clientModel.updateOne(
                {_id:id},
                {$set:{active:!active}}
            )

            if(data.modifiedCount === 0){
                return null;
            }

            return data;
        } catch (error) {
            console.error(error);
        }
    }

    async getProjectByClient(clientId){
        try {
            const data = await clientModel.findOne({_id:clientId})
            .populate(
                {
                    path:'id_project',
                    select:('_id project_name active id_project')
                }
            )
            .select('id_project')
            .lean()

            if(data.modifiedCount === 0){
                return null;
            }

            return data;
        } catch (error) {
            console.error(error);
        }
    }
}

export default clientRepository;