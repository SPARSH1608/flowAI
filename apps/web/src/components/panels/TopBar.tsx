"use client";

import { serializeWorkflow } from "@/utils/serializeWorkflow";

import { exportSnapshot } from "@/utils/exportSnapshot";

import { podcastTemplate } from "@/templates/podcastTemplate";
import { useWorkflowStore } from "@/store/workflowStore";

export default function TopBar() {
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const setEdges = useWorkflowStore((s) => s.setEdges);

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

    return (
        <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 space-x-2">
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
