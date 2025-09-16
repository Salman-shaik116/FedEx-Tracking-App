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
const mongoose_1 = __importDefault(require("mongoose"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const event_1 = __importDefault(require("../models/event"));
const registration_1 = __importDefault(require("../models/registration"));
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const router = express_1.default.Router();
router.post("/register/:eventId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["user"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const eventParam = req.params.eventId;
    try {
        let event = null;
        if (mongoose_1.default.Types.ObjectId.isValid(eventParam)) {
            event = yield event_1.default.findById(eventParam);
        }
        else if (!Number.isNaN(Number(eventParam))) {
            event = yield event_1.default.findOne({ EventId: Number(eventParam) });
        }
        else {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid event identifier" });
        }
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found...!!" });
        }
        const alreadyRegistered = yield registration_1.default.findOne({ user: userId, event: event._id });
        if (alreadyRegistered) {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Already Registered..!!" });
        }
        const registrationId = Math.floor(Math.random() * 1000000);
        const newRegistration = new registration_1.default({
            user: userId,
            event: event._id,
            registrationId,
        });
        yield newRegistration.save();
        return res.status(http_codes_1.default.OK).json({ message: "Registered successfully..!!", newRegistration });
    }
    catch (error) {
        console.error("Registration Error : ", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "something went wrong..!!", Error: error });
    }
}));
router.get("/myregistrations", authMiddleware_1.default, (0, roleMiddleware_1.default)(["user"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const registrations = yield registration_1.default.find({ user: req.user.id }).populate("event");
        return res.status(http_codes_1.default.OK).json({ message: "Here are your Registrations : ", registrations });
    }
    catch (error) {
        console.error("Error fetching registrations : ", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Error fetching your registrations :", Error: error });
    }
}));
router.delete("/myregistrations/:registrationId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["user"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationParam = req.params.registrationId;
    try {
        let registration = null;
        if (mongoose_1.default.Types.ObjectId.isValid(registrationParam)) {
            registration = yield registration_1.default.findById(registrationParam);
        }
        else if (!Number.isNaN(Number(registrationParam))) {
            registration = yield registration_1.default.findOne({ registrationId: Number(registrationParam) });
        }
        else {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }
        if (!registration) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Registration not found" });
        }
        if (registration.user.toString() !== req.user.id) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "You can only cancel your own registrations" });
        }
        yield registration_1.default.findByIdAndDelete(registration._id);
        return res.status(http_codes_1.default.OK).json({ message: "Registration cancelled successfully" });
    }
    catch (error) {
        console.error("Error cancelling registration:", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to cancel registration", error });
    }
}));
router.get("/employer-registrations/:eventId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["employer"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rawEventId = req.params.eventId;
    try {
        let event = null;
        if (mongoose_1.default.Types.ObjectId.isValid(rawEventId)) {
            event = yield event_1.default.findById(rawEventId);
        }
        else if (!Number.isNaN(Number(rawEventId))) {
            event = yield event_1.default.findOne({ EventId: Number(rawEventId) });
        }
        else {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid event identifier" });
        }
        if (!event) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Event not found" });
        }
        if (event.createdBy.toString() !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "You are not authorized to view this event's registrations" });
        }
        const registrations = yield registration_1.default.find({ event: event._id }).populate("user");
        return res.status(http_codes_1.default.OK).json({ registrations });
    }
    catch (error) {
        console.error("Error fetching registrations for event:", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch registrations for this event", error });
    }
}));
router.get("/all-registrations", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin", "superadmin"]), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const registrations = yield registration_1.default.find().populate("user").populate("event");
        return res.status(http_codes_1.default.OK).json({ total: registrations.length, data: registrations, });
    }
    catch (error) {
        console.error("Error fetching all registrations:", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch all registrations", error });
    }
}));
router.put("/all-registrations/:registrationId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationParam = req.params.registrationId;
    const updateData = req.body;
    try {
        let registration = null;
        if (mongoose_1.default.Types.ObjectId.isValid(registrationParam)) {
            registration = yield registration_1.default.findById(registrationParam);
        }
        else if (!Number.isNaN(Number(registrationParam))) {
            registration = yield registration_1.default.findOne({ registrationId: Number(registrationParam) });
        }
        else {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }
        if (!registration) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Registration not found" });
        }
        const updatedRegistration = yield registration_1.default.findByIdAndUpdate(registration._id, updateData, { new: true });
        return res.status(http_codes_1.default.OK).json({ message: "Registration updated successfully", updatedRegistration });
    }
    catch (error) {
        console.error("Error updating registration:", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to update registration", error });
    }
}));
router.delete("/all-registrations/:registrationId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationParam = req.params.registrationId;
    try {
        let registration = null;
        if (mongoose_1.default.Types.ObjectId.isValid(registrationParam)) {
            registration = yield registration_1.default.findById(registrationParam);
        }
        else if (!Number.isNaN(Number(registrationParam))) {
            registration = yield registration_1.default.findOne({ registrationId: Number(registrationParam) });
        }
        else {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid registration identifier" });
        }
        if (!registration) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "Registration not found" });
        }
        yield registration_1.default.findByIdAndDelete(registration._id);
        return res.status(http_codes_1.default.OK).json({ message: "Registration deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting registration:", error);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to delete registration", error });
    }
}));
exports.default = router;
//# sourceMappingURL=registration.js.map