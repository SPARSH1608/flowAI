export function normalizeDefinition(definition: {
    nodes: any[];
    edges: any[];
}) {
    const nodes = new Map();
    const adjacency = new Map<string, string[]>();
    const incomingCount = new Map<string, number>();

    for (const node of definition.nodes) {
        nodes.set(node.id, {
            id: node.id,
            type: node.type,
            config: node.data.config,
        });
        adjacency.set(node.id, []);
        incomingCount.set(node.id, 0);
    }

    for (const edge of definition.edges) {
        adjacency.get(edge.source)?.push(edge.target);
        incomingCount.set(
            edge.target,
            (incomingCount.get(edge.target) || 0) + 1
        );
    }

    return { nodes, adjacency, incomingCount };
}
