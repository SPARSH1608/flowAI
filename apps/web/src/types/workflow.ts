export type NodeType =
    | "TEXT_NODE"
    | "IMAGE_NODE"
    | "IMAGE_GENERATION_NODE"
    | "ASSISTANT_NODE"
    | "BATCH_VARIATION_NODE"
    | "IMAGE_PROCESSING_NODE"
    | "EXPORT_NODE"
    | "VIDEO_GENERATION_NODE";

export type PortType =
    | "text"
    | "image"
    | "image[]"
    | "prompt"
    | "video";

import { NodeStatus } from "./nodeStatus";

export interface WorkflowNode {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: {
        label: string;
        status?: NodeStatus;
        config: any;
    };
}

export interface WorkflowEdge {
    id: string;
    source: string;
    sourceHandle: string;
    target: string;
    targetHandle: string;
}
