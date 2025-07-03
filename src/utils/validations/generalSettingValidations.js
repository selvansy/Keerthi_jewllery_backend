import Joi from 'joi';

class generalSettingValidator {
    generalSettingValidator = Joi.object({
    id_client: Joi.string()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "any.required": "Client ID is required",
        "string.empty": "Client ID cannot be empty",
        "string.base": "Client ID must be a string",
        "string.pattern.base": "Client ID must be a valid MongoDB ObjectId",
      }),

    id_branch: Joi.string()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "any.required": "Branch ID is required",
        "string.empty": "Branch ID cannot be empty",
        "string.base": "Branch ID must be a string",
        "string.pattern.base": "Branch ID must be a valid MongoDB ObjectId",
      }),

    id_project: Joi.string()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "any.required": "Project ID is required",
        "string.empty": "Project ID cannot be empty",
        "string.base": "Project ID must be a string",
        "string.pattern.base": "Project ID must be a valid MongoDB ObjectId",
      }),
  });
}

export default generalSettingValidator;