"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string(),
});
exports.resetPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z.string().min(6),
});
//# sourceMappingURL=authValidators.js.map