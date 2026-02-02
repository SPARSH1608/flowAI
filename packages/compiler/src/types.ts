export interface GraphNode {
    id: string;
    type: string;
    config: any;
}

export interface GraphEdge {
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
}

export interface CompiledGraph {
    nodes: Map<string, GraphNode>;
    adjacency: Map<string, string[]>;
    incomingCount: Map<string, number>;
    executionOrder: string[];
}
