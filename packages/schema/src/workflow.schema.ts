import { z } from "zod";


export const WorkflowNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
    data: z.object({
        label: z.string(),
        config: z.any(),
    }),
});


export const WorkflowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    sourceHandle: z.string(),
    target: z.string(),
    targetHandle: z.string(),
});


export const SerializedWorkflowSchema = z.object({
    version: z.literal("v1"),
    metadata: z.object({
        name: z.string(),
        description: z.string().optional(),
        createdAt: z.number(),
        updatedAt: z.number(),
    }),
    canvas: z.object({
        nodes: z.array(WorkflowNodeSchema),
        edges: z.array(WorkflowEdgeSchema),
    }),
    executionResults: z.any().optional(),
});

export type SerializedWorkflow = z.infer<
    typeof SerializedWorkflowSchema
>;
