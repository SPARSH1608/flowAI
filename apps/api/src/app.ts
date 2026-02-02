import express from "express";
import cors from "cors";
import workflowRoutes from "./routes/workflow.routes";

export const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});


app.use("/workflows", workflowRoutes);
