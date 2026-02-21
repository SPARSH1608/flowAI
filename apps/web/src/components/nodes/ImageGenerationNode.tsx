import { type NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { Play, Download, Eye, RefreshCcw, Upload, Settings2 } from "lucide-react";

import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ImageGenerationNode({ data, selected, id }: NodeProps) {
    const nodeData = data as any;
    const { token } = useAuth();
    const params = useParams();
    const config = nodeData.config;
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const executionResult = useWorkflowStore((s) => s.executionResults?.[id]);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);
    const addExecution = useWorkflowStore((s) => s.addExecution);
    const setNodeExecutionStatus = useWorkflowStore((s) => s.setNodeExecutionStatus);

    console.log(`ImageGenerationNode [${id}] render. Result key:`, executionResult);

    const rawResult = executionResult?.['image[]']?.[0] || executionResult?.image;
    let resultImage = typeof rawResult === 'string' ? rawResult : rawResult?.url;

    if (resultImage && resultImage.startsWith('/')) {
        resultImage = `${process.env.NEXT_PUBLIC_API_URL}${resultImage}`;
    }

    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);

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
            }, (nId) => {
                setNodeExecutionStatus(nId, "running");
            }, token as any);

            if (result.success && result.result) {
                setExecutionResults(result.result.nodeOutputs || {});
                if (result.execution) {
                    addExecution(result.execution);
                }
                Object.keys(result.result.nodeOutputs || {}).forEach(nId => setNodeExecutionStatus(nId, "completed"));
                if (result.result.errors?.length) {
                    result.result.errors.forEach((e: any) => setNodeExecutionStatus(e.nodeId, "error"));
                }

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

    const renderEmptyState = () => (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-white/10 rounded-xl bg-black/20">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                <Settings2 className="text-indigo-400" size={18} />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200 mb-1">Configure Node</h3>
            <p className="text-xs text-neutral-500 max-w-[200px] mb-4">
                Select this node to set up prompts and model parameters in the Inspector.
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(id);
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-neutral-300 transition-colors"
            >
                Open Inspector
            </button>
        </div>
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
                                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/save-generated`, {
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
                renderEmptyState()
            )}
        </BaseNode>
    );
}
