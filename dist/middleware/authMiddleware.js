"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authenticateToken;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const Token_utils_1 = require("../utils/Token_utils");
const ActiveTokens_1 = __importDefault(require("../models/ActiveTokens"));
const JWT_SECRET = process.env.JWT_SECRET;
function authenticateToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
        if (!token)
            return res.status(http_codes_1.default.UNAUTHORIZED).json({ message: "Token required....!!!" });
        if (yield (0, Token_utils_1.isTokenExpired)(token)) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Token has been logged out" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (err) {
            console.error("JWT verify error:", err.message);
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Invalid or expired token" });
        }
        const stillActive = yield ActiveTokens_1.default.findOne({ token });
        if (!stillActive) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Token is no longer active" });
        }
        req.user = payload;
        req.token = token;
        next();
    });
}
//# sourceMappingURL=authMiddleware.js.map