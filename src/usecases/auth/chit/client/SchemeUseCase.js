import { isValidObjectId } from "mongoose";
import config from "../../../../config/chit/env.js";

class SchemeUseCase {
  constructor(
    schemeRepository,
    metalRepository,
    purityRepository,
    s3Repo,
    s3Service
  ) {
    this.schemeRepository = schemeRepository;
    this.s3Repo = s3Repo;
    this.metalRepository = metalRepository;
    this.purityRepository = purityRepository;
    this.s3service = s3Service;
  }

  async s3Helper() {
    try {
      let s3settings = await this.s3Repo.getSetting()

      if (!s3settings) {
        return { success: false, message: "S3 configuration not found" };
      }

      const configuration = {
        s3key: s3settings.s3key,
        s3secret: s3settings.s3secret,
        s3bucket_name: s3settings.s3bucket_name,
        s3display_url: s3settings.s3display_url,
        region: s3settings.region,
      };

      return configuration;
    } catch (error) {
      console.error(error);
    }
  }

  async addScheme(data, logo, desc_img) {
    const existingScheme = await this.schemeRepository.findScheme({
      code: data.code,
      id_branch: data.id_branch,
      is_deleted: false,
    });

    if (existingScheme) {
      return { success: false, message: "Scheme code is already in use" };
    }

    if (data.scheme_type === 10) {
      const existingScheme_type = await this.schemeRepository.findOne({
        scheme_type: data.scheme_type,
        is_deleted: false,
      });

      if (existingScheme_type && existingScheme_type.scheme_type === 10) {
        return { success: false, message: "Digigold scheme already exists" };
      }
    }

    if (data.scheme_type === 14) {
      const existingScheme_type = await this.schemeRepository.findOne({
        scheme_type: data.scheme_type,
        is_deleted: false,
      });

      if (existingScheme_type && existingScheme_type.scheme_type === 11) {
        return { success: false, message: "Digisilver scheme already exists" };
      }
    }

    const s3Configs = await this.s3Helper(data.id_branch);

    try {
      if (logo) {
        data.logo = await this.s3service.uploadToS3(
          logo[0],
          "classification",
          s3Configs
        );
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error("Failed to upload logo. Please try again.");
    }

    try {
      if (desc_img) {
        data.desc_img = await this.s3service.uploadToS3(
          desc_img[0],
          "classification",
          s3Configs
        );
      }
    } catch (error) {
      console.error("Error uploading desc_img:", error);
      throw new Error("Failed to upload description image. Please try again.");
    }

    const schemetData = await this.schemeRepository.addScheme(data);

    if (!schemetData) {
      return { success: false, message: "Failed to create scheme" };
    }

    return { success: true, message: "Scheme created" };
  }

  async updateScheme(id, data, logo, desc_img) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Not a valid ID" };
    }
    const existingScheme = await this.schemeRepository.findScheme({
      _id: { $ne: id },
      code: data?.code,
      ...(data?.id_branch && { id_branch: data.id_branch }),
    });

    if (existingScheme) {
      return { success: false, message: "Scheme is already in use" };
    }

    const scheme = await this.schemeRepository.findById(id);
    if (!scheme) {
      return { success: false, message: "Scheme not found" };
    }

