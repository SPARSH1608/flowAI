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
    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);

    console.log(`ImageGenerationNode [${id}] render. Result key:`, executionResult);
    let resultImage = executionResult?.['image[]']?.[0] || executionResult?.image;

    if (resultImage && resultImage.startsWith('/')) {
        resultImage = `http://localhost:3002${resultImage}`;
    }

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
                setExecutionResults(result.result.nodeOutputs);
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
                        onChange={(e) => {
                            config.prompt = e.target.value;
                            data.status = "configured";
                        }}
                    />
                </div>
            </div>

            <div className="flex gap-2 text-xs">
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Width"
                    defaultValue={config.size?.width || ""}
                    onChange={(e) => {
                        config.size = { ...config.size, width: +e.target.value };
                    }}
                />
                <input
                    type="number"
                    className="w-1/2 bg-neutral-800 border border-neutral-700 rounded p-1"
                    placeholder="Height"
                    defaultValue={config.size?.height || ""}
                    onChange={(e) => {
                        config.size = { ...config.size, height: +e.target.value };
                    }}
                />
            </div>

            <AdvancedToggle>
                <div className="space-y-2">
                    <input
                        type="number"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="CFG Scale"
                        defaultValue={config.cfgScale || ""}
                        onChange={(e) => (config.cfgScale = +e.target.value)}
                    />
                    <input
                        type="number"
                        className="w-full bg-neutral-800 border border-neutral-700 rounded p-1 text-xs"
                        placeholder="Steps"
                        defaultValue={config.steps || ""}
                        onChange={(e) => (config.steps = +e.target.value)}
                    />
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
