import type { Request, Response } from "express";
import {
    SerializedWorkflowSchema,
} from "@repo/schema";
import {
    saveWorkflow,
    getWorkflowById,
    getWorkflows,
} from "../services/workflow.service";

export async function createWorkflow(
    req: Request,
    res: Response
) {
    const parsed =
        SerializedWorkflowSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: parsed.error.format(),
        });
    }

    const workflow = await saveWorkflow(parsed.data);

    res.json({
        id: workflow.id,
        message: "Workflow saved",
    });
}

export async function fetchWorkflow(
    req: Request,
    res: Response
) {
    const workflow = await getWorkflowById(
        req.params.id as string
    );

    if (!workflow) {
        return res.status(404).json({
            error: "Workflow not found",
        });
    }

    res.json(workflow);
}

export async function fetchWorkflows(
    _req: Request,
    res: Response
) {
    const workflows = await getWorkflows();
    res.json(workflows);
}
