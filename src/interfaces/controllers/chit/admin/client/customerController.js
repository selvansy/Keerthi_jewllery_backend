import { isValidObjectId } from "mongoose";
import { token } from "morgan";

class CustomerController {
  constructor(customerUseCase, validator) {
    this.customerUseCase = customerUseCase;
    this.validator = validator;
  }

  async addCustomer(req, res) {
    try {
      const {
        firstname,
        lastname,
        mobile,
        gender,
        id_country,
        id_state,
        id_city,
        id_branch,
        pincode,
        date_of_birth,
        address,
      } = req.body;

      const token = req.user;

      const validateData = {
        firstname,
        // lastname,
        mobile,
        id_country,
        address,
        id_branch,
        id_city,
        id_state,
        pincode,
        // date_of_birth,
        gender,
      };

      if (!isValidObjectId(id_branch)) {
        return res.status(400).json({ message: "Branch Id is not valid" });
      }

      const { error } =
        this.validator.customerValidations.validate(validateData);

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      let uploads;
      if (req.files) {
        uploads = req.files;
      }

      const data = { ...req.body };
      const result = await this.customerUseCase.addCustomer(
        data,
        uploads,
        token
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editCustomer(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provided" });
      }

      const {
        firstname,
        lastname,
        mobile,
        gender,
        id_country,
        id_state,
        id_city,
        id_branch,
        pincode,
        date_of_birth,
        address,
      } = req.body;

      let validate = {};

      if (req.body.skip) {
        validate = {
          firstname,
          mobile,
          id_branch,
        };
      } else {
        validate = {
          firstname,
          // lastname,
          mobile,
          gender,
          id_country,
          id_state,
          id_city,
          id_branch,
          pincode,
          address,
        };
      }

      let error;

      if (!req.body.skip) {
        ({ error } = this.validator.customerValidations.validate(validate));
      }

      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      let uploads;
      if (req.files) {
        uploads = req.files;
      }

      const data = { ...req.body };
      const token = req.user;
      const result = await this.customerUseCase.editCustomer(
        id,
        data,
        uploads,
        token
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteCustomer(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provide" });
      }

      const result = await this.customerUseCase.deleteCustomer(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async activateCustomer(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provide" });
      }

      const result = await this.customerUseCase.activateCustomer(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCustomerById(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "No valid id provide" });
      }

      const result = await this.customerUseCase.getCustomerById(id);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getCustomersByBranch(req, res) {
    try {
      const { id } = req.params;
      const customers = await this.customerUseCase.getCustomersByBranch(id);
      res.status(200).json({ success: true, customers });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async searchCustomerByMobile(req, res) {
    const { search, customer } = req.query;
    try {
      if (!search) {
        return res
          .status(200)
          .json({ message: "Referral code or mobile number is required" });
      }

      if (!customer) {
        return res
          .status(200)
          .json({ message: "Customer mobile number is required" });
      }

      const result = await this.customerUseCase.searchCustomerByMobile(
        search,
        customer
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      const returnData = {
        firstname: result?.data?.firstname,
        _id: result?.data?._id,
      };

      if (result?.data?.lastname) {
        returnData.lastname = result?.data?.lastname;
      }

      return res
        .status(200)
        .json({ message: result.message, data: returnData });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async customerTable(req, res) {
    try {
      const { page, limit, search, from_date, to_date, id_branch, active } =
        req.body;

      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

      const fromDate = from_date ? new Date(from_date) : null;
      const toDate = to_date ? new Date(to_date) : null;

      if (fromDate && isNaN(fromDate.getTime())) {
        return res.status(400).json({ message: "Invalid from_date format" });
      }
      if (toDate && isNaN(toDate.getTime())) {
        return res.status(400).json({ message: "Invalid to_date format" });
      }

      const result = await this.customerUseCase.getAllCustomers(
        page,
        limit,
        search,
        fromDate,
        toDate,
        id_branch,
        active
      );

      if (!result.success) {
        return res.status(200).json({ message: result.message, data: [] });
      }

      res.status(200).json({
        message: result.message,
        data: result.data,
        totalDocument: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async searchCustomerByMobileAndBranch(req, res) {
    const { branchId } = req.params;
    const { search } = req.query;
    try {
      if (!branchId) {
        return res.status(400).json({ message: "Provide a branch id" });
      }

      const result = await this.customerUseCase.searchCustomerByMobileAndBranch(
        branchId,
        search
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res
        .status(200)
        .json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async signup(req, res) {
    try {
      const { firstname, mobile, mpin, id_branch, password,email} = req.body;

      if (!firstname) {
        return res.status(400).json({ message: "First name is required." });
      }

      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required." });
      }

      if (!mpin) {
        return res.status(400).json({ message: "MPIN is required." });
      }

      if (!id_branch) {
        return res.status(400).json({ message: "Branch ID is required." });
      }
      if (!password) {
        return res.status(400).json({ message: "Password is required." });
      }

      if (password.length <= 7) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long." });
      }

      const mobilePattern = /^[0-9]{10}$/;
      if (!mobilePattern.test(mobile)) {
        return res
          .status(400)
          .json({ message: "Invalid mobile number format." });
      }

      const mpinPattern = /^[0-9]{4}$/;
      if (!mpinPattern.test(mpin)) {
        return res
          .status(400)
          .json({ message: "MPIN should be a 4-digit number." });
      }

      const userData = {
        firstname,
        mobile,
        mpin,
        id_branch,
        password,
        email,
      };

      const result = await this.customerUseCase.signup(userData);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(201).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyOtp(req, res) {
    try {
      const { mobile, otp, type } = req.body;

      if (!mobile || !otp) {
        return res
          .status(400)
          .json({ message: "Mobile number OTP are required" });
      }
      if (!type) {
        return res.status(400).json({ message: "type are required" });
      }
      if (
        !type ||
        !["signup", "forgotpassword", "resetpassword", "forgotmpin"].includes(
          type
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid type. Accepted values are signup, forgotpassword, forgotmpin or resetpassword.",
        });
      }
      const result = await this.customerUseCase.verifyOtp(mobile, otp, type);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(200).json({
        message: "OTP verified successfully.",
        data: result.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { mobile, password } = req.body;
      const result = await this.customerUseCase.login({ mobile, password });
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, token: result.token });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async generateOtp(req, res) {
    try {
      const { mobile, id_branch, type } = req.body;
      const data = {
        mobile,
        type,
      };

      let validateUser = false; /// for reusing the same otp function for check already user exsiting or non exisiting
      if (type == "signup") {
        // if (!id_branch) {
        //   return res.status(400).json({ message: "BranchId is required." });
        // }
        // data.id_branch = id_branch;
        validateUser = true;
      }
      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required." });
      }

      if (typeof mobile !== "number" || isNaN(mobile)) {
        return res
          .status(400)
          .json({ message: "Mobile number must be a valid numeric value." });
      }

      if (!type) {
        return res.status(400).json({ message: "Type is required" });
      }
      if (
        !type ||
        !["signup", "forgotpassword", "resetpassword", "forgotmpin"].includes(
          type
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid type. Accepted values are signup, forgotpassword, forgotmpin or resetpassword.",
        });
      }

      const result = await this.customerUseCase.sendOtp(data, validateUser);
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async forgetPassword(req, res) {
    try {
      const { mobile, password } = req.body;

      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required." });
      }

      if (password.length <= 7) {
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters long." });
      }

      const result = await this.customerUseCase.forgetPassword(
        mobile,
        password
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyMpin(req, res) {
    try {
      const { mobile, mpin } = req.body;

      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required." });
      }

      if (!mpin) {
        return res.status(400).json({ message: "MPIN is required." });
      }

      const mpinPattern = /^[0-9]{4}$/;
      if (!mpinPattern.test(mpin)) {
        return res
          .status(400)
          .json({ message: "MPIN should be a 4-digit number." });
      }

      const result = await this.customerUseCase.verifyMpin(mobile, mpin);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      }
      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async forgetMpin(req, res) {
    try {
      const { mobile, mpin } = req.body;

      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required." });
      }

      if (!mpin) {
        return res.status(400).json({ message: "MPIN is required." });
      }

      const mpinPattern = /^[0-9]{4}$/;
      if (!mpinPattern.test(mpin)) {
        return res
          .status(400)
          .json({ message: "MPIN should be a 4-digit number." });
      }

      const result = await this.customerUseCase.forgetMpin(mobile, mpin);
      if (result.success) {
        return res.status(200).json({ message: result.message });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeMpin(req, res) {
    try {
      const { oldMpin, mpin } = req.body;
      const { mobile } = req.user;

      if (!mobile) {
        return res.status(400).json({ message: "Mobile number is required." });
      }

      if (!mpin) {
        return res.status(400).json({ message: "MPIN is required." });
      }

      const mpinPattern = /^[0-9]{4}$/;
      if (!mpinPattern.test(oldMpin)) {
        return res
          .status(400)
          .json({ message: "Old MPIN should be a 4-digit number." });
      }
      if (!mpinPattern.test(mpin)) {
        return res
          .status(400)
          .json({ message: "MPIN should be a 4-digit number." });
      }

      const result = await this.customerUseCase.changeMpin(
        mobile,
        mpin,
        oldMpin
      );

      if (result.success) {
        return res.status(200).json({ message: result.message });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getReferralDetals(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "No customer id provided" });
      }
      const result = await this.customerUseCase.getReferralDetals(id);

      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async customerOverview(req, res) {
    try {
      const { branch, mobile, idCustomer } = req.body;
  
      if (!idCustomer) {
        if (!branch) {
          return res.status(400).json({ message: "Branch is required" });
        }
  
        if (!mobile) {
          return res.status(400).json({ message: "Provide mobile number" });
        }
  
        const mobileNumber = mobile?.toString().trim();
        if (!/^\d{10}$/.test(mobileNumber)) {
          return res.status(400).json({ message: "Enter a valid mobile number" });
        }
      }
  
      const result = await this.customerUseCase.customerOverview(
        branch,
        mobile,
        idCustomer
      );
      
      if (result?.data?.customerDetails?._id) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }
  
      return res.status(400).json({ message:"No customer data found" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  

  async findUsersBySchema(req, res) {
    try {
      const { id_branch, id_scheme } = req.body;

      if (id_branch.length < 1) {
        return res.status(400).json({ message: "Branch is required" });
      }

      if (id_scheme.length < 1) {
        return res.status(400).json({ message: "Scheme is required" });
      }
      const result = await this.customerUseCase.findUsersBySchema({
        branchId: id_branch,
        schemeId: id_scheme,
      });
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changePassword(req, res) {
    try {
      const { oldpass, newpass, confirmpass } = req.body;
      const { _id } = req.user;

      if (!oldpass & !newpass & !confirmpass) {
        return res.status(400).json({ message: "All fields required" });
      }

      if (!oldpass) {
        return res.status(400).json({ message: "Old password is required" });
      }

      if (!newpass) {
        return res.status(400).json({ message: "New password is required" });
      }

      // if(newpass == oldpass){
      //   return res.status(400).json({message:"The new password cannot be the same as the old password"})
      // }

      if (newpass !== confirmpass) {
        return res
          .status(400)
          .json({
            message: "New password and Confirmpassword is not mathcing",
          });
      }

      const result = await this.customerUseCase.changePassword({
        idCustomer: _id,
        oldPass: oldpass,
        newPass: newpass,
      });

      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async verfiyPassword(req, res) {
    try {
      const { password } = req.body;
      const { _id } = req.user;

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const result = await this.customerUseCase.verfiyPassword({
        idCustomer: _id,
        password: password,
      });

      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      }

      return res.status(400).json({ message: result.message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default CustomerController;
