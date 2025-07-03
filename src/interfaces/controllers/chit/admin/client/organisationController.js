class OrganisationController {
    constructor(orgnisationUsecase,validator){
        this.orgnisationUsecase = orgnisationUsecase;
        this.validator = validator;
    }

    async addOrgDetails(req,res){
        try {
            const {company_name,mobile,pincode,short_code,address,id_country,id_state,id_city,email} = req.body
            const validateData = {company_name,mobile,pincode,short_code,address,id_country,id_state,id_city,email}
            const {error} = this.validator.categoryValidations.validate(validateData);

            if (error) {
                return res.status(400).json(error.details[0].message);
              }

              const data ={...req.body}
              const files = req.files
              const token  = req.user
              const result = await this.orgnisationUsecase.addOrgDetails(data,token,files)

              if(!result.success){
                return res.status(400).json({message:result.message})
              }

              return res.status(200).json({message:result.message})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }

    async getDetails(req,res){
        try {
              const result = await this.orgnisationUsecase.getDetails()

              if(!result.success){
                return res.status(200).json({message:result.message,data:[]})
              }

              return res.status(200).json({message:result.message,data:result.data})
        } catch (error) {
            console.error(error);
            return res.status(500).json({message:"Internal server error"})
        }
    }
}

export default OrganisationController;