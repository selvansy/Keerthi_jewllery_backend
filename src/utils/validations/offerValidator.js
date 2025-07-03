import Joi from 'joi';

class OfferValidator {
  offerValidations = Joi.object({
    type: Joi.string()
      .valid("Offers","Banner","Marqueee","Video","Popup")
      .required()
      .messages({
        "any.required": "Type is required",
        "any.only": "Type must be one of Offers, Banner, Marqueee, Video or Popup"
      }),

    id_branch: Joi.string()
      .trim()
      .required()
      .messages({
        "any.required": "id_branch ID is required",
        "string.empty": "id_branch ID cannot be empty",
        "string.base": "id_branch ID must be a string",
      }),

      title: Joi.string()
      .trim()
      .when("type", {
        is: "Offers",
        then: Joi.required().messages({
          "any.required": "Title is required",
        }),
      }),

  

      description: Joi.string()
      .trim()
      .when("type", {
        is: Joi.valid("Offers", "Marqueee"),
        then: Joi.required().messages({
          "any.required": "Description is required",
        }),
      }),

      videoId: Joi.string()
      .trim()
      .when("type", {
        is: "Video",
        then: Joi.required().messages({
          "any.required": "Video is required",
        }),
      }),

  });


}

export default OfferValidator;
