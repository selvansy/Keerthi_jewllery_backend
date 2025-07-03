import Joi from 'joi';

class CategoryValidator {
  categoryValidations = Joi.object({
    category_name: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Category Name is required",
        "string.empty": "Category Name cannot be empty",
        "string.base": "Category Name must be a string",
      }),
      // description: Joi.string()
      // .trim()
      // .optional(),

    id_metal: Joi.string()
      .required()
      .messages({
        "any.required": "Metal Id is required",
        "string.empty": "Metal cannot be empty",
        "string.base": "Metal must be a string",
      }),

    id_branch: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Branch Id is required",
        "string.empty": "Branch cannot be empty",
        "string.base": "Branch must be a string",
      }),
  });
}

export default CategoryValidator;
