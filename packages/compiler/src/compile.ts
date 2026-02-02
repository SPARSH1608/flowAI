import { normalizeDefinition } from "./normalize.js";
import { topologicalSort } from "./toposort.js";

export function compileWorkflow(definition: {
    nodes: any[];
    edges: any[];
}) {
    const { nodes, adjacency, incomingCount } =
        normalizeDefinition(definition);

    const executionOrder = topologicalSort(
        adjacency,
        incomingCount
    );

    return {
        nodes,
        adjacency,
        executionOrder,
    };
}
