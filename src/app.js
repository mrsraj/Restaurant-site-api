import "dotenv/config";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import validate from "./middlewares/validate.middleware.js";
import routes from "./routes/index.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// __dirname is not directly available in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);

// Parse JSON request bodies
app.use(express.json());

// Request body validation
app.use(validate.body);

// Static files
app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

// API routes
app.use("/api/v1", validate.resourceId, routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "Path does not exist",
    });
});

// Global error handler
app.use(errorMiddleware);

export default app;