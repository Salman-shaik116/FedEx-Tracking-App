"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ActiveTokenSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    token: { type: String, required: true },
    issuedAt: { type: Date, required: true, toISOString: true },
    expiresAt: { type: Date, required: true, toISOString: true },
});
const ActiveToken = mongoose_1.default.model('ActiveToken', ActiveTokenSchema);
exports.default = ActiveToken;
//# sourceMappingURL=ActiveTokens.js.map