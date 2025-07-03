import Joi from 'joi';

class Validator {
  employeeValidations = Joi.object({
    firstname: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "First name is required.",
        "string.empty": "First name cannot be empty.",
        "string.base": "First name must be a valid string."
      }),

    mobile: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{10}$/)
      .messages({
        "any.required": "Mobile number is required.",
        "string.empty": "Mobile number cannot be empty.",
        "string.base": "Mobile number must be a valid string.",
        "string.pattern.base": "Mobile number must be a 10-digit number."
      }),

    gender: Joi.number()
      .integer()
      .required()
      .valid(1,2,3)
      .messages({
        "any.required": "Gender is required.",
        "number.base": "Gender must be a valid number.",
        "number.integer": "Gender must be an integer.",
        "any.only": "Gender must be 1 (Male) or 2 (Female) or 3 (other)."
      }),

    id_country: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        "any.required": "Country ID is required.",
        "string.empty": "Country ID cannot be empty.",
        "string.base": "Country ID must be a valid string.",
        "string.pattern.base": "Country ID must be a valid 24-character MongoDB ObjectId."
      }),

    id_state: Joi.string()
      .trim()
      .required()
      .pattern(/^[a-fA-F0-9]{24}$/) 
      .messages({
        "any.required": "State ID is required.",
        "string.empty": "State ID cannot be empty.",
        "string.base": "State ID must be a valid string.",
        "string.pattern.base": "State ID must be a valid 24-character MongoDB ObjectId."
      }),

    id_city: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "City ID is required.",
        "string.empty": "City ID cannot be empty.",
        "string.base": "City ID must be a valid string."
      }),

    pincode: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{6}$/)
      .messages({
        "any.required": "Pincode is required.",
        "string.empty": "Pincode cannot be empty.",
        "string.base": "Pincode must be a valid string.",
        "string.pattern.base": "Pincode must be a 6-digit number."
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

    date_of_birth: Joi.date()
      .required()
      .max('now')
      .messages({
        "any.required": "Date of birth is required.",
        "date.base": "Date of birth must be a valid date.",
        "date.max": "Date of birth cannot be in the future."
      }),

    date_of_join: Joi.date()
      .required()
      .greater(Joi.ref('date_of_birth'))
      .messages({
        "any.required": "Date of joining is required.",
        "date.base": "Date of joining must be a valid date.",
        "date.greater": "Date of joining must be later than the date of birth."
      }),

    aadhar_number: Joi.string()
      .trim()
      .optional()
      .pattern(/^\d{12}$/)
      .messages({
        "any.required": "Aadhar number is required.",
        "string.empty": "Aadhar number cannot be empty.",
        "string.base": "Aadhar number must be a valid string.",
        "string.pattern.base": "Aadhar number must be a 12-digit number."
      })
  });
}

export default Validator;