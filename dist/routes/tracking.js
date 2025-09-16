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
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const fedexservice_1 = require("../services/fedexservice");
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const router = express_1.default.Router();
router.get("/:trackingNumber", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const trackingNumber = req.params.trackingNumber;
    if (!trackingNumber)
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Tracking number required" });
    try {
        const trackingInfo = yield (0, fedexservice_1.trackShipment)(trackingNumber);
        res.status(http_codes_1.default.OK).json(trackingInfo);
    }
    catch (error) {
        res.status(http_codes_1.default.SERVER_ERROR).json({ error: error.message });
    }
    return res;
}));
exports.default = router;
//# sourceMappingURL=tracking.js.map