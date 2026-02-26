"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { X, Settings2, FileJson, Play } from "lucide-react";
import { useState, useEffect } from "react";
import ImageGenerationDetailsView from "../modals/ImageGenerationDetailsView";

export default function RightInspector() {
    const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
    const nodes = useWorkflowStore((s) => s.nodes);
    const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
    const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
    const executionResults = useWorkflowStore((s) => s.executionResults);
    const executionLogs = useWorkflowStore((s) => s.executionLogs);

    const [content, setContent] = useState("");
    const [imageGenData, setImageGenData] = useState<any>(null);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    useEffect(() => {
        if (selectedNode) {
            const isTextBased = selectedNode.type === "TEXT_NODE" || selectedNode.type === "ASSISTANT_NODE";
            const isImageGen = selectedNode.type === "IMAGE_GENERATION_NODE";
            const nodeData = selectedNode.data as any;
            const executionResult = selectedNodeId ? executionResults?.[selectedNodeId] : null;

            if (isTextBased) {
                if (selectedNode.type === 'ASSISTANT_NODE') {
                    setContent(nodeData?.config?.instructions || "");
                } else {
                    setContent(nodeData?.config?.text || "");
                }
            } else if (isImageGen) {
                
                
                const debugData = executionResult || nodeData?.config || nodeData;
                setImageGenData(debugData);
            } else {
                setContent(JSON.stringify(nodeData, null, 2));
            }
        }
    }, [selectedNode, executionResults]);

    if (!selectedNodeId || !selectedNode) return null;

    const isTextBased = selectedNode.type === "TEXT_NODE" || selectedNode.type === "ASSISTANT_NODE";
    const isImageGen = selectedNode.type === "IMAGE_GENERATION_NODE";
    const title = selectedNode.data?.label || "Node";

    const handleSave = () => {
        try {
            if (isTextBased) {
                updateNodeData(selectedNodeId, { text: content });
            } else if (isImageGen) {
                updateNodeData(selectedNodeId, imageGenData);
            } else {
                const parsed = JSON.parse(content);
                updateNodeData(selectedNodeId, parsed);
            }
        } catch (e) {
            alert("Invalid config format");
        }
    };

    const hasExecuted = isImageGen && (
        (imageGenData?.intent && Object.keys(imageGenData.intent).length > 0) ||
        (imageGenData?.visualPlan && Object.keys(imageGenData.visualPlan).length > 0) ||
        imageGenData?.finalPrompt ||
        imageGenData?.debugInfo?.finalPrompt
    );

    const inspectorWidth = hasExecuted ? 'w-[800px]' : 'w-96';

    return (
        <div className={`${inspectorWidth} h-full flex-none bg-[#FAFAFA] border-l border-neutral-200 flex flex-col z-40 transform transition-all duration-300 translate-x-0 shadow-sm relative`}>
            {}
            <div className="flex-none px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-100 p-2 rounded-lg border border-neutral-200 text-neutral-700">
                        <Settings2 size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-neutral-900 tracking-wide">{title} Details</h2>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Inspector</p>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedNodeId(null)}
                    className="p-1.5 bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 rounded-md text-neutral-500 hover:text-neutral-900 transition-all focus:outline-none"
                    title="Close Inspector"
                >
                    <X size={14} />
                </button>
            </div>

            {}
            {isImageGen ? (
                <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-[#FAFAFA]">
                    <ImageGenerationDetailsView
                        data={imageGenData}
                        logs={executionLogs[selectedNodeId] || []}
                        onChange={(newData) => {
                            setImageGenData(newData);
                            
                            
                            updateNodeData(selectedNodeId, { config: { ...selectedNode.data.config, ...newData } });
                        }}
                    />
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#FAFAFA]">
                    {}
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 block tracking-wider">Node Title</label>
                            <input
                                className="w-full bg-white border border-neutral-200 rounded-lg p-2.5 text-neutral-900 text-sm focus:outline-none focus:border-neutral-400 shadow-sm"
                                value={selectedNode.data?.label || ""}
                                onChange={(e) => updateNodeData(selectedNodeId, { label: e.target.value })}
                            />
                        </div>
                    </div>

                    {}
                    {isTextBased ? (
                        <div className="space-y-4 border-t border-neutral-200 pt-4">
                            <label className="text-[10px] uppercase text-neutral-500 font-semibold mb-1.5 flex items-center gap-2 tracking-wider">
                                {selectedNode.type === 'ASSISTANT_NODE' ? 'Directives / Instructions' : 'Text Content'}
                            </label>
                            <textarea
                                className="w-full h-48 bg-white border border-neutral-200 rounded-xl p-3 text-neutral-900 text-sm leading-relaxed focus:outline-none focus:border-neutral-400 resize-none custom-scrollbar shadow-sm"
                                value={content}
                                onChange={(e) => {
                                    setContent(e.target.value);
                                    if (selectedNode.type === 'ASSISTANT_NODE') {
                                        updateNodeData(selectedNodeId, { config: { ...selectedNode.data.config, instructions: e.target.value } });
                                    } else {
                                        updateNodeData(selectedNodeId, { config: { ...selectedNode.data.config, text: e.target.value } });
                                    }
                                }}
                                spellCheck={false}
                                placeholder="Enter text..."
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 border-t border-neutral-200 pt-4">
                            <div className="flex items-center gap-2 mb-1.5">
                                <FileJson size={14} className="text-neutral-500" />
                                <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-wider">Node Data (JSON)</span>
                            </div>
                            <textarea
                                className="w-full h-64 bg-white border border-neutral-200 rounded-xl p-3 font-mono text-[11px] text-neutral-700 leading-relaxed focus:outline-none focus:border-neutral-400 resize-y custom-scrollbar shadow-sm"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onBlur={handleSave}
                                spellCheck={false}
                                placeholder="Edit JSON data..."
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

