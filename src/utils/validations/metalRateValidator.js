import Joi from 'joi';

class Validator {

 metalRateSchema = Joi.object({
  id_branch: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid id_branch format.",
    "string.length": "id_branch must be a 24-character hex string.",
    "any.required": "id_branch is required.",
  }),
  purity_id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid purity_id format.",
    "string.length": "purity_id must be a 24-character hex string.",
    "any.required": "purity_id is required.",
  }),
  material_type_id: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid material_type_id format.",
    "string.length": "material_type_id must be a 24-character hex string.",
    "any.required": "material_type_id is required.",
  }),
  rate: Joi.number().positive().required().messages({
    "number.base": "Rate must be a valid number.",
    "number.positive": "Rate must be a positive value.",
    "any.required": "Rate is required.",
  }),
  created_by: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Invalid created_by format.",
    "string.length": "created_by must be a 24-character hex string.",
  }),
  modified_by: Joi.string().hex().length(24).optional().messages({
    "string.hex": "Invalid modified_by format.",
    "string.length": "modified_by must be a 24-character hex string.",
  }),
  metal_name: Joi.string(),
  purity_name: Joi.string()
});

metalRateValidations = Joi.alternatives().try(
  this.metalRateSchema,
  Joi.array().items(this.metalRateSchema) 
);
}

export default Validator;