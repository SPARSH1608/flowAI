"use client";

import { useState } from "react";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { exportSnapshot } from "@/utils/exportSnapshot";
import { executeWorkflow } from "@/utils/workflow";
import { podcastTemplate } from "@/templates/podcastTemplate";
import { useWorkflowStore } from "@/store/workflowStore";
import { Play, Loader2 } from "lucide-react";

export default function TopBar() {
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

    return (
        <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 space-x-2">
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
