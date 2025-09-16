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
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const tracking_1 = __importDefault(require("./routes/tracking"));
const db_1 = require("./config/db");
const token_cleanup_1 = require("./utils/token_cleanup");
const event_1 = __importDefault(require("./routes/event"));
const registration_1 = __importDefault(require("./routes/registration"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const admin_superadmin_1 = __importDefault(require("./routes/admin&superadmin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/auth", auth_1.default);
app.use("/api/track", tracking_1.default);
app.use("/api/events", event_1.default);
app.use("/api/registration", registration_1.default);
app.use("/api/analytics", analytics_1.default);
app.use("/api/superadmin", admin_superadmin_1.default);
app.get("/", (_req, res) => {
    res.send("Welcome to FedEx Tracking App");
});
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
const PORT = process.env.PORT;
(0, db_1.connectToDb)().then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.asPromise();
    yield (0, token_cleanup_1.cleanupExpiredTokensOnStartup)();
    setInterval(token_cleanup_1.cleanupExpiredTokensOnRunning, 5 * 60 * 1000);
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}));
//# sourceMappingURL=index.js.map