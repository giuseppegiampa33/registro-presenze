const Joi = require('joi');

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).max(50).required(),
        lastName: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('intern', 'admin').optional(),
        companyId: Joi.number().integer().optional().allow(null)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

const validateAttendance = (req, res, next) => {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    const schema = Joi.object({
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required()
            .messages({ 'string.pattern.base': 'Date must be in YYYY-MM-DD format' }),
        status: Joi.string().valid('present', 'absent', 'late').required(),
        morningStart: Joi.string().pattern(timePattern).optional().allow(null, ''),
        morningEnd: Joi.string().pattern(timePattern).optional().allow(null, ''),
        afternoonStart: Joi.string().pattern(timePattern).optional().allow(null, ''),
        afternoonEnd: Joi.string().pattern(timePattern).optional().allow(null, ''),
        notes: Joi.string().max(500).optional().allow(null, ''),
        userId: Joi.string().optional() // for admin overrides
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};

module.exports = { validateRegister, validateLogin, validateAttendance };
