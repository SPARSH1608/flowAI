import { SerializedWorkflow } from "@/types/serializedWorkflow";
import { useWorkflowStore } from "@/store/workflowStore";

export function serializeWorkflow(
    name = "Untitled Workflow"
): SerializedWorkflow {
    const { nodes, edges } = useWorkflowStore.getState();

    return {
        version: "v1",
        metadata: {
            name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        canvas: {
            nodes,
            edges,
        },
    };
}
