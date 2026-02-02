import { StateGraph } from "@langchain/langgraph";
import { initialState } from "./state.js";
import { resolveInputs } from "./inputResolver.js";
import { EXECUTOR_REGISTRY } from "@repo/executor";

export function buildLangGraph(
    compiled: {
        nodes: Map<string, any>;
        adjacency: Map<string, string[]>;
        executionOrder: string[];
        edges: any[];
    }
) {
    const graph = new StateGraph({
        channels: {
            //@ts-ignore
            nodeOutputs: {},
            errors: {},
        },
    });

    for (const nodeId of compiled.executionOrder) {
        const node = compiled.nodes.get(nodeId);
        const executor = EXECUTOR_REGISTRY[node.type];

        if (!executor) {
            throw new Error(`No executor for ${node.type}`);
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

    for (const [from, tos] of compiled.adjacency.entries()) {
        for (const to of tos) {
            //@ts-ignore
            graph.addEdge(from, to);
        }
    }
    //@ts-ignore
    graph.setEntryPoint(compiled.executionOrder[0]);

    return graph.compile();
}
