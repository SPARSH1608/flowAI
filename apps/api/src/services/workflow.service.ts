import { prisma } from "../db/prisma";
import { SerializedWorkflowSchema, type SerializedWorkflow } from "@repo/schema";

export async function saveWorkflow(
    input: SerializedWorkflow
) {
    return prisma.workflow.create({
        data: {
            name: input.metadata.name,
            description: input.metadata.description,
            version: input.version,
            viewport: {
                x: 0,
                y: 0,
                zoom: 1
            },
            definition: input.canvas as any,
        },
    });
}

export async function updateWorkflow(
    id: string,
    input: SerializedWorkflow
) {
    return prisma.workflow.update({
        where: { id },
        data: {
            name: input.metadata.name,
            description: input.metadata.description,
            version: input.version,
            definition: input.canvas as any,
        },
    });
}

export async function getWorkflowById(id: string) {
    return prisma.workflow.findUnique({
        where: { id },
        include: {
            executions: true,
        },
    });
}

export async function getWorkflows() {
    return prisma.workflow.findMany();
}