"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import TypedPort from "../ports/TypedPort";
import ExternalPort from "../ports/ExternalPort";

import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { useParams } from "next/navigation";
import { Play, Sparkles, RefreshCcw } from "lucide-react";

export default function AssistantNode({ data, selected, id }: NodeProps) {
    const params = useParams();
    const config = data.config;
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

    const updateConfig = (key: string, value: any) => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: { ...node.data.config, [key]: value },
                        },
                    };
                }
                return node;
            })
        );
    };

    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

    const handleRun = async () => {
        try {
            updateNodeData(id, { status: "executing" });
            const workflow = {
                ...serializeWorkflow(),
                targetNodeId: id,
                workflowId: params?.id as string,
            };
            const result = await executeWorkflow(workflow, (partialResults) => {
                setExecutionResults(partialResults);
            });
            if (result.success && result.result) {
                setExecutionResults(result.result.nodeOutputs || {});
                const errors = result.result.errors || [];
                if (errors.find((e: any) => e.nodeId === id)) updateNodeData(id, { status: "error" });
                else updateNodeData(id, { status: "idle" });
            } else {
                updateNodeData(id, { status: "error" });
            }
        } catch (error) {
            console.error("Assistant execution failed:", error);
            alert("Failed to run assistant");
            updateNodeData(id, { status: "error" });
        }
    };

    return (
        <BaseNode title="AI Assistant" status={data.status} selected={selected} id={id}>
            <ExternalPort direction="in" type="text" position={Position.Left} style={{ top: "50%" }} />
            <ExternalPort direction="out" type="text" position={Position.Right} style={{ top: "50%" }} />

            <div className="space-y-4">
                {(!executionResult?.text || selected) && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <label className="text-[10px] uppercase text-neutral-500 font-bold mb-1.5 block tracking-wider">
                            Assistant Directives
                        </label>
                        <textarea
                            className="nodrag w-full h-20 bg-[#111113] border border-neutral-800/80 rounded-xl p-3 text-neutral-300 text-[13px] focus:outline-none focus:border-blue-500/50 resize-none transition-all placeholder:text-neutral-600 custom-scrollbar shadow-inner"
                            placeholder="e.g. Make it more cinematic, focus on urban lighting..."
                            value={config.instructions || ""}
                            onChange={(e) => updateConfig("instructions", e.target.value)}
                        />
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRun();
                    }}
                    disabled={data.status === "executing"}
                    className="nodrag w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(37,99,235,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {executionResult?.text ? <RefreshCcw size={14} /> : <Play size={14} className="fill-current" />}
                    {data.status === "executing" ? "Thinking..." : executionResult?.text ? "Refine Prompt" : "Run Assistant"}
                </button>
            </div>
        </BaseNode>
    );
}
