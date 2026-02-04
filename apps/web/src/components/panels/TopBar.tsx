"use client";

import { useState } from "react";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { exportSnapshot } from "@/utils/exportSnapshot";
import { executeWorkflow, createWorkflow, updateWorkflow } from "@/utils/workflow";
import { podcastTemplate } from "@/templates/podcastTemplate";
import { useWorkflowStore } from "@/store/workflowStore";
import { Play, Loader2, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function TopBar() {
    const router = useRouter();
    const params = useParams();
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const setEdges = useWorkflowStore((s) => s.setEdges);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);
    const [isRunning, setIsRunning] = useState(false);

    function loadTemplate() {
        setNodes(podcastTemplate.canvas.nodes);
        setEdges(podcastTemplate.canvas.edges);
    }

    function exportJSON() {
        const workflow = serializeWorkflow();
        const blob = new Blob(
            [JSON.stringify(workflow, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workflow.json";
        a.click();
    }

    async function runWorkflow() {
        setIsRunning(true);
        try {
            const workflow = serializeWorkflow();
            console.log("Running workflow:", workflow);

            const result = await executeWorkflow(workflow);
            console.log("Workflow execution result:", result);

            if (result.success && result.result) {
                console.log("TopBar received outputs:", result.result.nodeOutputs);
                setExecutionResults(result.result.nodeOutputs);
            }

            alert("Workflow executed successfully! Check console for results.");
        } catch (error: any) {
            console.error("Workflow execution failed:", error);
            alert(`Workflow execution failed: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    }

    async function handleSave() {
        try {
            const workflow = serializeWorkflow();

            if (params?.id && typeof params.id === 'string') {
                await updateWorkflow(params.id, workflow);
                console.log("Workflow updated:", params.id);
                alert("Workflow updated!");
            } else {
                // Create new
                const result = await createWorkflow(workflow);
                console.log("Workflow saved:", result);

                if (result.id) {
                    router.push(`/workflows/${result.id}`);
                    alert("Workflow saved!");
                }
            }
        } catch (error: any) {
            console.error("Failed to save workflow:", error);
            alert(`Failed to save: ${error.message}`);
        }
    }

    return (
        <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 space-x-2">
            <button
                onClick={handleSave}
                className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded font-medium transition-colors"
            >
                <Save size={16} />
                Save Workflow
            </button>

            <button
                onClick={runWorkflow}
                disabled={isRunning}
                className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed px-4 py-1.5 rounded font-medium transition-colors"
            >
                {isRunning ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Running...
                    </>
                ) : (
                    <>
                        <Play size={16} fill="currentColor" />
                        Run Workflow
                    </>
                )}
            </button>

            <div className="h-6 w-px bg-neutral-700" />

            <button
                onClick={loadTemplate}
                className="text-sm bg-neutral-800 px-3 py-1 rounded hover:bg-neutral-700"
            >
                Load Template
            </button>
            <button
                onClick={exportJSON}
                className="text-sm bg-neutral-800 px-3 py-1 rounded hover:bg-neutral-700"
            >
                Export JSON
            </button>
            <button
                onClick={exportSnapshot}
                className="text-sm bg-neutral-800 px-3 py-1 rounded hover:bg-neutral-700"
            >
                Export PNG
            </button>
        </div>
    );
}
