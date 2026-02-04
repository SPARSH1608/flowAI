import express from "express";
import cors from "cors";
import workflowRoutes from "./routes/workflow.routes";
import imageRoutes from "./routes/image.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});


app.use("/workflows", workflowRoutes);
app.use("/images", imageRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(3002, () => {
    console.log("Server running on port 3002");
});