import { compileWorkflow } from "@repo/compiler";
import { buildLangGraph } from "@repo/runtime";

export async function executeWorkflow(definition: any) {
    try {
        console.log("Compiling workflow with", definition.nodes?.length || 0, "nodes");

        const compiled = compileWorkflow(definition);
        console.log("Workflow compiled successfully");

        const graph = buildLangGraph({
            ...compiled,
            edges: definition.edges || [],
            targetNodeId: definition.targetNodeId,
            executionResults: definition.executionResults,
        });
        console.log("Graph built successfully");

        const result = await graph.invoke({});
        console.log("Workflow executed successfully");
        console.log("Final Workflow State:", JSON.stringify(result, null, 2));

        return result;
    } catch (error: any) {
        console.error("Error in executeWorkflow:", error);
        console.error("Error stack:", error.stack);
        throw new Error(`Workflow execution failed: ${error.message}`);
    }
}
