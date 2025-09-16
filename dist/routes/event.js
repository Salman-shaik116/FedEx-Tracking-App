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
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const event_1 = __importDefault(require("../models/event"));
const dayjs_1 = __importDefault(require("dayjs"));
const customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
dayjs_1.default.extend(customParseFormat_1.default);
const router = express_1.default.Router();
router.post("/create-Event", authMiddleware_1.default, (req, res) => {
    var _a, _b;
    try {
        const { title, description, date, location } = req.body;
        const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!title || !description || !location || !date) {
            return res.status(http_codes_1.default.NOT_FOUND).json({
                message: "Event details are requied please give them"
            });
        }
        ;
        const allowedRoles = ["employer", "superadmin"];
        if (!allowedRoles.includes(role)) {
            console.log("Decoded user from token:", req.user);
            console.log("User role from token:", req.user.role);
            return res.status(http_codes_1.default.FORBIDDEN).json({
                Message: "You are not authorized to create events....!!"
            });
        }
        ;
        const parsedDate = (0, dayjs_1.default)(date, "DD/MM/YYYY", true);
        if (!parsedDate.isValid()) {
            return res.status(400).json({ error: "Invalid date format. Use DD/MM/YYYY" });
        }
        const eventId = Math.floor(Math.random() * 1000000);
        const newEvent = new event_1.default({
            title,
            description,
            date: parsedDate.toDate(),
            location,
            createdBy: userId,
            EventId: eventId
        });
        newEvent.save();
        return res.status(http_codes_1.default.OK).json({
            message: "Event created successfully.........", Event: newEvent
        });
    }
    catch (error) {
        console.error("Error creating event...", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to create event", Error: error });
    }
});
router.get("/available-events", authMiddleware_1.default, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield event_1.default.find();
        res.status(http_codes_1.default.OK).json({ events });
    }
    catch (error) {
        console.error("Error fetching available events:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch available events" });
    }
}));
router.get("/employer-events/:eventId", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const event = yield event_1.default.findById(eventId);
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        if (event.createdBy.toString() !== userId && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "You are not authorized to view this event" });
        }
        res.status(http_codes_1.default.OK).json({ event });
    }
    catch (error) {
        console.error("Error fetching event:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch event", error });
    }
}));
router.put("/employer-events/:eventId", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = req.params.eventId;
        const { title, description, date, location } = req.body;
        const userId = req.user.id;
        const event = yield event_1.default.findById(eventId);
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        if (event.createdBy.toString() !== userId) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "You are not authorized to update this event" });
        }
        event.title = title;
        event.description = description;
        event.date = date;
        event.location = location;
        yield event.save();
        res.status(http_codes_1.default.OK).json({ message: "Event updated successfully", event });
    }
    catch (error) {
        console.error("Error updating event:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to update event", error });
    }
}));
router.delete("/employer-events/:eventId", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id;
        const event = yield event_1.default.findById(eventId);
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        if (event.createdBy.toString() !== userId) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "You are not authorized to delete this event" });
        }
        yield event.deleteOne();
        res.status(http_codes_1.default.OK).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting event:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to delete event", error });
    }
}));
router.get("/all-events", authMiddleware_1.default, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const events = yield event_1.default.find();
        res.status(http_codes_1.default.OK).json({ events });
    }
    catch (error) {
        console.error("Error fetching all events:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch all events", error });
    }
}));
router.put("/all-events/:eventId", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = req.params.eventId;
    const { title, description, date, location } = req.body;
    try {
        const event = yield event_1.default.findById(eventId);
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        event.title = title;
        event.description = description;
        event.date = date;
        event.location = location;
        yield event.save();
        res.status(http_codes_1.default.OK).json({ message: "Event updated successfully", event });
    }
    catch (error) {
        console.error("Error updating event:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to update event", error });
    }
}));
router.delete("/all-events/:eventId", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = req.params.eventId;
    try {
        const event = yield event_1.default.findById(eventId);
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        yield event.deleteOne();
        res.status(http_codes_1.default.OK).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting event:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to delete event", error });
    }
}));
exports.default = router;
//# sourceMappingURL=event.js.map