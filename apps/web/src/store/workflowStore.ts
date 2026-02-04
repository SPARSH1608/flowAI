import { create } from "zustand";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const STORAGE_KEY = "ai-workflow";

interface WorkflowState {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];

    addNode: (node: WorkflowNode) => void;
    setNodes: (nodes: WorkflowNode[] | ((prev: WorkflowNode[]) => WorkflowNode[])) => void;
    setEdges: (edges: WorkflowEdge[]) => void;
    deleteNode: (id: string) => void;
    deleteEdge: (id: string) => void;
    deleteMode: boolean;
    toggleDeleteMode: () => void;
    hydrate: () => void;
    executionResults: Record<string, any>;
    setExecutionResults: (results: Record<string, any>) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
    nodes: [],
    edges: [],
    deleteMode: false,
    executionResults: {},

    setExecutionResults: (results) => set({ executionResults: results }),

    addNode: (node) =>
        set((state) => {
            const next = { nodes: [...state.nodes, node], edges: state.edges };
            // Check if window is defined (browser environment)
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        }),

    setNodes: (nodes) =>
        set((state) => {
            const nextNodes = typeof nodes === 'function' ? nodes(state.nodes) : nodes;
            const next = { nodes: nextNodes, edges: state.edges };
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        }),

    setEdges: (edges) =>
        set((state) => {
            const next = { nodes: state.nodes, edges };
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        }),

    deleteNode: (id: string) =>
        set((state) => {
            const next = {
                nodes: state.nodes.filter((n) => n.id !== id),
                edges: state.edges.filter(
                    (e) => e.source !== id && e.target !== id
                ),
            };
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        }),

    deleteEdge: (id: string) =>
        set((state) => {
            const next = {
                nodes: state.nodes,
                edges: state.edges.filter((e) => e.id !== id),
            };
            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            }
            return next;
        }),

    toggleDeleteMode: () => set((state) => ({ deleteMode: !state.deleteMode })),

    hydrate: () => {
        if (typeof window === "undefined") return;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            set(parsed);
        } catch (e) {
            console.error("Failed to hydrate workflow", e);
        }
    },
}));
