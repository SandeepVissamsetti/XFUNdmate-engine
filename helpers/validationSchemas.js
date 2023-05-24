const Joi = require("joi");

exports.fundCreateSchema = Joi.object({
  fund_name: Joi.string().required(),
});
