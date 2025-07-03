import Joi from 'joi';

class TicketValidator {
  ticketValidations = Joi.object({
    description: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
        "string.base": "Description must be a string",
      }),

    option: Joi.string()
      .optional()
      .messages({
        "string.base": "Option must be a string",
      }),
  });
}

export default TicketValidator;
