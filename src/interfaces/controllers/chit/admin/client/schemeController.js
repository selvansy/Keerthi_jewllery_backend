class SchemeController{
    constructor(schemeUseCase,validator){
        this.schemeUseCase= schemeUseCase;
        this.validator = validator;
    }

    async addScheme(req,res){
        try {
          const {
            scheme_name,
            id_metal,
            id_classification,
            scheme_type,
            total_installments,
            id_branch,
            id_purity,
            code
          } = req.body;

          if(scheme_type !== "10" || scheme_type !== "14"){
            if (!req.files || !req.files.logo || (!req.files.logo[0]?.buffer)) {
              return res.status(400).json({ message: "Classification image is required" });
            }
          }

          let requiredFields=''
          if(scheme_type === "10" || scheme_type === "14"){
            requiredFields = [
              { field: scheme_name, name: 'Scheme Name' },
              { field: id_metal, name: 'Metal Type' },
              { field: scheme_type, name: 'Scheme Type' },
              { field: id_branch, name: 'Branch Id' },
              { field: id_purity, name: 'Purity Id' },
              { field: id_classification, name: 'Classification Id' },
            ];
          }else{
            requiredFields = [
              { field: scheme_name, name: 'Scheme Name' },
              { field: id_metal, name: 'Metal Type' },
              { field: id_classification, name: 'Classification Id' },
              { field: scheme_type, name: 'Scheme Type' },
              { field: total_installments, name: 'Total Installments' },
              { field: id_branch, name: 'Branch Id' },
              { field: id_purity, name: 'Purity Id' },
              { field: code, name: 'Code' }
            ];
          }

          for (const { field, name } of requiredFields) {
            if (field == null || field === '') {
              return res.status(400).json({ message: `${name} is required` });
            }
          }
          const schemeData= req.body

          if(scheme_type === "10" && !schemeData.code){
            schemeData.code = "Digigold"
          }else if(scheme_type === "14" && !schemeData.code){
            schemeData.code = "Digisilver"
          }

          schemeData.created_by = req.user.id_employee;
          const result= await this.schemeUseCase.addScheme(schemeData,req?.files?.logo,req?.files?.desc_img);
    
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
          
          res.status(201).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }
    
      async updateScheme(req,res){
        const {
          id_branch,
          scheme_name,
          id_metal,
          id_purity,
          id_classification,
          scheme_type,
          total_installments,
          code,
        } = req.body;

        const { id } = req.params;
        try {
          // if (!scheme_name || scheme_name === "") {
          //   return res.status(400).json({message: 'Scheme Name is required' });
          // } else if (!id_metal || id_metal === "") {
          //     return res.status(400).json({message: 'Metal Type is required' });
          // } else if (!id_classification || id_classification === "") {
          //     return res.status(400).json({message: 'Classification Id is required' });
          // } else if (parseInt(scheme_type) < 0 || scheme_type === '') {
          //     return res.status(400).json({message: 'Scheme Type is required' });
          // } else if (!total_installments || total_installments === "") {
          //     return res.status(400).json({message: 'Total Installments is required' });
          // } else if (!id_branch || id_branch === "") {
          //     return res.status(400).json({message: 'Branch Id is required' });
          // }  else if (!id_purity || id_purity === "") {
          //     return res.status(400).json({message: 'Purity Id is required' });
          // }else if(!code || code === ''){
          //   return res.status(400).json({message:"Code rerquired"})
          // }

          // if(scheme_type !== 10){
            //   requiredFields = [
              //     { field: scheme_name, name: 'Scheme Name' },
              //     { field: id_metal, name: 'Metal Type' },
              //     { field: id_classification, name: 'Classification Id' },
              //     { field: scheme_type, name: 'Scheme Type' },
              //     { field: total_installments, name: 'Total Installments' },
              //     { field: id_branch, name: 'Branch Id' },
              //     { field: id_purity, name: 'Purity Id' },
          //     { field: code, name: 'Code' }
          //   ];
          // }else{
            //   requiredFields = [
          //     { field: scheme_name, name: 'Scheme Name' },
          //     { field: id_metal, name: 'Metal Type' },
          //     { field: scheme_type, name: 'Scheme Type' },
          //     { field: id_branch, name: 'Branch Id' },
          //     { field: id_purity, name: 'Purity Id' },
          //     { field: id_classification, name: 'Classification Id' },
          //   ];
          // }
          // if(scheme_type !== "10" || scheme_type !== "14"){
          //   if (!req.files || !req.files.logo || (!req.files.logo[0]?.buffer)) {
          //     return res.status(400).json({ message: "Classification image is required" });
          //   }
          // }
          
          let requiredFields=''
          if(scheme_type === "10" || scheme_type === "14"){
            requiredFields = [
              { field: scheme_name, name: 'Scheme Name' },
              { field: id_metal, name: 'Metal Type' },
              { field: scheme_type, name: 'Scheme Type' },
              { field: id_branch, name: 'Branch Id' },
              { field: id_purity, name: 'Purity Id' },
              { field: id_classification, name: 'Classification Id' },
            ];
          }else{                                                                                              
            requiredFields = [
              { field: scheme_name, name: 'Scheme Name' },
              { field: id_metal, name: 'Metal Type' },
              { field: id_classification, name: 'Classification Id' },
              { field: scheme_type, name: 'Scheme Type' },
              { field: total_installments, name: 'Total Installments' },
              { field: id_branch, name: 'Branch Id' },
              { field: id_purity, name: 'Purity Id' },
              { field: code, name: 'Code' }
            ];
          }
      
          for (const { field, name } of requiredFields) {
            if (field == null || field === '') {
              return res.status(400).json({ message: `${name} is required` });
            }
          }
          const schemeData= req.body

          let logo='';
          let desc_img='';
          if(req.files){
            if(req.files.logo){
              logo = req?.files?.logo
            }
            if(req.files.desc_img){
              desc_img= req?.files?.desc_img
            }
          }

          schemeData.updated_by = req.user.id_employee;
          const result = await this.schemeUseCase.updateScheme(id,schemeData,logo,desc_img);
          
          if(!result.success){
            return res.status(400).json({message:result.message})
          }
    
          res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async schemesTableData(req,res){
        try {
          const { 
            page, 
            limit, 
            search, 
            from_date, 
            to_date, 
            id_classification, 
            metalid, 
            id_purity, 
            weekmonth, 
            scheme_type, 
            installment_type 
        } = req.body;


        let filter = {};

        if (search) {
            filter["$or"] = [
                { scheme_name: { $regex: search, $options: "i" } },
                { code: { $regex: search, $options: "i" } }
            ];
        }
        if (from_date && to_date) {
            filter["createdAt"] = { $gte: new Date(from_date), $lte: new Date(to_date) };
        }

        if (id_classification) filter["id_classification"] = id_classification;
        if (metalid) filter["metalid"] = metalid;
        if (id_purity) filter["id_purity"] = id_purity;
        if (weekmonth) filter["weekmonth"] = weekmonth;
        if (scheme_type) filter["scheme_type"] = scheme_type;
        if (installment_type) filter["installment_type"] = installment_type;
    
        if (!page || isNaN(page) || parseInt(page) <= 0) {
          return res.status(400).json({ message: "Invalid page number" });
        }
        if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
          return res.status(400).json({ message: "Invalid limit number" });
        }
    
        const result= await this.schemeUseCase.schemesTableData(filter, parseInt(page), parseInt(limit))
    
        if(!result.success){
          return res.status(200).json({message:result.message,data:[]})
        }
    
        res.status(200).json({message:result.message,data:result.data,
          totalDocument:result.totalCount,
          totalPages:result.totalPages,
          currentPage:result.currentPage
        })
        } catch (error) {
          console.error(error);
          res.status(500).json({message:"Internal server error"})
        }
      }
    
      async getSchemeById(req, res) {
        try {
          const { id } = req.params;
          const result = await this.schemeUseCase.getSchemeById(id);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }

      async getSchemeByBrachId(req, res) {
        const { branchId } = req.params;
        try {
          if(!branchId){
            return res.status(400).json({message:"No object id provided"})
          }

          const result = await this.schemeUseCase.getSchemeByBrachId(branchId);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({ message: result.message, data: result.data });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }
    
      async deleteScheme(req, res) {
        try {
          const { id } = req.params;
          if(!id){
            return res.status(400).json({message:"ID required"})
          }
          const result = await this.schemeUseCase.deleteScheme(id);
    
          if (result.success) {
            return res.status(200).json({ message: result.message });
          } else if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: "Internal server error", error: error.message });
        }
      }
    
      async toggleSchemeStatus(req,res){
        try {
          const {id}= req.params
           if(!id){
            return res.status(400).json({message:"Scheme ID required"})
           }
    
           const result= await this.schemeUseCase.toggleSchemeStatus(id);
    
           if(!result.success){
            return res.status(400).json({message:result.message});
           }
    
           res.status(200).json({message:result.message})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }

      async getAllActiveSchemes(req,res){
        try {
           const result= await this.schemeUseCase.getAllActiveSchemes();
    
           if(!result.success){
            return res.status(400).json({message:result.message});
           }
    
           res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
          console.error(error);
          return res.status(500).json({message:"Internal server error"})
        }
      }

      async getAllBranchScheme(req, res) {
        const { branchId } = req.params;
      try {
          if(!branchId){
              return res.status(400).json({message:'No branch id provided'})
          }
        const result = await this.schemeUseCase.getAllBranchScheme(branchId);
  
        if (!result.success) {
          return res.status(400).json({ message: result.message,data:[]});
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }

    async getSchemeByclassificationId(req, res) {
      try {
        const classId = req.query.classId;
        if(!classId){
          return res.status(400).json({message:"No object id provided"})
        }

        const result = await this.schemeUseCase.getSchemeByclassificationId(classId);
  
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data,pathUrl:result.pathurl});
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }

    async getDigigoldStaticData(req, res) {
      try {
        const result = await this.schemeUseCase.getDigigoldStaticData();
  
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }

    async getDelistSchemes(req,res){
      try {
        const { 
          page, 
          limit, 
          search, 
          from_date, 
          to_date, 
          metalid, 
          id_purity, 
          weekmonth, 
          scheme_type, 
          installment_type,
          id_classification
      } = req.body;


      let filter = {};

      if (search) {
          filter["$or"] = [
              { scheme_name: { $regex: search, $options: "i" } },
          ];
      }
      if (from_date && to_date) {
          filter["createdAt"] = { $gte: new Date(from_date), $lte: new Date(to_date) };
      }

      if (id_classification) filter["id_classification"] = id_classification;
      if (metalid) filter["metalid"] = metalid;
      if (id_purity) filter["id_purity"] = id_purity;
      if (weekmonth) filter["weekmonth"] = weekmonth;
      if (scheme_type) filter["scheme_type"] = scheme_type;
      if (installment_type) filter["installment_type"] = installment_type;
  
      if (!page || isNaN(page) || parseInt(page) <= 0) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      if (!limit || isNaN(limit) || parseInt(limit) <= 0) {
        return res.status(400).json({ message: "Invalid limit number" });
      }
  
      const result= await this.schemeUseCase.getDelistSchemes(filter, parseInt(page), parseInt(limit))
  
      if(!result.success){
        return res.status(200).json({message:result.message,data:[]})
      }
  
      res.status(200).json({message:result.message,data:result.data,
        totalDocument:result.totalCount,
        totalPages:result.totalPages,
        currentPage:result.currentPage
      })
      } catch (error) {
        console.error(error);
        res.status(500).json({message:"Internal server error"})
      }
    }

    async getDigiGoldSchemes(req, res) {
      try {
        const {type}= req.params;

        if(!type){
          type = 10
        }
        
        const result = await this.schemeUseCase.getDigiGoldSchemes(type);
  
        if (!result.success) {
          return res.status(400).json({ message: result.message });
        }
  
        return res.status(200).json({ message: result.message, data: result.data });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
      }
    }
}

export default SchemeController;