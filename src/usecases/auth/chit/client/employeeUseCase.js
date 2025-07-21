import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import config from "../../../../config/chit/env.js";
import { generateReferralCode } from "../../../../utils/cryptoGenerator.js";

class EmployeeUseCase {
  constructor(employeeRepository, s3service,branchRepository,s3Repo) {
    this.employeeRepository = employeeRepository;
    this.s3service = s3service;
    this.branchRepository= branchRepository;
    this.s3Repo= s3Repo;
  }

  async s3Helper(){
    try {
      const s3settings = await this.s3Repo.getSetting();

      // const configData = s3settings[0]

      const configuration = {
        s3key: s3settings?.s3key,
        s3secret: s3settings?.s3secret,
        s3bucket_name: s3settings?.s3bucket_name,
        s3display_url: s3settings?.s3display_url,
        region: s3settings?.region,
      };

      return configuration
    } catch (error) {
      console.error(error)
    }
  }

  async addEmployee(data, uploads,token) {
    try {
      const exisits = await this.employeeRepository.findOne({
        mobile: data.mobile,
      });

      if (exisits) {
        return { success: false, message: "Employee mobile is already exists" };
      }

      if (uploads) {
        const s3Configs = await this.s3Helper(token.id_client);
        const uploadFields = ["image", "resume"];
      
        for (const field of uploadFields) {
          if (uploads[field]?.[0]) {
            try {
              data[field] = await this.s3service.uploadToS3(
                uploads[field][0],
                "employee",
                s3Configs
              );
            } catch (error) {
              console.error(`Error uploading ${field}:`, error);
            }
          }
        }
      }
      data.emp_code = data.mobile;
      const referralCode = generateReferralCode(data.mobile)
      data.referral_code = `Emp-${referralCode}`
      const empCode = generateReferralCode(data.mobile,new Date())
      data.employeeId = `EMP${empCode}`
      const savedData = await this.employeeRepository.addEmployee(data);

      if (!savedData) {
        return { success: false, message: "Failed to add employee" };
      }

      return { success: true, message: "Employee added successfully" };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Error while adding employee" };
    }
  }

