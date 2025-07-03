import Joi from 'joi';
import mongoose from 'mongoose';

// Custom validation for MongoDB ObjectId
const objectIdValidation = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.message("Invalid ObjectId format");
  }
  return value;
};

class Validator {
  giftItemValidations = Joi.object({
    gift_vendorid: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Vendor ID is required",
        "string.empty": "Vendor ID cannot be empty",
        "string.base": "Vendor ID must be a string",
      }),

    gift_name: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z\s]+$/)
      .messages({
        "any.required": "Gift name is required",
        "string.empty": "Gift name cannot be empty",
        "string.base": "Gift name must be a string",
        "string.pattern.base": "Gift name cannot contain special characters or numbers",
      }),

      gift_code: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z0-9-_]+$/) 
      .messages({
        "any.required": "Gift code is required",
        "string.empty": "Gift code cannot be empty",
        "string.base": "Gift code must be a string",
        "string.pattern.base": "Gift code can only contain letters, numbers, hyphens, and underscores",
      }),
    

    id_branch: Joi.string()
      .required()
      .custom(objectIdValidation, "ObjectId validation")
      .messages({
        "any.required": "Branch ID is required",
        "string.empty": "Branch ID cannot be empty",
        "string.base": "Branch ID must be a string",
      }),
      // gift_image:Joi.string()
      // .optional()
  });

  giftVendorValidations = Joi.object({
    address: Joi.string()
      .trim()
      .optional()
      .messages({
        "any.required": "Address is required",
        "string.empty": "Address cannot be empty",
        "string.base": "Address must be a valid string",
      }),

    id_branch: Joi.string()
      .trim()
      .required()
      .custom(objectIdValidation, "ObjectId validation")
      .messages({
        "any.required": "Branch ID is required",
        "string.empty": "Branch ID cannot be empty",
        "string.base": "Branch ID must be a valid string",
      }),

    vendor_name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Vendor name is required",
        "string.empty": "Vendor name cannot be empty",
        "string.base": "Vendor name must be a valid string",
        "string.pattern.base": "Vendor name must only contain letters and spaces",
      }),

    mobile: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional()
      .messages({
        "any.required": "Mobile number is required",
        "string.empty": "Mobile number cannot be empty",
        "string.base": "Mobile number must be a valid string of digits",
        "string.pattern.base": "Mobile number must be exactly 10 digits",
      }),

    gst: Joi.string()
      .pattern(/^[0-9a-zA-Z]{15}$/)
      .optional()
      .messages({
        "any.required": "GST number is required",
        "string.empty": "GST number cannot be empty",
        "string.base": "GST number must be a valid string of digits",
        "string.pattern.base": "GST number must be exactly 15 digits",
      }),
  });

 
   giftIssuesValidations = Joi.object({
    issue_type: Joi.number()
      .required()
      .messages({
        "any.required": "Issue type is required",
        "number.base": "Issue type must be a valid number",
      }),
  
    id_branch: Joi.string()
      .trim()
      .required()
      .custom(objectIdValidation, "ObjectId validation")
      .messages({
        "any.required": "Branch ID is required",
        "string.empty": "Branch ID cannot be empty",
        "string.base": "Branch ID must be a valid string",
      }),
  
    id_giftinward: Joi.array()
      .items(Joi.string().trim().custom(objectIdValidation, "ObjectId validation"))
      .min(1)
      .required()
      .messages({
        "any.required": "Gift Inward ID is required",
        "array.min": "Gift Inward ID must contain at least one value",
        "string.empty": "Gift Inward ID cannot be empty",
        "string.base": "Gift Inward ID must be a valid string",
        "any.invalid": "Gift Inward ID must be a valid ObjectId",
      }),
  
    id_gift: Joi.array()
      .items(Joi.string().trim().custom(objectIdValidation, "ObjectId validation"))
      .optional()
      .messages({
        "string.empty": "Gift ID cannot be empty",
        "string.base": "Gift ID must be a valid string",
        "any.invalid": "Gift ID must be a valid ObjectId",
      }),
  
    gift_code: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required()
      .messages({
        "any.required": "Barcode is required",
        "array.min": "Barcode must contain at least one value",
        "string.empty": "Barcode cannot be empty",
        "string.base": "Barcode must be a valid string",
      }),
  
    id_customer: Joi.string()
      .trim()
      .required()
      .custom(objectIdValidation, "ObjectId validation")
      .messages({
        "any.required": "Customer ID is required",
        "string.empty": "Customer ID cannot be empty",
        "string.base": "Customer ID must be a valid string",
        "any.invalid": "Customer ID must be a valid ObjectId",
      }),
  
    gst_percent: Joi.number()
      .optional()
      .messages({
        "number.base": "GST percentage must be a valid number",
      }),
  
    divsion: Joi.array()
      .items(Joi.string().trim())
      .min(1)
      .required()
      .messages({
        "any.required": "Division is required",
        "array.min": "Division must contain at least one value",
        "string.empty": "Division cannot be empty",
        "string.base": "Division must be a valid string",
      }),
  
    excess_amount: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        "any.required": "Excess Amount is required",
        "array.min": "Excess Amount must contain at least one value",
        "number.base": "Excess Amount must be a valid number",
      }),
      
  });
}

export default Validator;