    const updateFields = { created_by: data.createdBy, date_upd: new Date() };

    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined) {
        if (
          [
            "min_fund",
            "max_fund",
            "min_amount",
            "max_amount",
            "fine_amount",
            "reduce_fine_amount",
          ].includes(key) &&
          key !== ""
        ) {
          updateFields[key] = parseFloat(data[key]).toFixed(2);
        } else {
          updateFields[key] = data[key];
        }
      }
    });
    0;

    const s3Configs = await this.s3Helper(data.id_branch);

    try {
      if (logo) {
        updateFields.logo = await this.s3service.uploadToS3(
          logo[0],
          "classification",
          s3Configs
        );
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error("Failed to upload logo. Please try again.");
    }

    try {
      if (desc_img) {
        updateFields.desc_img = await this.s3service.uploadToS3(
          desc_img[0],
          "classification",
          s3Configs
        );
      }
    } catch (error) {
      console.error("Error uploading desc_img:", error);
      throw new Error("Failed to upload description image. Please try again.");
    }

    const updatedScheme = await this.schemeRepository.updateScheme(
      id,
      updateFields
    );

    if (!updatedScheme) {
      return { success: false, message: "Failed to update scheme" };
    }

    return { success: true, message: "Scheme updated successfully" };
  }

  async schemesTableData(filter, page, limit) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const query = {
      is_deleted: false,
      active: true,
      ...filter,
    };

    const schemeData = await this.schemeRepository.schemesTableData({
      query,
      documentskip,
      documentlimit,
    });

    if (!schemeData || schemeData.data.length === 0) {
      return { success: false, message: "No active schemes found" };
    }

    return {
      success: true,
      message: "Schemes fetched successfully",
      data: schemeData.data,
      totalCount: schemeData.totalCount,
      totalPages: Math.ceil(schemeData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async getSchemeById(id) {
    const result = await this.schemeRepository.findById(id);

    if (!result) {
      return { success: false, message: "No scheme found" };
    }

    const s3Configs = await this.s3Helper(result.id_branch);
    result.pathUrl = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}classification/`;

    return {
      success: true,
      message: "Scheme retrieved successfully",
      data: result,
    };
  }

  async getSchemeByBrachId(branchId) {
    const result = await this.schemeRepository.getSchemeByBrachId({
      id_branch: branchId,
    });

    if (!result) {
      return { success: false, message: "No scheme found" };
    }

    return {
      success: true,
      message: "Scheme retrieved successfully",
      data: result,
    };
  }

  async deleteScheme(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid ID" };
    }

    const schemData = await this.schemeRepository.findById(id);

    if (!schemData) {
      return { success: false, message: "No scheme found" };
    }

    if (schemData.is_deleted) {
      return { success: false, message: "Already deleted scheme" };
    }

    const result = await this.schemeRepository.deleteScheme(id);

    if (!result) {
      return { success: false, message: "Failed to deleted scheme" };
    }

    return { success: true, message: "Scheme deleted successfully" };
  }

  async toggleSchemeStatus(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }

    const schemeData = await this.schemeRepository.findById(id);

    if (!schemeData) {
      return { success: false, message: "No classification found" };
    }

    if (schemeData.is_deleted) {
      return {
        success: false,
        message: "Deleted classification unable to activate",
      };
    }

    const updatedScheme = await this.schemeRepository.toggleSchemeStatus(
      id,
      schemeData.active
    );

    if (!updatedScheme) {
      return {
        success: false,
        message: "Failed to change classification status",
      };
    }

    let message = updatedScheme.active
      ? "Scheme activated successfully"
      : "Scheme deactivated";

    return { success: true, message: message };
  }

  async getAllActiveSchemes() {
    try {
      const schemeData = await this.schemeRepository.findAll({ active: true });

      if (!schemeData) {
        return { success: false, message: "No active schemes found" };
      }

      return {
        success: true,
        message: "Schemes fetched successfully",
        data: schemeData,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while fetching scheme data" };
    }
  }

  async getAllBranchScheme(branchId) {
    try {
      if (!isValidObjectId(branchId)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const result = await this.schemeRepository.find({
        id_branch: branchId,
        active: true,
      });

      if (result.length === 0) {
        return { success: false, message: "No scheme account found" };
      }

      delete result.is_deleted;
      delete result.active;
      return {
        success: true,
        message: "Scheme account data retrieved successfully",
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting scheme account data",
      };
    }
  }

  async getSchemeByclassificationId(id) {
    const s3Configs = await this.s3Helper()
    const pathurl= `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}classification/`

    let result = await this.schemeRepository.getSchemeByclassificationId(id);

    if (!result) {
      return { success: false, message: "No scheme found" };
    }

    return {
      success: true,
      message: "Scheme retrieved successfully",
      data: result,
      pathurl:pathurl
    };
  }

  async getDigigoldStaticData() {
    try {
      const [goldMetal, silverMetal] = await Promise.all([
        this.metalRepository.findOne({ id_metal: 1,active:true}),
        this.metalRepository.findOne({ id_metal: 2,active:true}),
      ]);

      if (!goldMetal || !silverMetal) {
        return {
          success: false,
          message: "Metal data not found for gold or silver",
        };
      }

      const [gold, silver, classificationData] = await Promise.all([
        this.purityRepository.find({ id_metal: goldMetal[0]._id,active:true}),
        this.purityRepository.find({ id_metal: silverMetal[0]._id,active:true}),
        this.schemeRepository.findByOrder(1),
      ]);

      if (!gold || !silver) {
        return {
          success: false,
          message: "No purity data found for one or both metals",
        };
      }

      const combinedOutputData = {
        gold,
        silver,
        classification: classificationData ? classificationData._id : null,
        id_gold: goldMetal[0],
        id_silver: silverMetal[0],
      };

      return {
        success: true,
        message: "Digigold data fetched successfully",
        data: combinedOutputData,
      };
    } catch (error) {
      console.error("Error fetching Digigold static data:", error);
      return { success: false, message: "Failed to fetch Digigold data" };
    }
  }

  async getDelistSchemes(filter, page, limit) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const query = {
      is_deleted: false,
      active: false,
      ...filter,
    };

    const schemeData = await this.schemeRepository.getDelistSchemes({
      query,
      documentskip,
      documentlimit,
    });

    if (!schemeData || schemeData.data.length === 0) {
      return { success: false, message: "No schemes found" };
    }

    return {
      success: true,
      message: "Delisted schemes fetched successfully",
      data: schemeData.data,
      totalCount: schemeData.totalCount,
      totalPages: Math.ceil(schemeData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async getDigiGoldSchemes(type) {
    try {
      const result = await this.schemeRepository.find({
        scheme_type: Number(type),
        active: true,
      });

      if (result.length === 0) {
        return { success: false, message: "No scheme account found" };
      }

      let message =
        type == 10
          ? "Digigold scheme fetched successfully"
          : "Digi silver scheme fetched successfully";

      delete result.is_deleted;
      delete result.active;
      return {
        success: true,
        message: message,
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Error while getting scheme account data",
      };
    }
  }
}

export default SchemeUseCase;
