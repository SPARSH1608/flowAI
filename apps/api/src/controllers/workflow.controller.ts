import type { Request, Response } from "express";
import {
    SerializedWorkflowSchema,
} from "@repo/schema";
import {
    saveWorkflow,
    updateWorkflow,
    getWorkflowById,
    getWorkflows,
} from "../services/workflowService";
import { executeWorkflow } from "../services/executorService";
import { prisma } from "../db/prisma";
import { loggerContext } from "../utils/logger";

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
    const userId = (req as any).userId;

    
    const fullParsed = SerializedWorkflowSchema.safeParse(req.body);

    if (fullParsed.success) {
        try {
            const workflow = await updateWorkflow(id as string, fullParsed.data, userId);
            return res.json({
                id: workflow.id,
                message: "Workflow updated",
            });
        } catch (e) {
            return res.status(500).json({ error: "Failed to update workflow" });
        }
    }

    
    const body = req.body;
    console.log("Update fallback check. Body keys:", Object.keys(body));

    if (body.metadata && (body.metadata.name || body.metadata.description !== undefined)) {
        console.log("Processing partial metadata update...");
        try {
            const workflow = await updateWorkflow(id as string, body, userId);
            return res.json({
                id: workflow.id,
                message: "Workflow updated (metadata)",
            });
        } catch (e) {
            console.error("Partial update error:", e);
            return res.status(500).json({ error: "Failed to update workflow metadata" });
        }
    }

    console.warn("Update data didn't match full schema or fallback logic.");
    return res.status(400).json({
        error: "Invalid update data. Expected full workflow or metadata.",
        details: fullParsed.error?.format()
    });
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

        
        res.setHeader('Content-Type', 'application/x-ndjson');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); 

        
        res.write(JSON.stringify({ type: 'processing_started', timestamp: new Date().toISOString() }) + '\n');

        let executionId: string | undefined;
        if (workflowDefinition.workflowId) {
            console.log(`Creating execution record for workflow: ${workflowDefinition.workflowId}`);
            try {
                const execution = await prisma.execution.create({
                    data: {
                        workflowId: workflowDefinition.workflowId,
                        status: "RUNNING"
                    }
                });
                executionId = execution.id;
                console.log(`Execution record created: ${executionId}`);
            } catch (dbError) {
                console.error("Failed to create execution record:", dbError);
                
            }
        }

        const nodeOutputs: Record<string, any> = {};
        const result = await executeWorkflow({
            nodes,
            edges: edges || [],
            targetNodeId: workflowDefinition.targetNodeId,
            executionResults: workflowDefinition.executionResults,
            wrapNodeExecution: (nodeId: string, executeFn: () => Promise<any>) => {
                return loggerContext.run({
                    onLog: (message: string) => {
                        res.write(JSON.stringify({ type: 'log', nodeId, message }) + '\n');
                    }
                }, executeFn);
            }
        }, (nodeId, output) => {
            console.log(`Node complete: ${nodeId}`);
            nodeOutputs[nodeId] = output;
            res.write(JSON.stringify({ type: 'node_complete', nodeId, output }) + '\n');
        }, (nodeId) => {
            console.log(`Node start: ${nodeId}`);
            res.write(JSON.stringify({ type: 'node_start', nodeId }) + '\n');
        });

        const finalResultStructure = {
            ...result,
            nodeOutputs,
        };

        console.log("Workflow execution logic complete. Finalizing...");
        let finalExecution: any;
        if (executionId) {
            finalExecution = await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: (result as any).errors?.length ? "FAILED" : "COMPLETED",
                    result: finalResultStructure as any,
                    completedAt: new Date()
                }
            });
        }
        res.write(JSON.stringify({ type: 'final_result', success: true, result: finalResultStructure, execution: finalExecution }) + '\n');
        res.end();
    } catch (error: any) {
        console.error("Workflow execution error:", error);
        res.status(500).json({
            error: error.message || "Workflow execution failed",
        });
    }
}