  async editEmployee(id, data, uploads,token) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }
      const existingEmployee = await this.employeeRepository.findOne({
        _id: { $ne: id },
        mobile: data.mobile,
        active: true,
      });

      if (existingEmployee) {
        return { success: false, message: "Mobile number already exists" };
      }

      const existingData = await this.employeeRepository.findOne({ _id: id });

      if (!existingData) {
        return { success: false, message: "Employee not found" };
      }

      const fieldsToUpdate = {};
      if (uploads && uploads.image || uploads.resume) {
        const s3Configs = await this.s3Helper(token.id_client)

        try {
          if(uploads && uploads.image){
            if (uploads.image[0].buffer) {
              if (existingData?.image) {
                const removeImage = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}products/${existingData.image}`
                await this.s3service.deleteFromS3(removeImage,s3Configs);
              }
              fieldsToUpdate.image = await this.s3service.uploadToS3(
                uploads.image[0],
                "employee",
                s3Configs
              );
            }
          }

          if(uploads && uploads.resume){
            if (uploads.resume[0].buffer) {
              if (existingData?.resume) {
                const removeResume = `${s3Configs.s3display_url}${config.AWS_LOCAL_PATH}products/${existingData.resume}`
                await this.s3service.deleteFromS3(removeResume,s3Configs);
              }
              fieldsToUpdate.resume = await this.s3service.uploadToS3(
                uploads.resume[0],
                "employee",
                s3Configs
              );
            }
          }
        } catch (uploadError) {
          console.error("Error during file upload processing:", uploadError);
          return { success: false, message: "Error during file upload" };
        }
      }

      const normalizeValue = (key, value) => {
        if (
          ["gender", "aadhar_number"].includes(key) &&
          typeof value === "string"
        ) {
          return Number(value);
        }
        if (value instanceof mongoose.Types.ObjectId) {
          return value.toString();
        }
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      };

      Object.keys(data).forEach((key) => {
        if (
          ["_id", "createdAt", "updatedAt", "__v", "is_deleted"].includes(
            key
          ) ||
          normalizeValue(key, existingData[key]) ===
            normalizeValue(key, data[key])
        ) {
          return;
        }
        fieldsToUpdate[key] = data[key];
      });

      if (Object.keys(fieldsToUpdate).length === 0) {
        return { success: false, message: "No fields to update" };
      } else {
        fieldsToUpdate.date_upd = Date.now();
      }

      if(!existingData?.employeeId){
        const idCode = generateReferralCode(new Date())
        fieldsToUpdate.employeeId = `EMP${idCode}`
      }


      const updatedEmployee = await this.employeeRepository.updateEmployee(
        id,
        fieldsToUpdate
      );

      if (updatedEmployee.modifiedCount === 0) {
        return { success: false, message: "Failed to update employee" };
      }

      return { success: true, message: "Employee updated successfully" };
    } catch (error) {
      console.error("Error in editEmployee:", error);
      return { success: false, message: "Error while editing employee" };
    }
  }

  async deleteEmployee(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existingEmployee = await this.employeeRepository.findById(id);

      if (!existingEmployee) {
        return { success: false, message: "No employee found" };
      }

      if (existingEmployee.is_deleted) {
        return { success: false, message: "Employee already deleted" };
      }

      const updatedData = await this.employeeRepository.updateEmployee(id, {
        is_deleted: true,
        active: false,
      });

      if (updatedData.modifiedCount === 0) {
        return { success: false, message: "Failed to delete employee" };
      }

      return { success: true, message: "Employee deleted successfully" };
    } catch (error) {
      console.error("Error in deleteEmployee use case:", error);
      return {
        success: false,
        message: "An error occurred while deleting the employee",
      };
    }
  }

  async activateEmployee(id) {
    try {
      if (!isValidObjectId(id)) {
        return { success: false, message: "Provide a valid object id" };
      }

      const existingEmployee = await this.employeeRepository.findById(id);

      if (!existingEmployee) {
        return { success: false, message: "No employee found" };
      }

      if (existingEmployee.is_deleted) {
        return {
          success: false,
          message: "Deleted employee action not permited",
        };
      }

      const updatedData = await this.employeeRepository.updateEmployee(id, {
        active: !existingEmployee.active,
      });

      if (updatedData.modifiedCount === 0) {
        return { success: false, message: "Failed to delete employee" };
      }

      // constructing response message based on the previous state of active
      let message = existingEmployee.active
        ? "Employee deactivated successfully"
        : "Employee activated successfully";

      return { success: true, message: message };
    } catch (error) {
      console.error("Error in deleteEmployee use case:", error);
      return {
        success: false,
        message: "An error occurred while deleting the employee",
      };
    }
  }

  async getAllEmployees(page,limit,search){
    try {
        const pageNum = page ? parseInt(page) : 1;
        const pageSize = limit ? parseInt(limit) : 10;
  
        const searchTerm = search || "";
  
        const searchCriteria = searchTerm
          ? {
              $or: [
                { firstname: { $regex: searchTerm, $options: "i" } },
                { mobile: { $regex: searchTerm, $options: "i" } }
              ],
            }
          : {};
  
        const query = {
          is_deleted:{$ne:true},
          ...searchCriteria,
        };
  
        const documentskip = (pageNum - 1) * pageSize;
        const documentlimit = pageSize;
  
        const Data = await this.employeeRepository.getAllEmployees({
          query,
          documentskip,
          documentlimit,
        });
  
        if (!Data || Data.length === 0) {
          return { success: false, message: "No active employees found" };
        }

        return {
          success: true,
          message: "Employee data fetched successfully",
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

  async getEmployeeById(id){
    try {
        if(!isValidObjectId(id)){
            return {success:false,message:"Provide a valid object id"}
        }

        const employeeData= await this.employeeRepository.findById(id)

        if(!employeeData){
            return {success:false,message:"No employee found"}
        }

        return {success:true,message:"Employee data fetched successfully",data:employeeData}
    } catch (error) {
        console.error(error);
        return {success:false,message:"Failed to fetch employee data"}
    }
  }

  async getEmployeeByBranch(branchId){
    try {
        if(!isValidObjectId(branchId)){
            return {success:false,message:"Provide a valid object id"}
        }

        const existingbranch = await this.branchRepository.findById(branchId);

        if(!existingbranch){
          return {success:false,message:"No branch found"}
        }

        const employeeData= await this.employeeRepository.find({id_branch:branchId})

        if(!employeeData){
            return {success:false,message:"No employee found"}
        }

        return {success:true,message:"Employee data fetched successfully",data:employeeData}
    } catch (error) {
        console.error(error)
        return {success:false,message:"Failed to fetch employee data"}
    }
  }

  async getAll(){
    try {
        const employeeData= await this.employeeRepository.getAll()

        if(!employeeData){
            return {success:false,message:"No employee found"}
        }

        return {success:true,message:"Employee data fetched successfully",data:employeeData}
    } catch (error) {
        console.error(error)
        return {success:false,message:"Failed to fetch employee data"}
    }
  }

  async getReferrals(filterData) {
    try {
      let pageNum = parseInt(filterData.page, 10);
      if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
  
      let pageSize = parseInt(filterData.limit, 10);
      if (isNaN(pageSize) || pageSize < 1) pageSize = 10;
  
      const searchTerm = filterData.search || "";
  
      const searchCriteria = searchTerm
        ? {
            $or: [
              { firstname: { $regex: searchTerm, $options: "i" } },
              { mobile: { $regex: searchTerm, $options: "i" } }
            ],
          }
        : {};
  
      const query = {
        is_deleted: { $ne: true },
        ...searchCriteria,
      };
  
      const data = await this.employeeRepository.getReferrals(
        pageNum,
        pageSize,
        query
      );
  
      if (!data || data.length === 0) {
        return { success: false, message: "No referral data found" };
      }

      return {
        success: true,
        message: "Employee referrals fetched successfully",
        data: data.data,
        totalCount: data.total,
        totalPages: Math.ceil(data.total / pageSize),
        currentPage: pageNum,
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to fetch data" };
    }
  }

  async getEmployeeByMobile(mobile){
    try {
        let employeeData=''
        if(mobile.length == 10){
          employeeData= await this.employeeRepository.getEmployeeByMobile(mobile)
        }else{
          const code = `Emp-${mobile}`
          employeeData = await this.employeeRepository.finByReferralCode(code)
        }

        if(!employeeData){
            return {success:false,message:"No employee found"}
        }

        return {success:true,message:"Employee data fetched successfully",data:employeeData}
    } catch (error) {
        console.error(error)
        return {success:false,message:"Failed to fetch employee data"}
    }
  }
}

export default EmployeeUseCase;
