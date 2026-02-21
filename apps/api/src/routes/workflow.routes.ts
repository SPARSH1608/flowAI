import { Router } from "express";
import {
    createWorkflow,
    fetchWorkflow,
    fetchWorkflows,
    executeWorkflowController,
    updateWorkflowController,
} from "../controllers/workflow.controller";

const router = Router();

router.post("/", createWorkflow);
router.get("/:id", fetchWorkflow);
router.put("/:id", updateWorkflowController);
router.get("/", fetchWorkflows);
router.post("/execute", executeWorkflowController);

export default router;
