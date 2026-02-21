"use client";

import { useState } from "react";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { exportSnapshot } from "@/utils/exportSnapshot";
import { executeWorkflow, createWorkflow, updateWorkflow } from "@/utils/workflow";
import { podcastTemplate } from "@/templates/podcastTemplate";
import { useWorkflowStore } from "@/store/workflowStore";
import { Play, Loader2, Save, Download, Image as ImageIcon, Sparkles, ChevronLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

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
            const workflow = serializeWorkflow() as any;
            if (params?.id && typeof params.id === 'string') {
                workflow.workflowId = params.id;
            }
            console.log("Running workflow:", workflow);

            const result = await executeWorkflow(workflow);
            console.log("Workflow execution result:", result);

            if (result.success && result.result) {
                console.log("TopBar received outputs:", result.result.nodeOutputs);
                setExecutionResults(result.result.nodeOutputs);
                if ((result as any).execution) {
                    useWorkflowStore.getState().addExecution((result as any).execution);
                }
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
        <div className="h-14 flex-none bg-[#0E0E14] border-b border-white/5 flex items-center justify-between px-6 z-50">
            {/* Left Box: Nav & Title */}
            <div className="flex items-center gap-4 w-1/3">
                <Link href="/workflows" className="text-neutral-500 hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                </Link>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Sparkles size={12} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-200 tracking-wide group-hover:text-white transition-colors">
                        Untitled Workflow
                    </span>
                </div>
            </div>

            {/* Center Box: Generic Actions */}
            <div className="flex items-center justify-center gap-2 w-1/3">
                <button
                    onClick={loadTemplate}
                    className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                    Load Template
                </button>
                <div className="h-3 w-px bg-white/10 mx-1" />
                <button
                    onClick={exportJSON}
                    className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                    <Download size={12} /> JSON
                </button>
                <button
                    onClick={exportSnapshot}
                    className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-white py-1.5 px-3 rounded-lg hover:bg-white/5 transition-all"
                >
                    <ImageIcon size={12} /> PNG
                </button>
            </div>

            {/* Right Box: Primary Actions */}
            <div className="flex items-center justify-end gap-3 w-1/3">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-2 rounded-xl transition-all"
                >
                    <Save size={14} />
                    Save
                </button>

                <button
                    onClick={runWorkflow}
                    disabled={isRunning}
                    className="flex items-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed px-5 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5"
                >
                    {isRunning ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Executing...
                        </>
                    ) : (
                        <>
                            <Play size={14} className="fill-current" />
                            Run All
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
