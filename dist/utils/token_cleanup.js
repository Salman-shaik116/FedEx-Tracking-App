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
exports.cleanupExpiredTokensOnStartup = cleanupExpiredTokensOnStartup;
exports.cleanupExpiredTokensOnRunning = cleanupExpiredTokensOnRunning;
const ActiveTokens_1 = __importDefault(require("../models/ActiveTokens"));
const ExpiredTokens_1 = __importDefault(require("../models/ExpiredTokens"));
function cleanupExpiredTokensOnStartup() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const now = new Date();
            const expiredTokens = yield ActiveTokens_1.default.find({ expiresAt: { $lte: now } });
            if (expiredTokens.length > 0) {
                console.log(` Found ${expiredTokens.length} expired tokens. Moving to expired list...`);
                const formattedExpired = expiredTokens.map((t) => ({
                    email: t.email,
                    token: t.token,
                    issuedAt: t.issuedAt,
                    expiresAt: t.expiresAt,
                    expiredAt: now,
                }));
                yield ExpiredTokens_1.default.insertMany(formattedExpired);
                const tokenValues = expiredTokens.map((t) => t.token);
                yield ActiveTokens_1.default.deleteMany({ token: { $in: tokenValues } });
                console.log(`Cleanup completed successfully.`);
            }
            else {
                console.log(` No expired tokens found.`);
            }
        }
        catch (error) {
            console.error("Error during cleanup:", error);
        }
    });
}
function cleanupExpiredTokensOnRunning() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        try {
            const expiredTokens = yield ActiveTokens_1.default.find({ expiresAt: { $lte: now } });
            if (expiredTokens.length === 0)
                return;
            const toInsert = expiredTokens.map((tokenDoc) => ({
                email: tokenDoc.email,
                token: tokenDoc.token,
                expiredAt: tokenDoc.expiresAt,
                reason: "Token expired",
            }));
            yield ExpiredTokens_1.default.insertMany(toInsert);
            const ids = expiredTokens.map((t) => t._id);
            yield ActiveTokens_1.default.deleteMany({ _id: { $in: ids } });
            console.log(`Moved ${expiredTokens.length} expired token(s) to ExpiredTokens.`);
        }
        catch (error) {
            console.error("Error during token cleanup:", error);
        }
    });
}
//# sourceMappingURL=token_cleanup.js.map