import type { Request, Response } from "express";
import {
    SerializedWorkflowSchema,
} from "@repo/schema";
import {
    saveWorkflow,
    getWorkflowById,
    getWorkflows,
} from "../services/workflow.service";
import { executeWorkflow } from "../services/executor.service";

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

export async function executeWorkflowController(
    req: Request,
    res: Response
) {
    try {
        console.log("Executing workflow with in controller", req.body);
        const workflowDefinition = req.body;
        console.log("Executing workflow with in controller", workflowDefinition);
        const nodes = workflowDefinition.nodes || workflowDefinition.canvas?.nodes;
        const edges = workflowDefinition.edges || workflowDefinition.canvas?.edges;
        console.log("Executing workflow with", nodes, edges);
        if (!nodes || !Array.isArray(nodes)) {
            return res.status(400).json({
                error: "Invalid workflow definition - missing nodes array",
            });
        }

        console.log("Executing workflow with", nodes.length, "nodes");

        // Pass the workflow in the format the executor expects
        const result = await executeWorkflow({
            nodes,
            edges: edges || [],
            targetNodeId: workflowDefinition.targetNodeId,
            executionResults: workflowDefinition.executionResults,
        });


        res.json({
            success: true,
            result,
        });
    } catch (error: any) {
        console.error("Workflow execution error:", error);
        res.status(500).json({
            error: error.message || "Workflow execution failed",
        });
    }
}
