import Joi from 'joi';

class Validator {
  schemeAccountValidations = Joi.object({
    total_installments: Joi.number()
      .integer()
      .required()
      .messages({
        "any.required": "Total installments are required.",
        "number.base": "Total installments must be a valid number.",
        "number.integer": "Total installments must be an integer."
      }),

    id_classification: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        "any.required": "Classification ID is required.",
        "string.empty": "Classification ID cannot be empty.",
        "string.base": "Classification ID must be a valid string.",
        "string.pattern.base": "Classification ID must be a valid 24-character MongoDB ObjectId."
      }),

    id_scheme: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        "any.required": "Scheme ID is required.",
        "string.empty": "Scheme ID cannot be empty.",
        "string.base": "Scheme ID must be a valid string.",
        "string.pattern.base": "Scheme ID must be a valid 24-character MongoDB ObjectId."
      }),

    id_customer: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        "any.required": "Customer ID is required.",
        "string.empty": "Customer ID cannot be empty.",
        "string.base": "Customer ID must be a valid string.",
        "string.pattern.base": "Customer ID must be a valid 24-character MongoDB ObjectId."
      }),

    id_branch: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        "any.required": "Branch ID is required.",
        "string.empty": "Branch ID cannot be empty.",
        "string.base": "Branch ID must be a valid string.",
        "string.pattern.base": "Branch ID must be a valid 24-character MongoDB ObjectId."
      }),

    account_name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Account name is required.",
        "string.empty": "Account name cannot be empty.",
        "string.base": "Account name must be a valid string."
      }),

    start_date: Joi.date()
      .optional()
      .messages({
        "any.required": "Start date is required.",
        "date.base": "Start date must be a valid date."
      }),

    // maturity_date: Joi.date()
    //   .greater(Joi.ref('start_date'))
    //   .required()
    //   .messages({
    //     "any.required": "Maturity date is required.",
    //     "date.base": "Maturity date must be a valid date.",
    //     "date.greater": "Maturity date must be later than the start date."
    //   })
    maturity_period:Joi.number()
    .optional()
    .messages({
      "any.required": "Maturity period id required.",
      "number.base": "Maturity period must be a valid number.",
      "number.integer": "Maturity period must be an integer."
    }),
  });
}

export default Validator;