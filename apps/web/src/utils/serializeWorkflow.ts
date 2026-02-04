import { SerializedWorkflow } from "@/types/serializedWorkflow";
import { useWorkflowStore } from "@/store/workflowStore";

export function serializeWorkflow(): SerializedWorkflow {
    const { nodes, edges, metadata, executionResults } = useWorkflowStore.getState();

    return {
        version: "v1",
        metadata: {
            name: metadata.name,
            description: metadata.description,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        canvas: {
            nodes,
            edges,
        },
        executionResults,
    };
}
