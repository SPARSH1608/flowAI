import { compileWorkflow } from "@repo/compiler";
import { buildLangGraph } from "@repo/runtime";

export async function executeWorkflow(
    definition: any,
    onNodeComplete?: (nodeId: string, output: any) => void,
    onNodeStart?: (nodeId: string) => void
) {
    try {
        console.log("Compiling workflow with", definition.nodes?.length || 0, "nodes");

        const compiled = compileWorkflow(definition);
        console.log("Workflow compiled successfully");

        const graph = buildLangGraph({
            ...compiled,
            edges: definition.edges || [],
            targetNodeId: definition.targetNodeId,
            executionResults: definition.executionResults,
        }, {
            onNodeStart,
            wrapNodeExecution: definition.wrapNodeExecution
        });
        console.log("Graph built successfully");

        let finalResult = {};
        const initialState = {
            nodeOutputs: definition.executionResults || {},
            errors: []
        };
        const stream = await graph.stream(initialState, { streamMode: "updates" });

        for await (const update of stream) {
            console.log("Stream update:", JSON.stringify(update, null, 2));
            const updates = update as any;

            // LangGraph 'updates' mode returns { nodeName: { channelUpdate } }
            for (const nodeName in updates) {
                const nodeUpdate = updates[nodeName];
                if (nodeUpdate.nodeOutputs && onNodeComplete) {
                    for (const [nodeId, output] of Object.entries(nodeUpdate.nodeOutputs)) {
                        onNodeComplete(nodeId, output as any);
                    }
                }
            }

            finalResult = { ...finalResult, ...updates };
        }

        console.log("Workflow executed successfully");
        return finalResult;
    } catch (error: any) {
        console.error("Error in executeWorkflow:", error);
        console.error("Error stack:", error.stack);
        throw new Error(`Workflow execution failed: ${error.message}`);
    }
}
