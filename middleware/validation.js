const Joi = require("joi");

const userValidationSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const productValidationSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    brand: Joi.string().min(2).max(50).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().positive().required(),
    stockQuantity: Joi.number().integer().min(0).required(),
    category: Joi.string().min(3).max(50).required()
});

const profileValidationSchema = Joi.object({
    name: Joi.string().min(3).max(50).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).max(50).optional(),
});

module.exports = {
    userValidationSchema,
    productValidationSchema,
    profileValidationSchema
};
