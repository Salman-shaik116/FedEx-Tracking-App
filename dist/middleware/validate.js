"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validate;
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.format(),
            });
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map