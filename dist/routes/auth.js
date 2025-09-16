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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const user_1 = __importDefault(require("../models/user"));
const ActiveTokens_1 = __importDefault(require("../models/ActiveTokens"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const http_codes_1 = __importDefault(require("../utils/http_codes"));
const user_2 = __importDefault(require("../models/user"));
const crypto_1 = __importDefault(require("crypto"));
const validate_1 = __importDefault(require("../middleware/validate"));
const authValidators_1 = require("../validators/authValidators");
dotenv_1.default.config();
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET;
router.post("/signup", (0, validate_1.default)(authValidators_1.signupSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password, phone, role } = req.body;
    if (!email || !password) {
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Email and password are required" });
    }
    try {
        const userExists = yield user_1.default.findOne({ email });
        if (userExists) {
            return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "User already exists" });
        }
        if (role) {
            const validRoles = ["superadmin", "admin", "employee", "user"];
            if (!validRoles.includes(role.toLowerCase())) {
                return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Invalid role specified" });
            }
        }
        else {
            return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Role is required" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 13);
        const newUser = new user_1.default({ firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            role: role ? role.toLowerCase() : "user",
        });
        yield newUser.save();
        const msg = "Login to get the token...!!";
        return res.status(http_codes_1.default.CREATED).json({ message: "User registered successfully", userId: newUser._id, msg });
    }
    catch (err) {
        console.error("Error during signup:", err);
        return res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Server error", error: err });
    }
}));
router.post("/login", (0, validate_1.default)(authValidators_1.loginSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield user_2.default.findOne({ email });
        if (!user) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "User not found" });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(http_codes_1.default.UNAUTHORIZED).json({ message: "Invalid credentials" });
        }
        const now = new Date();
        const existingToken = yield ActiveTokens_1.default.findOne({
            email,
            expiresAt: { $gt: now },
        });
        if (existingToken) {
            return res.status(http_codes_1.default.OK).json({
                message: "User already logged in",
                token: existingToken.token,
            });
        }
        const payload = { email: user.email, id: user._id, role: user.role };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "1h" });
        const issuedAt = now;
        const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
        const newToken = new ActiveTokens_1.default({
            email,
            token,
            issuedAt,
            expiresAt,
        });
        yield newToken.save();
        res.status(http_codes_1.default.OK).json({
            message: "Login successful",
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Login failed" });
    }
}));
router.post("/forgot-password", (0, validate_1.default)(authValidators_1.forgotPasswordSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    if (!token) {
        return res.status(http_codes_1.default.UNAUTHORIZED).json({ message: "Authorization token is required" });
    }
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (err) {
        return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Invalid or expired JWT token" });
    }
    const { email } = req.body;
    if (decoded.email !== email) {
        return res.status(http_codes_1.default.FORBIDDEN).json({ message: "Email does not match JWT token" });
    }
    const user = yield user_2.default.findOne({ email });
    if (!user) {
        return res.status(http_codes_1.default.NOT_FOUND).json({ message: "User not found" });
    }
    const resetToken = crypto_1.default.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
    user.resetToken = resetToken;
    user.resetTokenExpiry = tokenExpiry;
    yield user.save();
    return res.status(http_codes_1.default.OK).json({
        message: "Reset token generated",
        resetToken,
        tokenExpiry,
    });
}));
router.post("/reset-password/:token", (0, validate_1.default)(authValidators_1.resetPasswordSchema), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!token) {
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Reset token is required" });
    }
    if (!newPassword) {
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "New password is required" });
    }
    const user = yield user_2.default.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() },
    });
    if (!user) {
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 13);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    yield user.save();
    res.status(http_codes_1.default.OK).json({ message: "Password reset successful" });
}));
router.get("/profile", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const user = yield user_2.default.findOne({ email }).select("-password -resetToken -resetTokenExpiry");
        if (!user) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "User not found" });
        }
        res.status(http_codes_1.default.OK).json({
            message: "Profile fetched successfully",
            user,
        });
    }
    catch (error) {
        console.error("Error fetching profile:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to fetch profile", error });
    }
}));
router.post("/logout", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    const decoded = jsonwebtoken_1.default.decode(token);
    if (!decoded || !decoded.exp) {
        return res.status(http_codes_1.default.BAD_REQUEST).json({ message: "Invalid token" });
    }
    const expirytoken = yield ActiveTokens_1.default.findOne({ token: req.token });
    const expiry = expirytoken === null || expirytoken === void 0 ? void 0 : expirytoken.expiresAt.toISOString();
    return res.status(http_codes_1.default.OK).json({
        message: "Logged out successfully",
        note: `Token remains active until "${expiry}" and will be auto-removed when expired.`
    });
}));
router.put("/profile", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, phone } = req.body;
    const email = req.user.email;
    try {
        const user = yield user_2.default.findOne({ email });
        if (!user) {
            return res.status(http_codes_1.default.NOT_FOUND).json({ message: "User not found" });
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        yield user.save();
        res.status(http_codes_1.default.OK).json({ message: "Profile updated successfully", user });
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(http_codes_1.default.SERVER_ERROR).json({ message: "Failed to update profile", error });
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map