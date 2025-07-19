import classificationModel from "../../models/chit/classificationModel.js";
import schemeAccountModel from "../../models/chit/schemeAccountModel.js"
import schemeClassificationModel from "../../models/chit/schemeClassificationModel.js";

class ClassificationRepository {
  async findByName(name) {
    const Data = await classificationModel.findOne({
      classification_name: name,
    });

    if (!Data) {
      return null;
    }
    return {
      classification_name: Data.classification_name,
      classificaiton_order: Data.classificaiton_order,
      active: Data.active,
    };
  }

  async find(query) {
    const Data = await classificationModel.find(query).lean();

    if (!Data) {
      return null;
    }
    return Data;
  }

  async findByOne(query) {
    const Data = await classificationModel.findOne(query).lean();

    if (!Data) {
      return null;
    }
    return Data;
  }

  async findAll(query) {
    const Data = await classificationModel.findOne(query);

    if (!Data) {
      return null;
    }
    return Data;
  }

  async findById(id) {
    const classData = await classificationModel.findById(id)
    .lean()

    if (classData) {
      return classData;
    }

    return null;
  }

  async addSchemeClassification(data) {
    const classData = await classificationModel.create(data);

    if (!classData) {
      return null;
    }
    return classData;
  }

  async updateClassification(id, data) {
    const result = await classificationModel.updateOne(
      { _id: id },
      { $set: data }
    );

    if (result.modifiedCount > 0) {
      return result;
    } else {
      return null;
    }
  }

  async getAllClassifications({ query, documentskip, documentlimit }) {
    try {
      const totalCount = await classificationModel.countDocuments(query)
    const classData = await classificationModel
      .find(query)
      .skip(documentskip)
      .limit(documentlimit);

    if (!classData) return null;
    
    const enrichedClassData = await Promise.all(
      classData.map(async (item) => {
        const count = await schemeAccountModel.countDocuments({ id_classification: item._id });
        return {
          ...item.toObject(),
          totalJoins: count,
        };
      })
    );
    
    return {classData:enrichedClassData,totalCount}
    } catch (error) {
      console.error(error)
    }
  }

  async deleteClassification(id) {
    const classData = await classificationModel.updateOne(
      { _id: id },
      { $set: { is_deleted: true, active: false } }
    );

    if (classData.modifiedCount == 1) {
      return classData;
    }

    return null;
  }

  async toggleActiveStatus(id,active){
    const classData= await classificationModel.findOneAndUpdate(
    {_id:id},
    {$set:{active:!active}},
    { new: true } 
    );

    if (classData) {
        return classData;
      }
  
      return null;
  }

  //scheme classification 
  async getSchemeClassification(){
    const classData= await schemeClassificationModel.find({active:true,is_deleted:false})

    if (classData.length > 0) {
        return classData;
      }
  
      return null;
  }
}

export default ClassificationRepository;
