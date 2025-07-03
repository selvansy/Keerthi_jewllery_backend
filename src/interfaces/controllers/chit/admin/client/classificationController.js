import { isValidObjectId } from "mongoose";

class ClassificationController{
  constructor(classificationUseCase,validator){
    this.classificationUseCase = classificationUseCase;
    this.validator = validator;
  }

  async addSchemeClassification(req, res) {
    const {
      classification_name,
      classification_order,
      description,
      term_desc,
      id_branch,
      typeofscheme,
    } = req.body;

    try {
      if (!classification_name || classification_name === "") {
        return res
          .status(400)
          .json({
            status: "Failed",
            message: "Classification Name is required",
          });
      }  else if (!id_branch || id_branch === "") {
        return res
          .status(400)
          .json({ status: "Failed", message: "Branch ID is required" });
      } else if (!typeofscheme || typeofscheme === "") {
        return res
          .status(400)
          .json({ status: "Failed", message: "Type of Scheme is required" });
      }
      // else if (!classification_order || classification_order === "") {
      //   return res
      //     .status(400)
      //     .json({
      //       status: "Failed",
      //       message: "Classification Order is required",
      //     });
      // }

      req.body.created_by = req.user.id_employee;

      let logo = "";
      let desc_img = "";

      if (req.files) {
        if (req.files.logo) {
          logo = req.files.logo[0];
        }
        if (req.files.desc_img) {
          desc_img = req.files.desc_img[0];
        }
      }

      const result = await this.classificationUseCase.addSchemeClassification(
        req.body,
        logo,
        desc_img
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

  async updateClassification(req, res) {
    const { id } = req.params;

    const {
      classification_name,
      classification_order,
      description,
      term_desc,
      id_branch,
      typeofscheme,
    } = req.body;

    try {
      if (!classification_name || classification_name === "") {
        return res
          .status(400)
          .json({
            status: "Failed",
            message: "Classification Name is required",
          });
      } else if (!classification_order || classification_order === "") {
        return res
          .status(400)
          .json({
            status: "Failed",
            message: "Classification Order is required",
          });
      } else if (!id_branch || id_branch === "") {
        return res
          .status(400)
          .json({ status: "Failed", message: "Branch ID is required" });
      } else if (!typeofscheme || typeofscheme === "") {
        return res
          .status(400)
          .json({ status: "Failed", message: "Type of Scheme is required" });
      }

      req.body.created_by = req.user.id_employee;
      const data = req.body;

      let logo = "";
      let desc_img = "";

      if (req.files) {
        if (req.files.logo) {
          logo = req.files.logo[0];
        }
        if (req.files.desc_img) {
          desc_img = req.files.desc_img[0];
        }
      }
      const result = await this.classificationUseCase.updateClassification(
        id,
        data,
        logo,
        desc_img
      );

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.status(200).json({ message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getClassificationById(req, res) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Classification ID is required" });
    }

    const result = await this.classificationUseCase.findById(id);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    res.status(200).json({ message: result.message, data: result.data });
  }

  async getAllClassifications(req, res) {
    try {
      const { page, limit, search, id_branch, from_date, to_date, typeofscheme } = req.body;
  
      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }

     
  
      const data ={...req.body}
      const result = await this.classificationUseCase.getAllClassifications(
        page,
        limit,
        search,
        data
      );
  
      if (!result || !result.success) {
        return res.status(404).json({ message: result.message });
      }
  
      res.status(200).json({
        message: result.message,
        data: result.data,
        totalDocuments: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  

  async deleteClassification(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: "Classification ID is required" });
      }

      const result = await this.classificationUseCase.deleteClassification(id);

      if (result.success) {
        return res.status(200).json({ message: result.message });
      } else if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }

  async toggleActiveStatus(req,res){
    try {
      const {id}= req.params
       if(!id){
        return res.status(400).json({message:"Classification ID required"})
       }

       const result= await this.classificationUseCase.toggleActiveStatus(id);

       if(!result.success){
        return res.status(400).json({message:result.message});
       }

       res.status(200).json({message:result.message})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getAllActiveClassifications(req,res){
    try {
       const result= await this.classificationUseCase.getAllActiveClassifications();

       if(!result.success){
        return res.status(400).json({message:result.message,data:[]});
       }

       res.status(200).json({message:result.message,data:result.data})
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getClassificationByBranch(req, res) {
    const { id } = req.params;
    try {
      if (!id) {
        return res.status(400).json({ message: "Classification ID is required" });
      }
  
      const result = await this.classificationUseCase.getClassificationByBranch(id);
  
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
  
      res.status(200).json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }

  async getSchemeClassification(req, res) {
    try {
      const result = await this.classificationUseCase.getSchemeClassification();
  
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
  
      res.status(200).json({ message: result.message, data: result.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({message:"Internal server error"})
    }
  }
}

export default ClassificationController;