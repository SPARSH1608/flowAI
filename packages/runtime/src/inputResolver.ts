export function resolveInputs(
    nodeId: string,
    edges: any[],
    state: any
): Record<string, any> {
    const inputs: Record<string, any> = {};

    for (const edge of edges) {
        if (edge.target !== nodeId) continue;

        const sourcePort = edge.sourceHandle.split(":")[1];
        const targetPort = edge.targetHandle.split(":")[1];

        const sourceValue =
            state.nodeOutputs?.[edge.source]?.[sourcePort];

        if (sourceValue !== undefined) {
            inputs[targetPort] = sourceValue;
        }
    }

    return inputs;
}
