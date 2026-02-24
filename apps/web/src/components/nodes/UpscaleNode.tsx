"use client";

import { type NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { Maximize2, RefreshCcw, Layers, Settings2, Download, Eye, Upload } from "lucide-react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function UpscaleNode({ data, selected, id }: NodeProps) {
    const nodeData = data as any;
    const { token } = useAuth();
    const params = useParams();
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

    const rawResult = executionResult?.image || (executionResult?.['image[]'] && executionResult?.['image[]'][0]?.url) || (executionResult?.['image[]'] && typeof executionResult['image[]'][0] === 'string' ? executionResult['image[]'][0] : null);

    let resultImage = typeof rawResult === 'string' ? rawResult : rawResult?.url;
    if (resultImage && resultImage.startsWith('/')) {
        resultImage = `${process.env.NEXT_PUBLIC_API_URL}${resultImage}`;
    }

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
            }, undefined, token as any);
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

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!resultImage) return;
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `upscaled-${id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            window.open(resultImage, "_blank");
        }
    };

    return (
        <BaseNode title="AI Upscaler" status={nodeData.status} selected={selected} id={id} hideDefaultResult>
            <ExternalPort direction="in" type="image" position={Position.Left} style={{ top: "50%" }} />
            <ExternalPort direction="out" type="image" position={Position.Right} style={{ top: "50%" }} />

            <div className="space-y-4">
                {resultImage ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-black/40 group">
                        <img
                            src={resultImage}
                            alt="Upscaled"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(resultImage, "_blank");
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 border border-white/20"
                                title="Preview"
                            >
                                <Eye size={18} />
                            </button>

                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!resultImage) return;
                                    try {
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/save-generated`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                imageUrl: resultImage,
                                                purpose: "upscaled"
                                            })
                                        });
                                        if (res.ok) {
                                            alert("Saved to uploads!");
                                        } else {
                                            const err = await res.json();
                                            alert(`Failed to save: ${err.error}`);
                                        }
                                    } catch (err) {
                                        console.error("Save failed:", err);
                                        alert("Failed to save image");
                                    }
                                }}
                                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 border border-white/20"
                                title="Save to Uploads"
                            >
                                <Upload size={18} />
                            </button>

                            <button
                                onClick={handleDownload}
                                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 border border-white/20"
                                title="Download"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mb-2">
                            <Settings2 className="text-indigo-400" size={14} />
                        </div>
                        <h3 className="text-xs font-semibold text-neutral-900 mb-1">Configure Upscaler</h3>
                        <p className="text-[10px] text-neutral-500 max-w-[160px] mb-3">
                            Select node to change model or upscale factor.
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNodeId(id);
                            }}
                            className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded-lg text-[10px] font-medium text-neutral-700 transition-colors"
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
                    className="nodrag w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-xl text-xs font-semibold shadow-[0_4px_20px_rgba(79,70,229,0.2)] transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-neutral-200"
                >
                    {resultImage ? <RefreshCcw size={14} /> : <Layers size={14} />}
                    {data.status === "executing" ? "Processing..." : resultImage ? "Upscale Again" : "Run Upscale"}
                </button>
            </div>
        </BaseNode>
    );
}
