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

    const workflow = await saveWorkflow(parsed.data);

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

    try {
        const workflow = await updateWorkflow(id as string, parsed.data);
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

        // Pass the workflow in the format the executor expects
        const result = await executeWorkflow({
            nodes,
            edges: edges || [],
            targetNodeId: workflowDefinition.targetNodeId,
            executionResults: workflowDefinition.executionResults,
        }, (nodeId, output) => {
            console.log(`[executeWorkflowController] Node ${nodeId} complete, streaming...`);
            // Stream the individual node result
            res.write(JSON.stringify({ type: 'node_complete', nodeId, output }) + '\n');
            // If response has a flush method (common in compression middleware), use it
            if ((res as any).flush) (res as any).flush();
        }, (nodeId) => {
            console.log(`[executeWorkflowController] Node ${nodeId} started, streaming...`);
            res.write(JSON.stringify({ type: 'node_start', nodeId }) + '\n');
            if ((res as any).flush) (res as any).flush();
        });

        console.log("[executeWorkflowController] Workflow complete, sending final result");

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
