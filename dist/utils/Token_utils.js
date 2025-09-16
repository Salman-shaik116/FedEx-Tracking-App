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
exports.isTokenExpired = exports.saveExpiredToken = void 0;
const ExpiredTokens_1 = __importDefault(require("../models/ExpiredTokens"));
const saveExpiredToken = (token, expiresAt) => __awaiter(void 0, void 0, void 0, function* () {
    yield ExpiredTokens_1.default.create({ token, expiresAt });
});
exports.saveExpiredToken = saveExpiredToken;
const isTokenExpired = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield ExpiredTokens_1.default.findOne({ token });
    return !!existing;
});
exports.isTokenExpired = isTokenExpired;
//# sourceMappingURL=Token_utils.js.map