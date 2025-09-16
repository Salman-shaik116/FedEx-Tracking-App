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
exports.trackShipment = trackShipment;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let fedexToken;
function getFedExToken() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const url = `${process.env.FEDEX_BASE_URL}/oauth/token`;
        const payload = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: process.env.FEDEX_CLIENT_ID,
            client_secret: process.env.FEDEX_CLIENT_SECRET,
        });
        try {
            const response = yield axios_1.default.post(url, payload.toString(), {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });
            fedexToken = response.data.access_token;
            return fedexToken;
        }
        catch (error) {
            console.error("FedEx Token Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error("Failed to authenticate with FedEx API");
        }
    });
}
function trackShipment(trackingNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!fedexToken)
            yield getFedExToken();
        const url = `${process.env.FEDEX_BASE_URL}/track/v1/trackingnumbers`;
        try {
            const response = yield axios_1.default.post(url, { trackingInfo: [{ trackingNumberInfo: { trackingNumber } }], includeDetailedScans: true }, { headers: { Authorization: `Bearer ${fedexToken}`, "Content-Type": "application/json" } });
            return response.data;
        }
        catch (error) {
            console.error("Tracking Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw new Error("Tracking request failed.");
        }
    });
}
//# sourceMappingURL=fedexservice.js.map