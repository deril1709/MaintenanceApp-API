const Joi = require('joi');

const UserPayloadSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    fullname: Joi.string().required(),
    role: Joi.string().valid('admin', 'teknisi').required(),
});

module.exports = {UserPayloadSchema};