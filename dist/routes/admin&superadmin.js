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
const roleMiddleware_1 = __importDefault(require("../middleware/roleMiddleware"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const user_1 = __importDefault(require("../models/user"));
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const router = express_1.default.Router();
router.post("/create-user", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin", "superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, firstName, lastName, phone, role } = req.body;
    if (role === "superadmin") {
        return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Cannot create Superadmin." });
    }
    const existing = yield user_1.default.findOne({ email });
    if (existing)
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Email already exists." });
    const user = yield user_1.default.create({ email, password, firstName, lastName, phone, role });
    res.status(http_codes_1.default.CREATED).json({ message: "User created", user });
}));
router.put("/update-user/:UserId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin", "superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { UserId } = req.params;
    const update = req.body;
    if (update.role === "superadmin") {
        return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Cannot assign Superadmin role." });
    }
    const updatedUser = yield user_1.default.findByIdAndUpdate(UserId, update, { new: true });
    res.json(updatedUser);
}));
router.delete("/delete-user/:UserId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin", "superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { UserId } = req.params;
    yield user_1.default.findByIdAndDelete(UserId);
    res.json({ message: "User deleted successfully" });
}));
router.put("/change-role/:UserId", authMiddleware_1.default, (0, roleMiddleware_1.default)(["admin", "superadmin"]), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { UserId } = req.params;
    const { role } = req.body;
    try {
        if (role === "superadmin") {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Cannot assign Superadmin role." });
        }
        const updatedUser = yield user_1.default.findByIdAndUpdate(UserId, { role }, { new: true });
        res.json(updatedUser);
    }
    catch (error) {
        console.error("Error changing user role:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to change user role", error });
    }
}));
exports.default = router;
//# sourceMappingURL=admin&superadmin.js.map