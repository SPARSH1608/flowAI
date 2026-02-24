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
import { useAuth } from "@/context/AuthContext";
import UserMenu from "../auth/UserMenu";

export default function TopBar() {
    const router = useRouter();
    const params = useParams();
    const { user, logout, token } = useAuth();
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
        if (!token) return;
        setIsRunning(true);
        try {
            const workflow = serializeWorkflow() as any;
            if (params?.id && typeof params.id === 'string') {
                workflow.workflowId = params.id;
            }
            console.log("Running workflow:", workflow);

            const result = await executeWorkflow(workflow, (partialResults) => {
                setExecutionResults(partialResults);
            }, (nodeId) => {
                console.log(`Node ${nodeId} started`);
            }, (nodeId, message) => {
                useWorkflowStore.getState().addExecutionLog(nodeId, message);
            }, token);

            console.log("Workflow execution result:", result);

            if (result.success && result.result) {
                setExecutionResults(result.result.nodeOutputs);
                if ((result as any).execution) {
                    useWorkflowStore.getState().addExecution((result as any).execution);
                }
            }
        } catch (error: any) {
            console.error("Workflow execution failed:", error);
            alert(`Workflow execution failed: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    }

    async function handleSave() {
        if (!token) return;
        try {
            const workflow = serializeWorkflow();

            if (params?.id && typeof params.id === 'string') {
                await updateWorkflow(params.id, workflow, token);
                alert("Workflow updated!");
            } else {
                const result = await createWorkflow(workflow, token);
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
        <div className="h-14 flex-none bg-white border-b border-neutral-200 flex items-center justify-between px-6 z-50 shadow-sm relative">
            <div className="flex items-center gap-4 w-1/3">
                <Link href="/" className="text-neutral-500 hover:text-neutral-900 transition-colors">
                    <ChevronLeft size={18} />
                </Link>
                <div className="h-4 w-px bg-neutral-200" />
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-6 h-6 rounded-md bg-neutral-100 flex items-center justify-center border border-neutral-200">
                        <Sparkles size={12} className="text-neutral-600" />
                    </div>
                    <span className="text-sm font-semibold text-neutral-700 tracking-wide group-hover:text-neutral-900 transition-colors">
                        {useWorkflowStore.getState().metadata?.name || "Untitled Workflow"}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-center gap-2 w-1/3">
                <button
                    onClick={loadTemplate}
                    className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-900 py-1.5 px-3 rounded-lg hover:bg-neutral-100 transition-all"
                >
                    Load Template
                </button>
                <div className="h-3 w-px bg-neutral-200 mx-1" />
                <button
                    onClick={exportJSON}
                    className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-900 py-1.5 px-3 rounded-lg hover:bg-neutral-100 transition-all"
                >
                    <Download size={12} /> JSON
                </button>
                <button
                    onClick={exportSnapshot}
                    className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-neutral-500 hover:text-neutral-900 py-1.5 px-3 rounded-lg hover:bg-neutral-100 transition-all"
                >
                    <ImageIcon size={12} /> PNG
                </button>
            </div>

            <div className="flex items-center justify-end gap-3 w-1/3">
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 px-4 py-2 rounded-xl transition-all shadow-sm"
                >
                    <Save size={14} />
                    Save
                </button>

                <button
                    onClick={runWorkflow}
                    disabled={isRunning}
                    className="flex items-center gap-2 text-xs font-semibold text-white bg-[#171717] hover:bg-black disabled:bg-neutral-400 disabled:cursor-not-allowed px-5 py-2 rounded-xl transition-all shadow-sm transform hover:-translate-y-0.5"
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

                <div className="h-4 w-px bg-neutral-200 mx-1" />

                <UserMenu />
            </div>
        </div>
    );
}
