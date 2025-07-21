import { isValidObjectId } from "mongoose";

class StaffUseCase {
  constructor(staffRepository,hashingService) {
    this.staffRepository = staffRepository;
    this.hashingService= hashingService;
  }
  
  async addStaff(data) {
      const staffData = await this.staffRepository.findOne({id_employee:data.id_employee});

    if (staffData) {
      return { success: false, message: "Staff already exisits" };
    }

    const hashedPassword = await this.hashingService.hashPassword(data.password, 12);
    data.password = hashedPassword;

    const savedStaff = await this.staffRepository.addStaff(data);

    if (!savedStaff) {
      return { success: false, message: "Failed to add new staff" };
    }

    return { success: true, message: "Staff created successfully" };
  }

  async editStaff(id, data) {
    const stafftData = await this.staffRepository.findById(id);

    if (!stafftData) {
      return { success: false, message: "No user found" };
    }

    const hashedPassword = await this.hashingService.hashPassword(data.password, 12);
    data.password = hashedPassword;

    const editedData = await this.staffRepository.editStaff(id,data);

    if (!editedData) {
      return { success: false, message: "Failed to update Staff " };
    }

    return { success: true, message: "Staff data updated successfully" };
  }

  async toggleStaffStatus(id) {
    if(!isValidObjectId(id)){
      return {success:false,message:"Invalid document ID"}
    }

    const staffData = await this.staffRepository.findById(id);

    if (!staffData) {
      return { success: false, message: "No user found" };
    }

    if (staffData.is_deleted == true) {
      return { success: false, message: "Deleted user unable to activate" };
    }

    const updatedData = await this.staffRepository.toggleStaffStatus(
      id,
      staffData.active
    );

    if (!updatedData) {
      return { success: false, message: "Failed to update status" };
    }

    let message = updatedData.active
      ? "Staff activated successfully"
      : "Staff deactivated";

    return { success: true, message: message };
  }

  async getAllStaffs(page, limit, search,active) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSize = limit ? parseInt(limit) : 10;

    const searchTerm = search || "";

    const searchCriteria = searchTerm
      ? { username: { $regex: searchTerm, $options: "i" } }
      : {};

    const query = {
      is_deleted:false,
      ...searchCriteria,
    };

    if(active == true){
      query.active = true
    }
    if(active == false){
      query.active = false
    }

    const documentskip = (pageNum - 1) * pageSize;
    const documentlimit = pageSize;

    const sataffData = await this.staffRepository.getAllStaffs({
      query,
      documentskip,
      documentlimit,
    });

    if (!sataffData || sataffData.length === 0) {
      return { success: false, message: "No active accounts found" };
    }
    return {
      success: true,
      message: "Staff data fetched successfully",
      data: sataffData.data,
      totalCount:sataffData.totalCount,
      totalPages: Math.ceil(sataffData.totalCount / pageSize),
      currentPage: pageNum,
    };
  }

  async deleteStaff(id) {
    if (!isValidObjectId(id)) {
      return { success: false, message: "Invalid document ID" };
    }

    const exisitsData= await this.staffRepository.findById(id)

    if(!exisitsData){
        return {success:false,message:"No user found"}
    }
    
    const Data = await this.staffRepository.deleteProject(id);

    if (!Data) {
      return { success: false, message: "Failed to delete user" };
    }

    return { success: true, message: "User deleted successfully" };
  }

  async getStaffById(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false,message:"Provide a valid object id"}
        }

        const staffData= await this.staffRepository.findById(id)

        if(!staffData){
            return {success:false,message:"No staff found"}
        }

        return {success:true,message:"staff data fetched successfully",data:staffData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"Failed to fetch staff data"}
    }
  }
}

export default StaffUseCase;