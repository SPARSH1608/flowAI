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
