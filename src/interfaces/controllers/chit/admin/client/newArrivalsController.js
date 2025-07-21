class NewArrivalsController {
  constructor(newArrivalUsecase, validation) {
    this.newArrivalUsecase = newArrivalUsecase;
    this.validation = validation;
  }

  async addNewArrivals(req, res) {
    try {
      const { error } = await this.validation.newArrivalsValidation.validate(
        req.body
      );
      
      if (error) {
        return res.status(400).json(error.details[0].message);
      }
      req.body.created_by = req.user.id_employee;
      const addNewArrivals = await this.newArrivalUsecase.addNewArrivals(
        req.body,
        // req.files.new_arrivals_img
      );
      if (addNewArrivals.success) {
        return res.status(201).json({ message: addNewArrivals.message });
      } else {
        return res.status(400).json({ message: addNewArrivals.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async editNewArrivals(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "New arrival Id is required" });
      }

      // if (!req.files.new_arrivals_img &&!req.body.new_arrivals_img) {
      //   return res.status(400).json({ message: "Image is required" });
      // }

      const { error } = await this.validation.newArrivalsValidation.validate(
        req.body
      );

      if (error) {
        return res.status(400).json(error.details[0].message);
      }      
      const updateNewArrivals = await this.newArrivalUsecase.editNewArrivals(
        id,
        req.body,
        // req.files.new_arrivals_img ? req.files.new_arrivals_img : req.body.new_arrivals_img
      );

      if (updateNewArrivals.success) {
        return res.status(200).json({ message: updateNewArrivals.message });
      } else {
        return res.status(400).json({ message: updateNewArrivals.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteNewArrivals(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({ message: "New arrival Id is required" });
      }

      const deleteNewArrivals = await this.newArrivalUsecase.deleteNewArrivals(
        id
      );
      if (deleteNewArrivals.success) {
        return res.status(200).json({ message: deleteNewArrivals.message });
      } else {
        return res.status(400).json({ message: deleteNewArrivals.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async changeStatus(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "New arrival Id is required" });
      }

      const changeStatus = await this.newArrivalUsecase.changeStatus(id);

      if (changeStatus.success) {
        res.status(200).json({ message: changeStatus.message });
      } else {
        res.status(400).json({ message: changeStatus.message });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNewArrivalsById(req,res){
    try {
      const {id}=req.params

      if(!id){
        return res.status(400).json({message:"id is required"})
      }

      const getById=await this.newArrivalUsecase.findById(id)

      if(getById.success){
        return res.status(200).json({message:getById.message,data:getById.data})
      }
        return res.status(400).json({message:getById.message})
      
      
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNewArrivalsByBranch(req,res){
    try{
      const {id}=req.params

      if(!id){
        return res.status(400).json({message:"New arrival Id is required"})
      }

      const getByBranchId=await this.newArrivalUsecase.findByBranchId(id)

      if(getByBranchId.success){
        return res.status(200).json({message:getByBranchId.message,data:getByBranchId.data})
      }
        return res.status(400).json({message:getByBranchId.message})
      

    }catch(err){
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getNewArrivals(req,res){
    try{
      const result = await this.newArrivalUsecase.getNewArrivals(req.body,req.user);
      if (result.success) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data.newArrivals ,
            totalDocuments:result.data.totalnewArrivals,
            totalPages:result.data.totalPages,
            currentPage:result.data.currentPage
          });
      }
      return res.status(204).json({ message: result.message }); 


    }catch(err){
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

export default NewArrivalsController;
