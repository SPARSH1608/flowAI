export function topologicalSort(
    adjacency: Map<string, string[]>,
    incomingCount: Map<string, number>
): string[] {
    const queue: string[] = [];
    const order: string[] = [];

    for (const [node, count] of incomingCount.entries()) {
        if (count === 0) queue.push(node);
    }

    while (queue.length > 0) {
        const current = queue.shift()!;
        order.push(current);

        for (const neighbor of adjacency.get(current) || []) {
            incomingCount.set(
                neighbor,
                incomingCount.get(neighbor)! - 1
            );
            if (incomingCount.get(neighbor) === 0) {
                queue.push(neighbor);
            }
        }
    }

    if (order.length !== adjacency.size) {
        throw new Error("Cycle detected in workflow graph");
    }

    return order;
}
