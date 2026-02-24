import express from "express";
import { setupGlobalLogger } from "./utils/logger";

setupGlobalLogger();
import cors from "cors";
import workflowRoutes from "./routes/workflow.routes";
import imageRoutes from "./routes/image.routes";
import authRoutes from "./routes/auth.routes";
import { authenticate } from "./middlewares/auth.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsPath = path.resolve(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/auth", authRoutes);
app.use("/workflows", authenticate, workflowRoutes);
app.use("/images", imageRoutes);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Error Handler Catch-all:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

app.listen(3002, () => {
    console.log("Server running on port 3002");
    console.log("Serving static files from:", uploadsPath);
});