const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.set("trust proxy", 1);

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(express.json({ limit: "10kb" }));
app.use(express.text({ limit: "10kb", type: ["text/plain"] }));
app.use(cookieParser());

const configuredClientUrl = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.trim().replace(/\/+$/, "")
    : null;

const allowedOrigins = [
    configuredClientUrl,
    "https://mood-melodies-pi.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        const normalized = origin.trim().replace(/\/+$/, "");
        const isAllowed =
            allowedOrigins.includes(normalized) ||
            /^https:\/\/([a-z0-9-]+)\.vercel\.app$/.test(normalized);
        if (isAllowed) return callback(null, true);
        return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Rate Limiters
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});

const restLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});

// Routes
const authRoutes = require("./routes/auth.routes");
const songRoutes = require("./routes/song.routes");
const eventRoutes = require("./routes/event.routes");
const analyticsRoutes = require("./routes/analytics.routes");

app.use("/api/auth", authLimiter, authRoutes);
app.use(restLimiter);
app.use("/api/songs", songRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;
