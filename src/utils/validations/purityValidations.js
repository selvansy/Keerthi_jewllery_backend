import Joi from 'joi';

class Validator {
  purityValidations = Joi.object({
    purity_name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Purity name is required.",
        "string.empty": "Purity name cannot be empty.",
        "string.base": "Purity name must be a valid string."
      }),

    // id_metal: Joi.string()
    //   .trim()
    //   .required()
    //   .pattern(/^[a-f\d]{24}$/i)
    //   .messages({
    //     "any.required": "Metal ID is required.",
    //     "string.empty": "Metal ID cannot be empty.",
    //     "string.base": "Metal ID must be a valid string.",
    //     "string.pattern.base": "Metal ID must be a valid 24-character MongoDB ObjectId."
    //   })
      id_metal: Joi.string()
      .required()
      .messages({
        "any.required": "Metal ID is required.",
        "string.empty": "Metal ID cannot be empty.",
        "string.base": "Metal ID cannot be empty.",
      })
  });
}

export default Validator;