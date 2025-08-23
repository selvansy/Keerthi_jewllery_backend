import { isValidObjectId } from "mongoose";
import config from "../../../../config/chit/env.js";

class ClassificationUseCase {
  constructor(classificationRepository, s3service,s3Repo) {
    this.classificationRepository = classificationRepository;
    this.s3service = s3service;
    this.s3Repo = s3Repo;
  }

  async s3Helper(id_branch){
    try {
      const s3settings = await this.s3Repo.getSettingByBranch(id_branch);

      if (!s3settings) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings[0].s3key,
        s3secret: s3settings[0].s3secret,
        s3bucket_name: s3settings[0].s3bucket_name,
        s3display_url: s3settings[0].s3display_url,
        region: s3settings[0].region,
      };

      return configuration
    } catch (error) {
      console.error(error)
    }
  }

  async addSchemeClassification(data, logo, desc_img) {
    const existingClassificationName =
      await this.classificationRepository.findByName(data.classification_name);

    if (existingClassificationName) {
      return { success: false, message: "Classificaiton name already in use" };
    }

    if (data.typeofscheme === 2) {
      const existingType = await this.classificationRepository.findByOne({
        typeofscheme: data.typeofscheme,
      });

      if (existingType) {
        return {
          success: false,
          message: "Digigold classificaiton already created",
        };
      }
    }

    const s3Configs = await this.s3Helper(data.id_branch)

    if (logo && desc_img) {
      data.logo = await this.s3service.uploadToS3(logo, "classification",s3Configs);
      data.desc_img = await this.s3service.uploadToS3(
        desc_img,
        "classification",
        s3Configs
      );
    }

    const result = await this.classificationRepository.addSchemeClassification(
      data
    );

    if (!result) {
      return { success: false, message: "Failed to create classification" };
    }

    return { success: true, message: "Classification created successfully" };
  }

  async updateClassification(id, data, logo, desc_img) {
    const existingClassification = await this.classificationRepository.findById(
      id
    );

    if (!existingClassification) {
      return { success: false, message: "No classification found" };
    }

    const s3Configs =await this.s3Helper(data.id_branch)
    const keyPath = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}classification/${existingClassification?.logo}`
    try {
      if (logo) {
        if (existingClassification.logo) {
          await this.s3service.deleteFromS3(keyPath,s3Configs);
        }
        data.logo = await this.s3service.uploadToS3(logo, "classification",s3Configs);
      }

      if (desc_img) {
        if (existingClassification.desc_img) {
           const keyPath = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}classification/${existingClassification?.desc_img}`
          await this.s3service.deleteFromS3(keyPath,s3Configs);
        }
        data.desc_img = await this.s3service.uploadToS3(
          desc_img,
          "classification",
          s3Configs
        );
      }
    } catch (error) {
      console.error("Error during S3 operations:", error);
      return { success: false, message: "Error updating S3 files" };
    }

    const result = await this.classificationRepository.updateClassification(
      id,
      data
    );

    if (!result) {
      return { success: false, message: "Failed to update classification" };
    }

    return { success: true, message: "Classification updated successfully" };
  }

  async findById(id) {
    const result = await this.classificationRepository.findById(id);

    if (!result) {
      return { success: false, message: "No classification found" };
    }
    const s3Configs =await this.s3Helper(result.id_branch)
    result.pathUrl = `${s3Configs.s3display_url}keerthijewellery/webadmin/assets/classification/`
    // result.pathUrl = `https://${config.AWS_S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/keerthijewellery/webadmin/assets/img/classification/`;
    return {
      success: true,
      message: "Classification retrieved successfully",
      data: result,
    };
  }

  async getAllClassifications(page, limit, search,data) {
    const {from_date,to_date,typesofscheme,id_branch}= data

    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    let filter = {};

    if (id_branch && isValidObjectId(id_branch)) {
      filter.id_branch = id_branch;
    }

    if (from_date) {
      const fromDate = new Date(data.from_date);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ message: "Invalid from_date format" });
      }
      filter.createdAt = { ...(filter.createdAt || {}), $gte: fromDate };
    }


    if (to_date) {
      const toDate = new Date(to_date);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ message: "Invalid to_date format" });
      }
      filter.createdAt = { ...(filter.createdAt || {}), $lte: toDate };
    }

    if (typesofscheme) {      
      filter.typeofscheme = typesofscheme;
    }

    const searchTerm = search || "";

    const searchCriteria = searchTerm
      ? {
          $or: [{ classification_name: { $regex: searchTerm, $options: "i" } }],
        }
      : {};


      const filterCriteria = filter || {};

      const query = {
        is_deleted: false,
        ...searchCriteria, 
        ...filterCriteria, 
      };


    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const classtData =
      await this.classificationRepository.getAllClassifications({
        query,
        documentskip,
        documentlimit,
      });

    if (!classtData || classtData.length === 0) {
      return { success: false, message: "No active classifications found" };
    }
    
    return {
      success: true,
      message: "Classifications fetched successfully",
      data: classtData.classData,
      totalCount: classtData.totalCount,
      totalPages: Math.ceil(classtData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async deleteClassification(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }

    const classData = await this.classificationRepository.findById(id);

    if (!classData) {
      return { success: false, message: "No classification found" };
    }

    if (classData.is_deleted) {
      return { success: false, message: "Already deleted classification" };
    }

    const result = await this.classificationRepository.deleteClassification(id);

    if (!result) {
      return { success: false, message: "Failed to deleted classification" };
    }

    return { success: true, message: "Classification deleted successfully" };
  }

  async toggleActiveStatus(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }

    const classData = await this.classificationRepository.findById(id);

    if (!classData) {
      return { success: false, message: "No classification found" };
    }

    if (classData.is_deleted) {
      return {
        success: false,
        message: "Deleted classification unable to activate",
      };
    }

    const updatedClass = await this.classificationRepository.toggleActiveStatus(
      id,
      classData.active
    );

    if (!updatedClass) {
      return {
        success: false,
        message: "Failed to change classification status",
      };
    }

    let message = updatedClass.active
      ? "Classification activated successfully"
      : "Classification deactivated";

    return { success: true, message: message };
  }

  async getAllActiveClassifications() {
    try {
      const data = await this.classificationRepository.findAll({
        active: true,
      });

      if (!data) {
        return { success: false, message: "No classifications found" };
      }

      return {
        success: true,
        message: "Classification data fetched successfully",
        data: data,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching classification data",
      };
    }
  }

  async getClassificationByBranch(id) {
    try {
      if(!isValidObjectId(id)){
        return {success:false,message:"Provide a valid object id"}
      }
      
      const result = await this.classificationRepository.find({
        id_branch: id,
      });

      if (!result) {
        return { success: false, message: "No classification found" };
      }

      result.pathUrl = `https://${config.AWS_S3_BUCKET}.s3.${config.AWS_REGION}.amazonaws.com/keerthijewellery/webadmin/assets/img/classification/`;
      return {
        success: true,
        message: "Classification retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching classification data",
      };
    }
  }

  async getSchemeClassification() {
    try {
      const result = await this.classificationRepository.getSchemeClassification();

      if (result.length < 0) {
        return { success: false, message: "No scheme classification found" };
      }

      return {
        success: true,
        message: "Scheme lassification retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while fetching scheme classification data",
      };
    }
  }
}

export default ClassificationUseCase;