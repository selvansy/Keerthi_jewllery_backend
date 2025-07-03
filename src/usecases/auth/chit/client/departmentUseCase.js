import { isValidObjectId } from "mongoose";

class DepartmentUseCase {
  constructor(departmentRepository) {
    this.departmentRepository = departmentRepository;
  }
  async addDepartment(data) {
    const departmentname = data.name;
    const exisitsData = await this.departmentRepository.findOne({
      name: departmentname,
    });

    if (exisitsData) {
      return { success: false, message: "Department is already in use" };
    }

    const savedData = this.departmentRepository.addDepartment(data);

    if (!savedData) {
      return { success: false, message: "Failed to create department" };
    }

    return { success: true, message: "Department created successfully" };
  }

  async editDepartment(id, data) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Not a valid object ID" };
    }
    const exisitsData = await this.departmentRepository.findById(id);

    if (!exisitsData) {
      return { success: false, message: "No department found" };
    }

    const savedData = this.departmentRepository.editDepartment(id, data);

    if (!savedData) {
      return { success: false, message: "Failed to update department" };
    }

    return { success: true, message: "Department updated successfully" };
  }

  async deleteDepartment(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Not a valid object ID" };
    }

    const Data = await this.departmentRepository.findById(id);

    if (!Data) {
      return { success: false, message: "No department found" };
    }

    if (Data.is_deleted) {
      return { success: false, message: "Already deleted department" };
    }

    const result = await this.departmentRepository.deleteDepartment(id);

    if (!result) {
      return { success: false, message: "Failed to deleted department" };
    }

    return { success: true, message: "Department deleted successfully" };
  }

  async changeDepartmentStatus(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid object ID" };
    }

    const Data = await this.departmentRepository.findById(id);

    if (!Data) {
      return { success: false, message: "No department found" };
    }

    if (Data.is_deleted) {
      return {
        success: false,
        message: "Deleted department unable to activate",
      };
    }

    const updatedType = await this.departmentRepository.changeDepartmentStatus(
      id,
      Data.active
    );

    if (!updatedType) {
      return { success: false, message: "Failed to change department status" };
    }

    let message = updatedType.active
      ? "Department activated successfully"
      : "Department deactivated";

    return { success: true, message: message };
  }

  async getDepartmentByid(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid object ID" };
    }

    const department = await this.departmentRepository.findById(id);

    if (department) {
      return {
        success: true,
        message: "Department retrived successfully",
        data: department,
      };
    }

    return { success: false, message: "No department found" };
  }

  async getAllActiveDepartments() {
   try {
       const departmentData = await this.departmentRepository.find({active:true});

       if(!departmentData){
        return {success:false,message:"No departments data found"}
       }

       return {success:true, message:"Departments data fetched successfully",data:departmentData}
   } catch (error) {
    console.error(error);
    return {success:false,message:"Error while getting all departments"}
   }
  }

  async departmentTable(page, limit, search,active) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const pageSize = limit ? parseInt(limit) : 10;

      const searchTerm = search || "";

      const searchCriteria = searchTerm
      ? {
          $or: [
            { name: { $regex: searchTerm, $options: "i" } },
          ],
        }
        : {};


      let query = {
        is_deleted: false,
        ...searchCriteria,
      };

      if (active === undefined || active === null || active === "") {
        query.active = { $in: [true, false] }; 
      }else{
        query.active = { $in: active }
      }

      const documentskip = (pageNum - 1) * pageSize;
      const documentlimit = pageSize;

      const Data = await this.departmentRepository.departmentTable({
        query,
        documentskip,
        documentlimit,
      });

      if (!Data || Data.length === 0) {
        return { success: false, message: "No active departments found" };
      }

      return {
        success: true,
        message: "Departments fetched successfully",
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
export default DepartmentUseCase;