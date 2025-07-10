import Joi from 'joi';

class NewArrivalsValidation {
  newArrivalsValidation = Joi.object({
    
    id_product: Joi.string()
    .trim()
    .required()
    .messages({
        "any.required": "Product Id is required",
        "string.empty": "Product Id cannot be empty",
        "string.base": "Product Id must be a string",
    }),

    id_branch: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Branch Id is required",
        "string.empty": "Branch Id cannot be empty",
        "string.base": "Branch Id must be a string",
      }),

      // description: Joi.string()
      // .trim()
      // .required()
      // .messages({
      //   "any.required": "Description is required",
      //   "string.empty": "Description cannot be empty",
      //   "string.base": "Description must be a string",
      // }),
     

    start_date: Joi.string()
      .trim()
      .messages({
        "string.empty": "Start Date cannot be empty", 
        "string.base": "Start Date must be a string",
      }),
    end_date: Joi.string()
      .trim()
      .messages({
        "string.empty": "End Date cannot be empty", 
        "string.base": "End Date must be a string",
      }),

      new_arrivals_img:Joi.string()
      .optional()
  });
}

export default NewArrivalsValidation;
