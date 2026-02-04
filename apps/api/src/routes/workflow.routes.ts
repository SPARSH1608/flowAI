import { Router } from "express";
import {
    createWorkflow,
    fetchWorkflow,
    fetchWorkflows,
    executeWorkflowController,
} from "../controllers/workflow.controller";

const router = Router();

router.post("/", createWorkflow);
router.get("/:id", fetchWorkflow);
router.get("/", fetchWorkflows);
router.post("/execute", executeWorkflowController);

export default router;
