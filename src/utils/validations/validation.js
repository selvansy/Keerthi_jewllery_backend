import Joi from 'joi';

class Validator {
  branchValidationSchemas = {
    addBranch: Joi.object({
      id_client: Joi.string().required(),
      branch_name: Joi.string().trim().required().messages({
        "any.required": "Branch name is required",
        "string.empty": "Branch name cannot be empty",
        "string.base": "Branch name must be a string",
      }),
      branch_landline: Joi.string().trim().required().messages({
        "any.required": "Branch landline is required",
        "string.empty": "Branch landline cannot be empty",
      }),
      mobile: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
          "string.pattern.base": "Mobile format is not valid",
          "any.required": "Mobile number is required",
        }),
      whatsapp_no: Joi.string()
        .pattern(/^\d{10}$/)
        .required()
        .messages({
          "string.pattern.base": "Whatsapp number format is not valid",
          "any.required": "Whatsapp number is required",
        }),
      address: Joi.string().trim().required().messages({
        "any.required": "Address is required",
        "string.empty": "Address cannot be empty",
      }),
      pincode: Joi.string().trim().required().messages({
        "any.required": "Pincode is required",
        "string.empty": "Pincode cannot be empty",
      }),
      id_country: Joi.string().required().messages({
        "any.required": "Country is required",
      }),
      id_state: Joi.string().required().messages({
        "any.required": "State is required",
      }),
      id_city: Joi.string().required().messages({
        "any.required": "City is required",
      }),
      email: Joi.string().email().required().messages({
        "string.email": "Email format is not valid",
        "any.required": "Email is required",
      }),
    }),

    getBranch: Joi.object({
      page: Joi.number().integer().min(1).required().messages({
        "number.base": "Page must be a number",
        "number.min": "Page must be at least 1",
        "any.required": "Page is required",
      }),
      limit: Joi.number().integer().min(1).required().messages({
        "number.base": "Limit must be a number",
        "number.min": "Limit must be at least 1",
        "any.required": "Limit is required",
      }),
      search: Joi.string().allow("").optional(),
    }),
  };

  metalValidations = {
    metal_name: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Metal name is required",
        "string.empty": "Metal name cannot be empty",
        "string.base": "Metal name must be a string",
        "string.pattern.base": "Metal name cannot contain special characters or numbers",
      }),
  };

  paymentModeValidations = Joi.object({
    id_project: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Project id is required",
        "string.empty": "Project id cannot be empty",
        "string.base": "Project id must be a string",
      }),
    mode_name: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Mode name is required",
        "string.empty": "Mode name cannot be empty",
        "string.base": "Mode name must be a string",
        "string.pattern.base": "Mode name cannot contain special characters or numbers",
      }),
    payment_method_type: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Payment method is required",
        "string.empty": "Payment method cannot be empty",
        "string.base": "Payment method must be a string",
        "string.pattern.base": "Payment method cannot contain special characters or numbers",
      })
  });

  menuSettngValidations = Joi.object({
    id_project: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Project id is required",
        "string.empty": "Project id cannot be empty",
        "string.base": "Project id must be a string",
      }),
    menu_name: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Menu name is required",
        "string.empty": "Menu name cannot be empty",
        "string.base": "Menu name must be a string",
        "string.pattern.base": "Mode name cannot contain special characters or numbers",
      }),
    menu_icon: Joi.string().optional(),
    component_name: Joi.string().optional(),
    menu_path: Joi.string().optional(),
    display_order: Joi.number()
      .required()
      .messages({
        "any.required": "Payment method is required",
        "string.empty": "Payment method cannot be empty",
        "string.base": "Payment method must be a string",
        "string.pattern.base": "Payment method cannot contain special characters or numbers",
      })
  });

  subMenuSettngValidations = Joi.object({
    id_project: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Project id is required",
        "string.empty": "Project id cannot be empty",
        "string.base": "Project id must be a string",
      }),
    id_menu: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Project id is required",
        "string.empty": "Project id cannot be empty",
        "string.base": "Project id must be a string",
      }),
    submenu_name: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Menu name is required",
        "string.empty": "Menu name cannot be empty",
        "string.base": "Menu name must be a string",
        "string.pattern.base": "Mode name cannot contain special characters or numbers",
      }),
    display_order: Joi.number()
      .required()
      .messages({
        "any.required": "display order is required",
        "string.empty": "display order cannot be empty",
        "string.base": "display order must be a string",
        "string.pattern.base": "display order cannot contain special characters or numbers",
      }),
    pathurl: Joi.string()
      .required()
      .messages({
        "any.required": "Path url is required",
        "string.empty": "Path url cannot be empty",
        "string.base": "Path url must be a string",
        "string.pattern.base": "Path url cannot contain special characters or numbers",
      })
  });

  campaignTypeValidations = Joi.object({ // todo
    name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Name is required",
        "string.empty": "Name cannot be empty",
        "string.base": "Name must be a string",
      }),
    description: Joi.string()
      .allow(null, '')
      .optional(),

  });

}

export default Validator;