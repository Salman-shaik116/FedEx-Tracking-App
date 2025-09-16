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
const user_1 = __importDefault(require("../models/user"));
const event_1 = __importDefault(require("../models/event"));
const registration_1 = __importDefault(require("../models/registration"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const router = express_1.default.Router();
router.get("/overview", authMiddleware_1.default, (0, roleMiddleware_1.default)(["superadmin"]), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalUsers = yield user_1.default.countDocuments();
        const userRoles = yield user_1.default.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);
        const totalEvents = yield event_1.default.countDocuments();
        const totalRegistrations = yield registration_1.default.countDocuments();
        const topEvents = yield registration_1.default.aggregate([
            { $group: { _id: "$event", totalRegistrations: { $sum: 1 } } },
            { $sort: { totalRegistrations: -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "events",
                    localField: "_id",
                    foreignField: "_id",
                    as: "eventDetails"
                }
            },
            {
                $unwind: "$eventDetails"
            },
            {
                $project: {
                    _id: 0,
                    eventId: "$eventDetails._id",
                    title: "$eventDetails.title",
                    totalRegistrations: 1
                }
            }
        ]);
        res.json({
            stats: {
                users: { total: totalUsers, byRole: userRoles },
                events: totalEvents,
                registrations: totalRegistrations,
                top3Events: topEvents
            }
        });
    }
    catch (err) {
        console.error("Analytics error:", err);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Internal Server Error" });
    }
}));
router.get("/activity", authMiddleware_1.default, (0, roleMiddleware_1.default)(["superadmin"]), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newUsers = yield user_1.default.find({ createdAt: { $gte: sevenDaysAgo } });
        const newEvents = yield event_1.default.find({ date: { $gte: sevenDaysAgo } });
        const newRegistrations = yield registration_1.default.find({ createdAt: { $gte: sevenDaysAgo } });
        res.json({
            recentActivity: {
                newUsers: newUsers.length,
                newEvents: newEvents.length,
                newRegistrations: newRegistrations.length
            }
        });
    }
    catch (err) {
        console.error("Activity error:", err);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Internal Server Error" });
    }
}));
exports.default = router;
//# sourceMappingURL=analytics.js.map