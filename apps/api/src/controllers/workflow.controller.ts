import type { Request, Response } from "express";
import {
    SerializedWorkflowSchema,
} from "@repo/schema";
import {
    saveWorkflow,
    updateWorkflow,
    getWorkflowById,
    getWorkflows,
} from "../services/workflow.service";
import { executeWorkflow } from "../services/executor.service";
import { prisma } from "../db/prisma";

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

    const userId = (req as any).userId;
    const workflow = await saveWorkflow(parsed.data, userId);

    res.json({
        id: workflow.id,
        message: "Workflow saved",
    });
}

export async function updateWorkflowController(
    req: Request,
    res: Response
) {
    const { id } = req.params;
    const parsed =
        SerializedWorkflowSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            error: parsed.error.format(),
        });
    }

    const userId = (req as any).userId;
    try {
        const workflow = await updateWorkflow(id as string, parsed.data, userId);
        res.json({
            id: workflow.id,
            message: "Workflow updated",
        });
    } catch (e) {
        res.status(500).json({ error: "Failed to update workflow" });
    }
}

export async function fetchWorkflow(
    req: Request,
    res: Response
) {
    const userId = (req as any).userId;
    const workflow = await getWorkflowById(
        req.params.id as string,
        userId
    );

    if (!workflow) {
        return res.status(404).json({
            error: "Workflow not found",
        });
    }

    res.json(workflow);
}

export async function fetchWorkflows(
    req: Request,
    res: Response
) {
    const userId = (req as any).userId;
    const workflows = await getWorkflows(userId);
    res.json(workflows);
}

export async function executeWorkflowController(
    req: Request,
    res: Response
) {
    try {
        const workflowDefinition = req.body;
        const nodes = workflowDefinition.nodes || workflowDefinition.canvas?.nodes;
        const edges = workflowDefinition.edges || workflowDefinition.canvas?.edges;

        if (!nodes || !Array.isArray(nodes)) {
            return res.status(400).json({
                error: "Invalid workflow definition - missing nodes array",
            });
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let executionId: string | undefined;
        if (workflowDefinition.workflowId) {
            const execution = await prisma.execution.create({
                data: {
                    workflowId: workflowDefinition.workflowId,
                    status: "RUNNING"
                }
            });
            executionId = execution.id;
        }

        const result = await executeWorkflow({
            nodes,
            edges: edges || [],
            targetNodeId: workflowDefinition.targetNodeId,
            executionResults: workflowDefinition.executionResults,
        }, (nodeId, output) => {
            res.write(JSON.stringify({ type: 'node_complete', nodeId, output }) + '\n');
            if ((res as any).flush) (res as any).flush();
        }, (nodeId) => {
            res.write(JSON.stringify({ type: 'node_start', nodeId }) + '\n');
            if ((res as any).flush) (res as any).flush();
        });

        let finalExecution: any;
        if (executionId) {
            finalExecution = await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: (result as any).errors?.length ? "FAILED" : "COMPLETED",
                    result: result as any,
                    completedAt: new Date()
                }
            });
        }
        res.write(JSON.stringify({ type: 'final_result', success: true, result, execution: finalExecution }) + '\n');
        res.end();
    } catch (error: any) {
        console.error("Workflow execution error:", error);
        res.status(500).json({
            error: error.message || "Workflow execution failed",
        });
    }
}
