"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { Play, Maximize2, RefreshCcw, Layers } from "lucide-react";
import { useParams } from "next/navigation";

export default function UpscaleNode({ data, selected, id }: NodeProps) {
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
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Model</label>
                        <select
                            className="nodrag w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/50"
                            value={config.model || "fal-ai/ccsr"}
                            onChange={(e) => updateConfig("model", e.target.value)}
                        >
                            <option value="fal-ai/ccsr">Fal CCSR (Default)</option>
                            <option value="fal-ai/clarity-upscaler">Clarity Upscaler</option>
                            <option value="fal-ai/fotor-upscale">Fotor Upscale</option>
                            <option value="fal-ai/esrgan">ESRGAN (Fast)</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Factor</label>
                        <select
                            className="nodrag w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500/50"
                            value={config.factor || 2}
                            onChange={(e) => updateConfig("factor", parseInt(e.target.value))}
                        >
                            <option value={2}>2x</option>
                            <option value={4}>4x</option>
                        </select>
                    </div>
                </div>

                {resultImage && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-neutral-800 bg-black/40 group">
                        <img
                            src={typeof resultImage === 'string' ? resultImage : resultImage.url}
                            alt="Upscaled"
                            className="w-full h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <span className="text-[10px] text-white font-medium bg-blue-600 px-2 py-1 rounded-full flex items-center gap-1">
                                <Maximize2 size={10} /> Upscaled
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRun();
                    }}
                    disabled={data.status === "executing"}
                    className="nodrag w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {resultImage ? <RefreshCcw size={14} /> : <Layers size={14} />}
                    {data.status === "executing" ? "Upscaling..." : resultImage ? "Upscale Again" : "Execute Upscale"}
                </button>
            </div>
        </BaseNode>
    );
}
