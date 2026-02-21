import { create } from "zustand";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const STORAGE_KEY = null; // Unused

interface WorkflowState {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    metadata: {
        name: string;
        description?: string;
    };
    executions: any[];

    nodeExecutionStatus: Record<string, { status: "idle" | "running" | "completed" | "error" }>;
    setNodeExecutionStatus: (nodeId: string, status: "idle" | "running" | "completed" | "error") => void;
    clearNodeExecutionStatus: () => void;

    selectedNodeId: string | null;
    setSelectedNodeId: (id: string | null) => void;

    addNode: (node: WorkflowNode) => void;
    setNodes: (nodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => void;
    setEdges: (edges: WorkflowEdge[] | ((prev: WorkflowEdge[]) => WorkflowEdge[])) => void;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    deleteMode: boolean;
    toggleDeleteMode: () => void;
    hydrate: () => void;
    executionResults: Record<string, any>;
    setExecutionResults: (results: Record<string, any>) => void;
    addExecution: (execution: any) => void;
    setWorkflow: (workflow: { nodes: WorkflowNode[]; edges: WorkflowEdge[]; executionResults?: Record<string, any>; metadata?: { name: string; description?: string }; executions?: any[] }) => void;
    setMetadata: (metadata: { name: string; description?: string }) => void;
    updateNodeData: (id: string, dataParams: any) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],
    metadata: { name: "Untitled Workflow" },
    executions: [],
    deleteMode: false,
    executionResults: {},
    nodeExecutionStatus: {},
    selectedNodeId: null,

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    setNodeExecutionStatus: (nodeId, status) => set((state) => ({
        nodeExecutionStatus: { ...state.nodeExecutionStatus, [nodeId]: { status } }
    })),

    clearNodeExecutionStatus: () => set({ nodeExecutionStatus: {} }),

    setExecutionResults: (results) => set({ executionResults: results }),

    addExecution: (execution) => set((state) => ({ executions: [execution, ...state.executions] })),

    setWorkflow: (workflow) =>
        set({
            nodes: workflow.nodes || [],
            edges: workflow.edges || [],
            executionResults: workflow.executionResults || {},
            metadata: workflow.metadata || { name: "Untitled Workflow" },
            executions: workflow.executions || [],
        }),

    setMetadata: (metadata) => set({ metadata }),

    addNode: (node) =>
        set((state) => ({ nodes: [...state.nodes, node], edges: state.edges })),

    setNodes: (nodes) =>
        set((state) => {
            const nextNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
            return { nodes: nextNodes, edges: state.edges };
        }),

    setEdges: (edges) =>
        set((state) => {
            const nextEdges = typeof edges === 'function' ? edges(state.edges) : edges;
            return { nodes: state.nodes, edges: nextEdges };
        }),

    deleteNode: (id: string) =>
        set((state) => ({
            nodes: state.nodes.filter((n) => n.id !== id),
            edges: state.edges.filter(
                (e) => e.source !== id && e.target !== id
            ),
        })),

    deleteEdge: (id: string) =>
        set((state) => ({
            nodes: state.nodes,
            edges: state.edges.filter((e) => e.id !== id),
        })),

    toggleDeleteMode: () => set((state) => ({ deleteMode: !state.deleteMode })),

    hydrate: () => {
        // No-op or fetch logic can go here effectively
        // Since we are moving to DB-first loading, we can leave this empty or remove calls to it.
    },

    updateNodeData: (id: string, dataParams: any) =>
        set((state) => ({
            nodes: state.nodes.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, ...dataParams } } : n
            ),
        })),
}));
