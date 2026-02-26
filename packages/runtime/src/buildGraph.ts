import { StateGraph, START } from "@langchain/langgraph";
import { initialState } from "./state.js";
import { resolveInputs } from "./inputResolver.js";
import { EXECUTOR_REGISTRY } from "@repo/executor";

export function buildLangGraph(
    compiled: {
        nodes: Map<string, any>;
        adjacency: Map<string, string[]>;
        executionOrder: string[];
        edges: any[];
        targetNodeId?: string;
        executionResults?: Record<string, any>;
    },
    callbacks?: {
        onNodeStart?: (nodeId: string) => void;
        wrapNodeExecution?: (nodeId: string, executeFn: () => Promise<any>) => Promise<any>;
    }
) {
    let executionOrder = compiled.executionOrder;

    // If targetNodeId is provided, prune the graph to only include nodes that MUST run
    if (compiled.targetNodeId) {
        console.log(`Pruning graph for target node: ${compiled.targetNodeId}`);
        const toExecute = new Set<string>();
        const queue = [compiled.targetNodeId];

        // Target node must always execute if triggered
        toExecute.add(compiled.targetNodeId);

        // Build reverse adjacency
        const reverseAdjacency = new Map<string, string[]>();
        for (const [from, tos] of compiled.adjacency.entries()) {
            for (const to of tos) {
                if (!reverseAdjacency.has(to)) reverseAdjacency.set(to, []);
                reverseAdjacency.get(to)!.push(from);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift()!;
            const parents = reverseAdjacency.get(current) || [];

            for (const parent of parents) {
                // We need to execute a parent if it DOESN'T have a cached result
                // because its descendant (current) needs it.
                // If the parent HAS a result, we stop there (seed will provide it).
                if (!compiled.executionResults?.[parent]) {
                    if (!toExecute.has(parent)) {
                        toExecute.add(parent);
                        queue.push(parent);
                    }
                }
            }
        }

        executionOrder = compiled.executionOrder.filter(id => toExecute.has(id));
        console.log(`Pruned execution order:`, executionOrder);
    }

    // @ts-ignore
    const graph = new StateGraph({
        channels: {
            nodeOutputs: {
                reducer: (x: any, y: any) => ({ ...x, ...y }),
                default: () => ({}),
            },
            errors: {
                reducer: (x: any, y: any) => (x || []).concat(y),
                default: () => [],
            },
        },
    });

    for (const nodeId of executionOrder) {
        const node = compiled.nodes.get(nodeId);
        console.log('executing node', node);

        const executor = EXECUTOR_REGISTRY[node.type as keyof typeof EXECUTOR_REGISTRY];

        if (!executor) {
            throw new Error(`No executor for ${node.type}`);
        }

        graph.addNode(nodeId, async (state) => {
            if (callbacks?.onNodeStart) {
                callbacks.onNodeStart(nodeId);
            }
            try {
                const inputs = resolveInputs(
                    nodeId,
                    compiled.edges,
                    state
                );

                const executionFn = () => executor.execute(
                    nodeId,
                    node.config,
                    inputs,
                    state
                );

                return callbacks?.wrapNodeExecution
                    ? await callbacks.wrapNodeExecution(nodeId, executionFn)
                    : await executionFn();
            } catch (err: any) {
                return {
                    ...state,
                    errors: [
                        //@ts-ignore
                        ...state.errors,
                        { nodeId, error: err.message },
                    ],
                };
            }
        });
    }

    // Only add edges based on strict execution order to force sequential execution
    for (let i = 0; i < executionOrder.length - 1; i++) {
        const from = executionOrder[i];
        const to = executionOrder[i + 1];
        // @ts-ignore
        graph.addEdge(from, to);
    }

    if (executionOrder.length > 0) {
        // @ts-ignore
        graph.addEdge(START, executionOrder[0]);
    }

    return graph.compile();
}
