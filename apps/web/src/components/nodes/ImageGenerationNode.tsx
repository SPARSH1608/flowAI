import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import AdvancedToggle from "./AdvancedToggle";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { Play, Download, Eye, RefreshCcw, Upload } from "lucide-react";

import { useParams } from "next/navigation";

export default function ImageGenerationNode({ data, selected, id }: NodeProps) {
    const params = useParams();
    const config = data.config;
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

    console.log(`ImageGenerationNode [${id}] render. Result key:`, executionResult);

    const rawResult = executionResult?.['image[]']?.[0] || executionResult?.image;
    let resultImage = typeof rawResult === 'string' ? rawResult : rawResult?.url;

    if (resultImage && resultImage.startsWith('/')) {
        // Todo: use env variable for API URL
        resultImage = `http://localhost:3002${resultImage}`;
    }

    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

    const updateConfig = (key: string, value: any) => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...node.data.config,
                                [key]: value,
                            },
                        },
                    };
                }
                return node;
            })
        );
    };

    const updateSize = (key: "width" | "height", value: number) => {
        setNodes((nodes: any[]) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...node.data.config,
                                size: {
                                    ...node.data.config?.size,
                                    [key]: value,
                                },
                            },
                        },
                    };
                }
                return node;
            })
        );
    };

    const handleRun = async () => {
        console.log("Run/Regenerate clicked for node:", id);
        try {
            updateNodeData(id, { status: "executing" });
            console.log("ImageGenerationNode: workflowId from params:", params?.id);
            const workflow = {
                ...serializeWorkflow(),
                targetNodeId: id,
                workflowId: params?.id as string,
            };
            console.log("ImageGenerationNode: executing workflow with payload:", workflow);
            const result = await executeWorkflow(workflow, (partialResults) => {
                setExecutionResults(partialResults);
            });

            if (result.success && result.result) {
                setExecutionResults(result.result.nodeOutputs || {});

                // Check for errors specific to this node after final results are set
                const outputs = result.result.nodeOutputs || {};
                if (!outputs[id]) {
                    const errors = result.result.errors || [];
                    const myError = errors.find((e: any) => e.nodeId === id);
                    if (myError) {
                        alert(`❌ Execution Failed for this node!\nError: ${myError.error}`);
                        updateNodeData(id, { status: "error" });
                    } else {
                        updateNodeData(id, { status: "idle" });
                    }
                } else {
                    updateNodeData(id, { status: "idle" });
                }
            } else {
                updateNodeData(id, { status: "error" });
            }
        } catch (error) {
            console.error("Failed to re-run workflow:", error);
            alert("Failed to regenerate");
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
            link.download = `generated-${id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed:", err);
            window.open(resultImage, "_blank");
        }
    };

    const renderConfigurationForm = () => (
        <>
            <div className="space-y-3">
                <div>
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1 block">
                        Prompt
                    </label>
                    <textarea
                        className="w-full h-20 bg-neutral-900/50 border border-neutral-800 rounded-lg p-2 text-neutral-200 text-xs focus:outline-none focus:border-neutral-700 resize-none placeholder:text-neutral-600"
                        placeholder="Describe image..."
                        defaultValue={config?.prompt}
                        onBlur={(e) => updateConfig("prompt", e.target.value)}
                    />
                </div>
            </div>

            <div className="flex gap-2 text-xs">
                <div className="flex-1">
                    <label className="text-[10px] text-neutral-500 mb-0.5 block">Width</label>
                    <input
                        type="number"
                        className="nodrag w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs text-neutral-300"
                        value={config.size?.width || 1024}
                        onChange={(e) => updateSize("width", parseInt(e.target.value))}
                    />
                </div>
                <div className="flex-1">
                    <label className="text-[10px] text-neutral-500 mb-0.5 block">Height</label>
                    <input
                        type="number"
                        className="nodrag w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs text-neutral-300"
                        value={config.size?.height || 768}
                        onChange={(e) => updateSize("height", parseInt(e.target.value))}
                    />
                </div>
            </div>

            <AdvancedToggle>
                <div className="space-y-2">
                    <input
                        type="number"
                        className="nodrag w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="CFG Scale"
                        value={config.cfgScale || ""}
                        onChange={(e) => updateConfig("cfgScale", +e.target.value)}
                    />
                    <input
                        type="number"
                        className="nodrag w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="Steps"
                        value={config.steps || ""}
                        onChange={(e) => updateConfig("steps", +e.target.value)}
                    />

                    <select
                        className="nodrag w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700"
                        defaultValue={config.model || "fal-ai/flux-realism"}
                        onChange={(e) => updateConfig("model", e.target.value)}
                    >
                        <optgroup label="Flux Family">
                            <option value="fal-ai/flux-realism">Flux Realism (Balanced)</option>
                            <option value="fal-ai/flux-pro/v1.1">Flux Pro 1.1 (Premium)</option>
                            <option value="fal-ai/flux/dev">Flux Dev</option>
                            <option value="fal-ai/flux/schnell">Flux Schnell (Fast)</option>
                        </optgroup>
                        <optgroup label="Other Models">
                            <option value="fal-ai/recraft-v3">Recraft V3 (Design/Art)</option>
                            <option value="fal-ai/stable-diffusion-v35-large">SD 3.5 Large</option>
                            <option value="fal-ai/ip-adapter-face-id">IP-Adapter Face ID</option>
                            <option value="custom">Custom Fal Model</option>
                        </optgroup>
                    </select>

                    {config.model === "custom" && (
                        <input
                            type="text"
                            className="nodrag w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs text-neutral-300"
                            placeholder="fal-ai/..."
                            value={config.customModel || ""}
                            onChange={(e) => updateConfig("customModel", e.target.value)}
                        />
                    )}

                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>Identity Strength</span>
                            <span>{config.strength ?? 0.5}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={config.strength ?? 0.5}
                            onChange={(e) => updateConfig("strength", parseFloat(e.target.value))}
                            className="nodrag w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />

                    </div>

                </div>
            </AdvancedToggle>

            <button
                onClick={handleRun}
                disabled={data.status === "executing"}
                className="nodrag w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded text-xs font-semibold transition-colors mt-4"
            >
                {resultImage ? <RefreshCcw size={14} /> : <Play size={14} />}
                {data.status === "executing" ? "Generating..." : resultImage ? "Regenerate" : "Generate"}
            </button>
        </>
    );

    return (
        <BaseNode
            title="Image Generation"
            status={data.status}
            selected={selected}
            id={id}
            hideDefaultResult
        >
            <ExternalPort direction="in" type="text" position={Position.Left} style={{ top: "25%" }} />
            <ExternalPort direction="in" type="image[]" position={Position.Left} style={{ top: "75%" }} />

            <ExternalPort direction="out" type="image[]" position={Position.Right} style={{ top: "50%" }} />

            {resultImage ? (
                <div className="space-y-4">
                    <div className="relative w-full aspect-square min-h-[300px] group rounded-lg overflow-hidden bg-black border border-neutral-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={resultImage}
                            className="w-full h-full object-cover"
                            alt="Generated"
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
                                <Eye size={20} />
                            </button>

                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!resultImage) return;
                                    try {
                                        const res = await fetch("http://localhost:3002/images/save-generated", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                imageUrl: resultImage,
                                                purpose: config.purpose || "generated"
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
                                <Upload size={20} />
                            </button>

                            <button
                                onClick={handleDownload}
                                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 border border-white/20"
                                title="Download"
                            >
                                <Download size={20} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRun();
                                }}
                                className="p-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-all transform hover:scale-110 border border-white/20 shadow-lg"
                                title="Regenerate"
                            >
                                <RefreshCcw size={20} />
                            </button>
                        </div>

                        <div className="absolute top-2 left-2 bg-black/50 text-white/80 text-[10px] px-2 py-0.5 rounded-full border border-white/10 pointer-events-none">
                            {config.size?.width || 1024} × {config.size?.height || 1024}
                        </div>
                    </div>

                </div>
            ) : (
                renderConfigurationForm()
            )}
        </BaseNode>
    );
}
