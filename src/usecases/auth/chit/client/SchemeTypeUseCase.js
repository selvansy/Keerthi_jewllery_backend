import { isValidObjectId } from "mongoose";

class SchemeTypeUseCase {
  constructor(schemeTypeRepository) {
    this.schemeTypeRepository = schemeTypeRepository;
  }
  async addSchemeType(data) {
    const schemetypename = data.scheme_typename;
    const exisitsData = await this.schemeTypeRepository.findOne({
      scheme_typename: schemetypename,
    });

    if (exisitsData) {
      return { success: false, message: "Scheme Type Name is already in use" };
    }

    const savedData = this.schemeTypeRepository.addSchemeType(data);

    if (!savedData) {
      return { success: false, message: "Failed to create scheme type" };
    }

    return { success: true, message: "Scheme type created successfully" };
  }

  async editSchemeType(id, data) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Not a valid object ID" };
    }
    const exisitsData = await this.schemeTypeRepository.findById(id);

    if (!exisitsData) {
      return { success: false, message: "No scheme type found" };
    }

    const savedData = this.schemeTypeRepository.editSchemeType(id, data);

    if (!savedData) {
      return { success: false, message: "Failed to update scheme type" };
    }

    return { success: true, message: "Scheme type updated successfully" };
  }

  async deleteSchemeType(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Not a valid object ID" };
    }

    const Data = await this.schemeTypeRepository.findById(id);

    if (!Data) {
      return { success: false, message: "No scheme type found" };
    }

    if (Data.is_deleted) {
      return { success: false, message: "Already deleted scheme type" };
    }

    const result = await this.schemeTypeRepository.deleteSchemeType(id);

    if (!result) {
      return { success: false, message: "Failed to deleted scheme type" };
    }

    return { success: true, message: "Scheme type deleted successfully" };
  }

  async changeSchemeTypeStatus(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid object ID" };
    }

    const Data = await this.schemeTypeRepository.findById(id);

    if (!Data) {
      return { success: false, message: "No scheme type found" };
    }

    if (Data.is_deleted) {
      return {
        success: false,
        message: "Deleted scheme type unable to activate",
      };
    }

    const updatedType = await this.schemeTypeRepository.changeSchemeTypeStatus(
      id,
      Data.active
    );

    if (!updatedType) {
      return { success: false, message: "Failed to change scheme type status" };
    }

    let message = updatedType.active
      ? "Scheme activated successfully"
      : "Scheme deactivated";

    return { success: true, message: message };
  }

  async getSchemeTypeByid(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid object ID" };
    }

    const schemeType = await this.schemeTypeRepository.findById(id);

    if (schemeType) {
      return {
        success: true,
        message: "Scheme type retrived successfully",
        data: schemeType,
      };
    }

    return { success: false, message: "No scheme type found" };
  }

  async getAllActiveSchemeTypes() {
   try {
       const schemeTypeData = await this.schemeTypeRepository.find({active:true});

       if(!schemeTypeData){
        return {success:false,message:"No scheme types data found"}
       }

       return {success:true, message:"Scheme types data fetched successfully",data:schemeTypeData}
   } catch (error) {
    console.error(error);
    return {success:false,message:"Error while getting all scheme types"}
   }
  }

  async schemeTypeTable(page, limit, search) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
      ? {
          $or: [
            { scheme_typename: { $regex: searchTerm, $options: "i" } },
            ...(isNaN(Number(searchTerm))
              ? []
              : [{ scheme_type: Number(searchTerm) }]),
          ],
        }
        : {};

      const query = {
        active: true,
        ...searchCriteria,
      };

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.schemeTypeRepository.schemeTypeTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No active schemes found" };
      }

      return {
        success: true,
        message: "Schemes fetched successfully",
        data: Data.data,
        totalCount: Data.totalCount,
        totalPages: Math.ceil(Data.totalCount / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }
}
export default SchemeTypeUseCase;