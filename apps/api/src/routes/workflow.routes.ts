import { Router } from "express";
import {
    createWorkflow,
    fetchWorkflow,
    fetchWorkflows,
} from "../controllers/workflow.controller";

const router = Router();

router.post("/", createWorkflow);
router.get("/:id", fetchWorkflow);
router.get("/", fetchWorkflows);
export default router;
