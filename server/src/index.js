import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { initRedis } from "./redisClient.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

// SC-14: Security headers via helmet (CSP, HSTS, X-Frame-Options, etc.)
app.use(helmet());

// SC-03: Strict CORS — explicit origin from config, not wildcard
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true
  })
);

// SC-13: Explicit 50 kb body size limit to prevent DoS via large payloads
app.use(express.json({ limit: "50kb" }));

// SC-24: Cookie parser for httpOnly cookie support
app.use(cookieParser());

// SC-15: Use 'combined' format in production to avoid verbose dev output in logs
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// SC-21: Health endpoint returns 204 (no content) instead of leaking server info
app.get("/api/health", (_req, res) => {
  res.status(204).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

initRedis();
connectDb()
  .then(async (connected) => {
    if (!connected) {
      console.error("\n====================================================================");
      console.error("CRITICAL ERROR: Could not connect to the MongoDB Atlas database!");
      console.error("Please ensure your current IP address is whitelisted in MongoDB Atlas.");
      // SC-23: Removed insecure tip to open Atlas to 0.0.0.0/0.
      // Correct fix: whitelist only your server's static IP in Atlas Network Access.
      console.error("====================================================================\n");
      process.exit(1);
    }
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });
