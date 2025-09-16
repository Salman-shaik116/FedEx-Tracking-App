import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth";
import trackingRoute from "./routes/tracking";
import { connectToDb } from "./config/db";
import {
  cleanupExpiredTokensOnStartup,
  cleanupExpiredTokensOnRunning,
} from "./utils/token_cleanup";
import eventRoutes from "./routes/event";
import RegistrationRoute from "./routes/registration";
import analytics from "./routes/analytics";
import superadminRoutes from "./routes/admin&superadmin";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/track", trackingRoute);
app.use("/api/events", eventRoutes);
app.use("/api/registration", RegistrationRoute);
app.use("/api/analytics", analytics);
app.use("/api/superadmin", superadminRoutes);

app.get("/", (_req, res) => {
  res.send("Welcome to FedEx Tracking App");
});

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT;
// Connect to MongoDB and start server
connectToDb().then(async () => {
  await mongoose.connection.asPromise(); // full DB connection
  await cleanupExpiredTokensOnStartup();
  setInterval(cleanupExpiredTokensOnRunning, 5 * 60 * 1000);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
