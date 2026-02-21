"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { Maximize2, RefreshCcw, Layers, Settings2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function UpscaleNode({ data, selected, id }: NodeProps) {
    const params = useParams();
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

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
            console.error("Upscale failed:", error);
            alert("Upscale failed");
            updateNodeData(id, { status: "error" });
        }
    };

    const resultImage = executionResult?.image || (executionResult?.['image[]'] && executionResult?.['image[]'][0]?.url) || (executionResult?.['image[]'] && typeof executionResult['image[]'][0] === 'string' ? executionResult['image[]'][0] : null);

    return (
        <BaseNode title="AI Upscaler" status={data.status} selected={selected} id={id} hideDefaultResult>
            <ExternalPort direction="in" type="image" position={Position.Left} style={{ top: "50%" }} />
            <ExternalPort direction="out" type="image" position={Position.Right} style={{ top: "50%" }} />

            <div className="space-y-4">
                {resultImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-black/40 group">
                        <img
                            src={typeof resultImage === 'string' ? resultImage : resultImage.url}
                            alt="Upscaled"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[10px] text-white font-medium bg-indigo-600 px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-indigo-900/50">
                                <Maximize2 size={10} /> Upscaled
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
                            <Settings2 className="text-indigo-400" size={14} />
                        </div>
                        <h3 className="text-xs font-semibold text-neutral-200 mb-1">Configure Upscaler</h3>
                        <p className="text-[10px] text-neutral-500 max-w-[160px] mb-3">
                            Select node to change model or upscale factor.
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeId(id);
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-medium text-neutral-300 transition-colors"
                        >
                            Open Inspector
                        </button>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRun();
                    }}
                    disabled={data.status === "executing"}
                    className="nodrag w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(79,70,229,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                    {resultImage ? <RefreshCcw size={14} /> : <Layers size={14} />}
                    {data.status === "executing" ? "Processing..." : resultImage ? "Upscale Again" : "Run Upscale"}
                </button>
            </div>
        </BaseNode>
    );
}
