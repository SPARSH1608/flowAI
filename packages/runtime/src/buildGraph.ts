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
    }
) {
    let executionOrder = compiled.executionOrder;

    // If targetNodeId is provided, prune the graph to only include ancestors
    if (compiled.targetNodeId) {
        console.log(`Pruning graph for target node: ${compiled.targetNodeId}`);
        const ancestors = new Set<string>();
        const queue = [compiled.targetNodeId];

        // Build reverse adjacency list/map for efficient traversal
        // The compiled.adjacency is from -> [to], we need to -> [from]
        const reverseAdjacency = new Map<string, string[]>();
        for (const [from, tos] of compiled.adjacency.entries()) {
            for (const to of tos) {
                if (!reverseAdjacency.has(to)) {
                    reverseAdjacency.set(to, []);
                }
                reverseAdjacency.get(to)!.push(from);
            }
        }

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (ancestors.has(current)) continue;

            ancestors.add(current);

            const parents = reverseAdjacency.get(current) || [];
            for (const parent of parents) {
                if (!ancestors.has(parent)) {
                    queue.push(parent);
                }
            }
        }

        // Filter execution order to only include ancestors
        executionOrder = compiled.executionOrder.filter(id => ancestors.has(id));
        console.log(`Pruned execution order:`, executionOrder);
    }

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

        // Check if we have a cached result for this node (and it's not the target node we want to regenerate)
        const cachedResult = compiled.executionResults?.[nodeId];
        const shouldUseCache = cachedResult && nodeId !== compiled.targetNodeId;

        let executor;

        if (shouldUseCache) {
            console.log(`Using cached result for node ${nodeId}`);
            executor = {
                execute: async (_id: string, _config: any, _inputs: any, _state: any) => {
                    return {
                        nodeOutputs: {
                            [nodeId]: cachedResult
                        },
                        errors: []
                    };
                }
            };
        } else {
            executor = EXECUTOR_REGISTRY[node.type as keyof typeof EXECUTOR_REGISTRY];

            if (!executor) {
                throw new Error(`No executor for ${node.type}`);
            }
        }

        graph.addNode(nodeId, async (state) => {
            try {
                const inputs = resolveInputs(
                    nodeId,
                    compiled.edges,
                    state
                );

                return await executor.execute(
                    nodeId,
                    node.config,
                    inputs,
                    state
                );
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

    const validNodes = new Set(executionOrder);

    for (const [from, tos] of compiled.adjacency.entries()) {
        if (!validNodes.has(from)) continue;

        for (const to of tos) {
            if (validNodes.has(to)) {
                //@ts-ignore
                graph.addEdge(from, to);
            }
        }
    }

    // Find all nodes that are not targets of any filtered edge
    const activeTargets = new Set<string>();
    for (const [from, tos] of compiled.adjacency.entries()) {
        if (!validNodes.has(from)) continue;

        for (const to of tos) {
            if (validNodes.has(to)) {
                activeTargets.add(to);
            }
        }
    }

    const startNodes = executionOrder.filter(
        (nodeId) => !activeTargets.has(nodeId)
    );

    for (const startNode of startNodes) {
        //@ts-ignore
        graph.addEdge(START, startNode);
    }

    return graph.compile();
}
