import Joi from 'joi';

class Validator {
  customerValidations = Joi.object({
    firstname: Joi.string().trim().required().messages({
      'any.required': 'First name is required.',
      'string.empty': 'First name cannot be empty.',
      'string.base': 'First name must be a valid string.',
    }),
    address: Joi.string().trim().optional().messages({
      'any.required': 'Address is required.',
      'string.empty': 'Address cannot be empty.',
      'string.base': 'Address must be a valid string.',
    }),

    mobile: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{10}$/)
      .messages({
        'any.required': 'Mobile number is required.',
        'string.empty': 'Mobile number cannot be empty.',
        'string.pattern.base': 'Mobile number must be a 10-digit number.',
      }),

    whatsapp: Joi.string()
      .trim()
      .optional()
      .pattern(/^\d{10}$/)
      .messages({
        'string.pattern.base': 'WhatsApp number must be a 10-digit number.',
      }),

    gender: Joi.number().integer().optional().valid(1, 2, 3).messages({
      'number.base': 'Gender must be a valid number.',
      'number.integer': 'Gender must be an integer.',
      'any.only': 'Gender must be 1 (Male), 2 (Female), or 3 (Other).',
    }),

    id_country: Joi.string()
      .trim()
      .optional()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        'any.required': 'Country ID is required.',
        'string.empty': 'Country ID cannot be empty.',
        'string.base': 'Country ID must be a valid string.',
        'string.pattern.base':
          'Country ID must be a valid 24-character MongoDB ObjectId.',
      }),

    id_state: Joi.string()
      .trim()
      .optional()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        'any.required': 'State ID is required.',
        'string.empty': 'State ID cannot be empty.',
        'string.base': 'State ID must be a valid string.',
        'string.pattern.base':
          'State ID must be a valid 24-character MongoDB ObjectId.',
      }),

    id_city: Joi.string().trim().required().messages({
      'any.required': 'City ID is required.',
      'string.empty': 'City ID cannot be empty.',
      'string.base': 'City ID must be a valid string.',
    }),

    pincode: Joi.string()
      .trim()
      .optional()
      .pattern(/^\d{6}$/)
      .messages({
        'any.required': 'Pincode is required.',
        'string.empty': 'Pincode cannot be empty.',
        'string.base': 'Pincode must be a valid string.',
        'string.pattern.base': 'Pincode must be a 6-digit number.',
      }),

    id_branch: Joi.string()
      .trim()
      .optional()
      .pattern(/^[a-fA-F0-9]{24}$/)
      .messages({
        'any.required': 'Branch ID is required.',
        'string.empty': 'Branch ID cannot be empty.',
        'string.base': 'Branch ID must be a valid string.',
        'string.pattern.base':
          'Branch ID must be a valid 24-character MongoDB ObjectId.',
      }),

    mpin: Joi.string()
      .trim()
      .optional()
      .pattern(/^\d{4}$/)
      .messages({
        'string.pattern.base': 'MPIN must be a 4-digit number.',
      }),
  });

  
}

export default Validator;