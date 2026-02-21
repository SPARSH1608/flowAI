export async function updateWorkflow(id: string, definition: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow update failed");
    }

    return response.json();
}

export async function fetchWorkflow(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`, { headers });
    if (!response.ok) {
        throw new Error("Failed to fetch workflow");
    }
    return response.json();
}

export async function deleteWorkflow(id: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`, {
        method: "DELETE",
        headers
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow deletion failed");
    }

    return response.json();
}

export async function createWorkflow(definition: any, token?: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows`, {
        method: "POST",
        headers,
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow creation failed");
    }

    return response.json();
}

export async function executeWorkflow(
    definition: any,
    onPartialUpdate?: (results: Record<string, any>) => void,
    onNodeStart?: (nodeId: string) => void,
    token?: string
) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows/execute`, {
        method: "POST",
        headers,
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow execution failed");
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader found on response body");

    const decoder = new TextDecoder();
    let partialResults: Record<string, any> = { ...definition.executionResults };
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
            if (!line.trim()) continue;
            console.log("[executeWorkflow] Stream chunk received:", line);
            try {
                const data = JSON.parse(line);
                if (data.type === 'node_start') {
                    if (onNodeStart) {
                        onNodeStart(data.nodeId);
                    }
                } else if (data.type === 'node_complete') {
                    partialResults = {
                        ...partialResults,
                        [data.nodeId]: data.output
                    };
                    if (onPartialUpdate) {
                        onPartialUpdate(partialResults);
                    }
                } else if (data.type === 'final_result') {
                    // Extract errors if present in the raw result
                    let errors: any[] = [];
                    if (data.result) {
                        // Data.result contains LangGraph multi-node output
                        for (const nodeKey in data.result) {
                            if (data.result[nodeKey]?.errors) {
                                errors = errors.concat(data.result[nodeKey].errors);
                            }
                        }
                    }
                    return { success: data.success, result: { nodeOutputs: partialResults, errors, raw: data.result }, execution: data.execution };
                }
            } catch (e) {
                console.error("Failed to parse stream line:", line, e);
            }
        }
    }

    return { success: true, result: { nodeOutputs: partialResults } };
}
