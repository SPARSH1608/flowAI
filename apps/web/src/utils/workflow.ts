export async function updateWorkflow(id: string, definition: any) {
    const response = await fetch(`http://localhost:3002/workflows/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow update failed");
    }

    return response.json();
}

export async function fetchWorkflow(id: string) {
    const response = await fetch(`http://localhost:3002/workflows/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch workflow");
    }
    return response.json();
}

export async function deleteWorkflow(id: string) {
    const response = await fetch(`http://localhost:3002/workflows/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow deletion failed");
    }

    return response.json();
}

export async function createWorkflow(definition: any) {
    const response = await fetch("http://localhost:3002/workflows", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow creation failed");
    }

    return response.json();
}

export async function executeWorkflow(definition: any) {
    const response = await fetch("http://localhost:3002/workflows/execute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(definition),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Workflow execution failed");
    }

    return response.json();
}
