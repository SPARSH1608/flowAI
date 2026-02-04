import { WorkflowNode, WorkflowEdge } from "./workflow";

export interface SerializedWorkflow {
    version: "v1";
    metadata: {
        name: string;
        description?: string;
        createdAt: number;
        updatedAt: number;
    };
    canvas: {
        nodes: WorkflowNode[];
        edges: WorkflowEdge[];
    };
    executionResults?: Record<string, any>;
}
