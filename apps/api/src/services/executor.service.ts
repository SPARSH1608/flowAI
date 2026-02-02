import { compileWorkflow } from "@repo/compiler";
import { buildLangGraph } from "@repo/runtime";

export async function executeWorkflow(definition: any) {
    const compiled = compileWorkflow(definition);

    const graph = buildLangGraph({
        ...compiled,
        edges: definition.edges,
    });

    const result = await graph.invoke({});

    return result;
}
