"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "User not authenticated...!!" });
        }
        if (!allowedRoles.includes(user.role)) {
            return res.status(http_codes_1.default.FORBIDDEN).json({
                message: `Access denied  for role : ${user.role}`
            });
        }
        ;
        next();
    };
};
exports.default = authorizeRole;
//# sourceMappingURL=roleMiddleware.js.map