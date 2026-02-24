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
    input: Partial<SerializedWorkflow>,
    userId: string
) {
    const updateData: any = {};

    if (input.metadata?.name) updateData.name = input.metadata.name;
    if (input.metadata?.description !== undefined) updateData.description = input.metadata.description;
    if (input.version) updateData.version = input.version;

    if (input.canvas) {
        updateData.definition = {
            ...input.canvas,
            executionResults: input.executionResults,
        };
    } else if (input.executionResults) {
        // If only execution results were updated
        updateData.definition = {
            executionResults: input.executionResults
        };
    }

    return prisma.workflow.update({
        where: { id, userId },
        data: updateData,
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