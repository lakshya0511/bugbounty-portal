import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import issuesRouter from "./routes/issues.js";
import authRouter from "./routes/auth.js";
import leaderboardRouter from "./routes/leaderboard.js";
import { fetchAllIssues } from "./fetchIssues.js";

const app = express();
const PORT = process.env.PORT || 4000; // ⚙️ default to 4000 for backend

// ----------------- REQUIRED ENVS -----------------
const requiredEnvs = [
  "MONGO_URI",
  "GITHUB_TOKEN",
  "GITHUB_ORG",
  "JWT_SECRET",
  "GITHUB_OAUTH_CLIENT_ID",
  "GITHUB_OAUTH_CLIENT_SECRET",
  "FRONTEND_URL",
];

const missing = requiredEnvs.filter((env) => !process.env[env]);
if (missing.length > 0) {
  console.error(`❌ Missing required .env variables: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("✅ Environment loaded:");
console.log("  GITHUB_ORG:", process.env.GITHUB_ORG);
console.log("  FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("  PORT:", PORT);

// ----------------- MIDDLEWARE -----------------
app.use(express.json());

// ✅ Fix CORS: allow both localhost:3000 and .env FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 Blocked CORS request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ----------------- MONGODB CONNECTION -----------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ----------------- INITIAL FETCH -----------------
(async () => {
  try {
    console.log("⏳ Running initial fetchAllIssues on startup...");
    await fetchAllIssues();
    console.log("✅ Initial fetch complete");
  } catch (err) {
    console.error("❌ Initial fetch error:", err?.message || err);
  }
})();

// ----------------- AUTO-FETCH EVERY 1 MIN -----------------
const FETCH_INTERVAL = 60 * 1000;
setInterval(async () => {
  try {
    console.log("⏳ Auto-fetching GitHub issues...");
    await fetchAllIssues();
    console.log("✅ Auto-fetch complete");
  } catch (err) {
    console.error("❌ Auto-fetch error:", err?.message || err);
  }
}, FETCH_INTERVAL);

// ----------------- ROUTES -----------------
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.use("/api/leaderboard", leaderboardRouter);

// Healthcheck
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ----------------- START SERVER -----------------
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`🛑 ${signal} received — closing server`);
  server.close(() => {
    mongoose.disconnect().then(() => {
      console.log("🧵 MongoDB disconnected, exiting");
      process.exit(0);
    });
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
