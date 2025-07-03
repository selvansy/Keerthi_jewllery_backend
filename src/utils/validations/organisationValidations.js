import Joi from 'joi';

class OrganisationValidator {
  categoryValidations = Joi.object({
    company_name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Company name is required",
        "string.empty": "Company name cannot be empty",
        "string.base": "Company name must be a string",
      }),

    mobile: Joi.number()
      .required()
      .messages({
        "any.required": "Mobile number is required",
        "number.base": "Mobile number must be a number",
      }),

    pincode: Joi.number()
      .required()
      .messages({
        "any.required": "Pincode is required",
        "number.base": "Pincode must be a number",
      }),

    short_code: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Short code is required",
        "string.empty": "Short code cannot be empty",
        "string.base": "Short code must be a string",
      }),

    address: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Address is required",
        "string.empty": "Address cannot be empty",
        "string.base": "Address must be a string",
      }),

    id_city: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "City ID is required",
        "string.empty": "City ID cannot be empty",
        "string.base": "City ID must be a string",
      }),

    id_state: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "State ID is required",
        "string.empty": "State ID cannot be empty",
        "string.base": "State ID must be a string",
      }),

    id_country: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Country ID is required",
        "string.empty": "Country ID cannot be empty",
        "string.base": "Country ID must be a string",
      }),

    email: Joi.string()
      .email()
      .required()
      .messages({
        "any.required": "Email is required",
        "string.empty": "Email cannot be empty",
        "string.email": "Email must be a valid email address",
      }),

    website: Joi.string()
      .uri()
      .optional()
      .messages({
        "string.uri": "Website must be a valid URL",
      }),

    // background_color: Joi.string()
    //   .optional()
    //   .messages({
    //     "string.base": "Background color must be a string",
    //   }),

    whatsapp_no: Joi.string()
      .optional()
      .messages({
        "string.base": "WhatsApp number must be a string",
      }),

    // toll_free: Joi.number()
    //   .optional()
    //   .messages({
    //     "number.base": "Toll-free number must be a number",
    //   }),
  });
}

export default OrganisationValidator;