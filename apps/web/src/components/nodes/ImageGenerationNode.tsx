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
            console.log("ImageGenerationNode: workflowId from params:", params?.id);
            const workflow = {
                ...serializeWorkflow(),
                targetNodeId: id,
                workflowId: params?.id as string,
            };
            console.log("ImageGenerationNode: executing workflow with payload:", workflow);
            const result = await executeWorkflow(workflow);

            if (result.success && result.result) {
                const outputs = result.result.nodeOutputs || {};

                if (!outputs[id]) {
                    const errors = result.result.errors || [];
                    const myError = errors.find((e: any) => e.nodeId === id);
                    if (myError) {
                        alert(`❌ Execution Failed for this node!\nError: ${myError.error}`);
                    }
                }

                setExecutionResults(outputs);
            }
        } catch (error) {
            console.error("Failed to re-run workflow:", error);
            alert("Failed to regenerate");
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
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Width"
                    defaultValue={config.size?.width || ""}
                    onBlur={(e) => updateSize("width", +e.target.value)}
                />
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Height"
                    defaultValue={config.size?.height || ""}
                    onBlur={(e) => updateSize("height", +e.target.value)}
                />
            </div>

            <AdvancedToggle>
                <div className="space-y-2">
                    <input
                        type="number"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="CFG Scale"
                        defaultValue={config.cfgScale || ""}
                        onBlur={(e) => updateConfig("cfgScale", +e.target.value)}
                    />
                    <input
                        type="number"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="Steps"
                        defaultValue={config.steps || ""}
                        onBlur={(e) => updateConfig("steps", +e.target.value)}
                    />

                    <select
                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs text-neutral-300"
                        defaultValue={config.model || "fal-ai/flux-realism"}
                        onChange={(e) => updateConfig("model", e.target.value)}
                    >
                        <option value="fal-ai/flux-realism">Flux Realism (Default)</option>
                        <option value="fal-ai/flux-pro/v1.1">Flux Pro 1.1 (Premium)</option>
                        <option value="fal-ai/flux/dev">Flux Dev</option>
                        <option value="fal-ai/flux/schnell">Flux Schnell (Fast)</option>
                        <option value="fal-ai/recraft-v3">Recraft V3 (Vector/Art)</option>
                        <option value="custom">Custom Model</option>
                    </select>

                    {config.model === "custom" && (
                        <input
                            type="text"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                            placeholder="fal-ai/model-name (e.g. fal-ai/flux-lora)"
                            defaultValue={config.customModel || ""}
                            onBlur={(e) => updateConfig("customModel", e.target.value)}
                        />
                    )}

                    <div className="space-y-1 mt-2">
                        <div className="flex justify-between text-[10px] text-neutral-400">
                            <span>Identity Strength</span>
                            <span>{config.strength || 0.75}</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.05"
                            className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                            defaultValue={config.strength || 0.75}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                updateConfig("strength", val);
                                e.target.title = val.toFixed(2);
                            }}
                        />

                    </div>

                    {executionResult?.debugInfo && (
                        <div className="mt-4 pt-4 border-t border-neutral-800">
                            <h3 className="text-[10px] uppercase text-neutral-500 font-semibold mb-2">Debug Info</h3>
                            <div className="bg-black/50 rounded p-2 text-[10px] font-mono text-neutral-400 overflow-x-auto whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {JSON.stringify(executionResult.debugInfo, null, 2)}
                            </div>
                        </div>
                    )}
                </div>
            </AdvancedToggle>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleRun();
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-medium transition-colors mt-2"
            >
                {resultImage ? <RefreshCcw size={14} /> : <Play size={14} />}
                {resultImage ? "Regenerate" : "Generate"}
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

                    {selected && (
                        <div className="pt-2 border-t border-neutral-800 animate-in slide-in-from-top-2 fade-in duration-200">
                            {renderConfigurationForm()}
                        </div>
                    )}
                </div>
            ) : (
                renderConfigurationForm()
            )}
        </BaseNode>
    );
}
