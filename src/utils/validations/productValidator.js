import Joi from "joi";

class ProductValidator {
  productValidations = Joi.object({
    product_name: Joi.string().trim().required().messages({
      "any.required": "Product Name is required",
      "string.base": "Product Name must be a string",
      "string.empty": "Product Name cannot be empty",
    }),

    code: Joi.string().trim().required().messages({
      "any.required": "Code is required",
      "string.base": "Code must be a string",
      "string.empty": "Code cannot be empty",
    }),

    weight: Joi.number().greater(0).required().messages({
      "any.required": "Weight is required",
      "number.base": "Weight must be a number",
      "number.greater": "Weight must be greater than 0",
    }),

    id_category: Joi.string().trim().required().messages({
      "any.required": "Category ID is required",
      "string.base": "Category ID must be a string",
    }),

    id_purity: Joi.string().required().messages({
      "any.required": "Purity is required",
      "number.base": "Purity must be a number",
    }),

    gst: Joi.number().greater(0).required().messages({
      "any.required": "GST is required",
      "number.base": "GST must be a number",
      "number.greater": "GST must be greater than 0",
    }),

    description: Joi.string().trim().required().messages({
      "any.required": "Description is required",
      "string.base": "Description must be a string",
      "string.empty": "Description cannot be empty",
    }),

    id_metal: Joi.string().required().messages({
      "any.required": "Metal ID is required",
      "number.base": "Metal ID must be a number",
    }),

    id_branch: Joi.string().trim().required().messages({
      "any.required": "Branch ID is required",
      "string.base": "Branch ID must be a string",
    }),

    showprice: Joi.boolean().required().messages({
      "any.required": "Show price type is required",
      "number.base": "Show price type must be a number",
    }),

    product_image: Joi.array()
      .items(
        Joi.string().trim().messages({
          "string.base": "Each product image must be a string",
          "string.empty": "Product image cannot be empty",
        })
      )
      .optional()
      .messages({
        "array.base": "Product Image must be an array of strings",
      }),

    // makingCharges: Joi.object({
    //   actualValue: Joi.number().greater(0).required().messages({
    //     "any.required": "Actual Value is required",
    //     "number.base": "Actual Value must be a number",
    //     "number.greater": "Actual Value must be greater than 0",
    //   }),

    //   discountedValue: Joi.number().greater(0).optional().messages({
    //     "number.base": "Discounted Value must be a number",
    //     "number.greater": "Discounted Value must be greater than 0",
    //   }),

    //   discountedPercentage: Joi.number()
        
    //     .less(100)
    //     .optional()
    //     .messages({
    //       "number.base": "Discounted Percentage must be a number",
    //       "number.greater": "Discounted Percentage must be greater than 0",
    //       "number.less": "Discounted Percentage must be less than 100",
    //     }),

    //   discountView: Joi.boolean().required().messages({
    //     "any.required": "Discount View is required",
    //     "boolean.base": "Discount View must be a boolean",
    //   }),

    //   mcView: Joi.boolean().required().messages({
    //     "any.required": "MC View is required",
    //     "boolean.base": "MC View must be a boolean",
    //   }),

    //   mode: Joi.string().valid("amount", "weight").required().messages({
    //     "any.required": "Mode is required",
    //     "string.base": "Mode must be a string",
    //     "any.only": "Mode must be either 'amount' or 'weight'",
    //   }),
    // })
    //   .required()
    //   .messages({
    //     "any.required": "Making Charge is required",
    //     "object.base": "Making Charge must be an object",
    //   }),

    // wastageCharges: Joi.object({
    //   actualValue: Joi.number().greater(0).required().messages({
    //     "any.required": "Actual Value is required",
    //     "number.base": "Actual Value must be a number",
    //     "number.greater": "Actual Value must be greater than 0",
    //   }),

    //   discountedValue: Joi.number().greater(0).optional().messages({
    //     "number.base": "Discounted Value must be a number",
    //     "number.greater": "Discounted Value must be greater than 0",
    //   }),

    //   discountedPercentage: Joi.number()
      
    //     .less(100)
    //     .optional()
    //     .messages({
    //       "number.base": "Discounted Percentage must be a number",
    //       "number.greater": "Discounted Percentage must be greater than 0",
    //       "number.less": "Discounted Percentage must be less than 100",
    //     }),

    //   discountView: Joi.boolean().required().messages({
    //     "any.required": "Discount View is required",
    //     "boolean.base": "Discount View must be a boolean",
    //   }),

    //   wastageView: Joi.boolean().required().messages({
    //     "any.required": "WC View is required",
    //     "boolean.base": "WC View must be a boolean",
    //   }),

    //   mode: Joi.string().valid("amount", "weight").required().messages({
    //     "any.required": "Mode is required",
    //     "string.base": "Mode must be a string",
    //     "any.only": "Mode must be either 'amount' or 'weight'",
    //   }),
    // })
    //   .required()
    //   .messages({
    //     "any.required": "Wastage Charge is required",
    //     "object.base": "Wastage Charge must be an object",
    //   }),
  });
}

export default ProductValidator;
