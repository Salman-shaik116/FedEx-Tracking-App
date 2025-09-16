"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ExpiredTokenSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    expiredAt: { type: Date, required: true },
    reason: { type: String },
});
const ExpiredToken = mongoose_1.default.model('ExpiredToken', ExpiredTokenSchema);
exports.default = ExpiredToken;
//# sourceMappingURL=ExpiredTokens.js.map