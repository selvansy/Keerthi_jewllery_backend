class StaffUserController{
    constructor(staffUseCase,validator){
        this.validator = validator;
    this.staffUseCase= staffUseCase;
    }

    async addStaff(req,res){
        try {
          const requiredFields = [
            { field: 'id_project', message: 'Project ID is required' },
            { field: 'id_client', message: 'Client ID is required' },
            { field: 'id_employee', message: 'Employee ID is required' },
            { field: 'password', message: 'Password is required' },
            { field: 'username', message: 'Username is required' },
            { field: 'id_role', message: 'Role ID is required' },
            { field: 'id_branch', message: 'Branch ID is required' },
          ];
  
          for (const { field, message } of requiredFields) {
            if (!req.body[field] || req.body[field] === "") {
              return res.status(400).json({ status: 'Failed', message });
            }
          }
  
          const { access_branch } = req.body;
          if (access_branch !== 0 && access_branch == "") {
          return res.status(400).json({
          status: 'Failed',
          message: 'Access Branch must be a valid',
        });
      }
  
          const staffData= req.body;
          const result= await this.staffUseCase.addStaff(staffData)
  
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
  
          res.status(201).json({message:result.message})
      } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"})
      }
    }
  
    async editStaff(req, res) {
      try {
        const { id } = req.params;
    
        if (!id) {
          return res.status(400).json({ message: "ID required" });
        }

        const requiredFields = [
          // { field: 'id_project', message: 'Project ID is required' },
          { field: 'id_client', message: 'Client ID is required' },
          { field: 'id_employee', message: 'Employee ID is required' },
          { field: 'password', message: 'Password is required' },
          { field: 'username', message: 'Username is required' },
          { field: 'id_role', message: 'Role ID is required' },
          { field: 'id_branch', message: 'Branch ID is required' },
        ];
    
        for (const { field, message } of requiredFields) {
          if (req.body[field] === undefined || req.body[field] === "") {
            return res.status(400).json({ status: 'Failed', message });
          }
        }
  
        const { access_branch } = req.body;
        if (access_branch !== undefined && access_branch !== 0 && access_branch === "") {
          return res.status(400).json({ message: 'Access Branch must be valid' });
        }
    
        const staffData = {};
    
        const fieldsToUpdate = ['id_project', 'id_client', 'id_employee', 'password', 'username', 'id_role', 'access_branch'];
        fieldsToUpdate.forEach(field => {
          if (req.body[field] !== undefined) {
            staffData[field] = req.body[field];
          }
        });
    
        const result = await this.staffUseCase.editStaff(id, staffData);
    
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
    
        res.status(201).json({ message: result.message });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
    
    async deleteStaff(req,res){
      try {
         const {id}= req.params;
         
         if(!id){
          return res.status(400).json({message:"ID required"})
         }
  
         const result= await this.staffUseCase.deleteStaff(id)
  
         if(!result.success){
          return res.status(400).json({message:result.message})
         }
         res.status(200).json({message:result.message});
      } catch (error) {
        console.error(error)
        return res.status(500).json({message:"Internal server error"})
      }
    }
  
    async toggleStaffStatus(req,res){
      try {
        const {id}= req.params
         if(!id){
          return res.status(400).json({message:"ID required"})
         }
  
         const result= await this.staffUseCase.toggleStaffStatus(id);
  
         if(!result.success){
          return res.status(400).json({message:result.message});
         }
  
         res.status(200).json({message:result.message})
      } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"})
      }
    }
  
    async getAllStaffs(req, res) {
      try {
        const { page, limit, search,active } = req.body;
  
        if (!page || isNaN(page) || parseInt(page) <= 0) {
          return res.status(400).json({ message: "Invalid page number" });
        }
        if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
          return res.status(400).json({ message: "Invalid limit number" });
        }
  
        const result =
          await this.staffUseCase.getAllStaffs(
            page,
            limit,
            search,
            active
          );
  
        if (!result || !result.success) {
          return res.status(404).json({ message: result.message });
        }
        res.status(200).json({
          message: result.message,
          data: result,
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }

    async getStaffById(req, res) {
      const { id} = req.params;
      try {
        if (!id) {
          return res.status(400).json({ message: "No valid id provided" });
        }
  
        const result = await this.staffUseCase.getStaffById(id);
  
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
}

export default StaffUserController;