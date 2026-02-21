import { prisma } from "../db/prisma";
import { SerializedWorkflowSchema, type SerializedWorkflow } from "@repo/schema";

export async function saveWorkflow(
    input: SerializedWorkflow,
    userId: string
) {
    return prisma.workflow.create({
        data: {
            name: input.metadata.name,
            description: input.metadata.description,
            version: input.version,
            userId,
            viewport: {
                x: 0,
                y: 0,
                zoom: 1
            },
            definition: {
                ...input.canvas,
                executionResults: input.executionResults,
            } as any,
        },
    });
}

export async function updateWorkflow(
    id: string,
    input: SerializedWorkflow,
    userId: string
) {
    return prisma.workflow.update({
        where: { id, userId },
        data: {
            name: input.metadata.name,
            description: input.metadata.description,
            version: input.version,
            definition: {
                ...input.canvas,
                executionResults: input.executionResults,
            } as any,
        },
    });
}

export async function getWorkflowById(id: string, userId: string) {
    return prisma.workflow.findUnique({
        where: { id, userId },
        include: {
            executions: true,
        },
    });
}

export async function getWorkflows(userId: string) {
    return prisma.workflow.findMany({
        where: { userId }
    });
}