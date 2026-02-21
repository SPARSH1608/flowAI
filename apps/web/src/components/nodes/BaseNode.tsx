"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import NodeStatusBadge from "./NodeStatusBadge";
import { Info, Play, Trash2 } from "lucide-react";
import { NodeResizer } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import NodeInfoModal from "../modals/NodeInfoModal";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { useParams } from "next/navigation";

interface BaseNodeProps {
    id: string;
    title: string;
    children: ReactNode;
    status?: any;
    selected?: boolean;
    hideDefaultResult?: boolean;
}

export default function BaseNode({
    id,
    title,
    children,
    status,
    selected,
    hideDefaultResult,
}: BaseNodeProps) {
    const params = useParams();
    const deleteNode = useWorkflowStore((s) => s.deleteNode);
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const setExecutionResults = useWorkflowStore((s) => s.setExecutionResults);
    const executionResults = useWorkflowStore((s) => s.executionResults);

    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const handleReExecute = async (editedData?: any) => {
        setIsInfoModalOpen(false);
        if (editedData) {
            // Map edited info back to config override based on node type
            setNodes((nodes) => nodes.map(n => {
                if (n.id === id) {
                    if (id.includes('image-generation')) {
                        return { ...n, data: { ...n.data, config: { ...n.data.config, debugInfoOverride: editedData } } };
                    } else if (id.includes('assistant') || id.includes('text')) {
                        return { ...n, data: { ...n.data, config: { ...n.data.config, text: editedData.text } } };
                    }
                }
                return n;
            }));
        }

        // Re-run the node
        setTimeout(async () => {
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
            }
        }, 100);
    };

    const nodeResult = executionResults?.[id];
    // Gather everything relevant to edit/review for this node
    const debugData = nodeResult?.debugInfo || nodeResult;
    const node = useWorkflowStore(s => s.nodes.find(n => n.id === id));

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={280}
                minHeight={150}
                onResizeEnd={(_, { width, height }) => {
                    setNodes(nodes =>
                        nodes.map(n => n.id === id ? { ...n, width, height } : n)
                    );
                }}
                lineClassName="border-blue-500/30"
                handleClassName="h-2 w-2 bg-blue-500 border-none rounded-sm"
            />

            <div className={`
                group relative flex flex-col rounded-2xl bg-[#0F0F11] border transition-all duration-300
                ${selected ? "border-blue-500/50 shadow-[0_4px_30px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20" : "border-neutral-800/60 shadow-xl hover:border-neutral-700/80"}
                text-sm overflow-hidden
            `}
                style={{
                    width: node?.width ?? 320,
                    height: node?.height ?? 'auto',
                }}
            >
                {/* Header section */}
                <div className="react-flow__node-drag-handle flex items-center justify-between px-4 py-3 border-b border-neutral-800/50 bg-[#161618] cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2">
                        <NodeStatusBadge status={status} />
                        <span className="text-[11px] font-semibold tracking-wide text-neutral-300">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsInfoModalOpen(true);
                            }}
                            className="nodrag p-1.5 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-all transform hover:scale-105"
                            title="Node Details & Edit"
                        >
                            <Info size={14} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-4 flex flex-col flex-1 min-h-0 relative bg-gradient-to-b from-transparent to-[#0A0A0A]/50">
                    <div className="flex-none">
                        {children}
                    </div>

                    {!hideDefaultResult && <ExecutionResult id={id} nodeHeight={node?.height} />}
                </div>
            </div>

            <NodeInfoModal
                isOpen={isInfoModalOpen}
                onClose={() => setIsInfoModalOpen(false)}
                title={title}
                data={debugData}
                onReExecute={handleReExecute}
            />

            {selected && (
                <div className="nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#1A1A1A] rounded-xl border border-neutral-800/80 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <ToolbarButton icon={<Trash2 size={14} />} onClick={() => deleteNode(id)} danger />
                </div>
            )}
        </>
    );
}

function ToolbarButton({ icon, onClick, danger }: { icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-md transition-colors ${danger ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' : 'text-neutral-400 hover:bg-neutral-700 hover:text-white'}`}
        >
            {icon}
        </button>
    )
}

function ExecutionResult({ id, nodeHeight }: { id: string, nodeHeight?: number }) {
    const output = useWorkflowStore((s) => s.executionResults?.[id]);
    const textRef = useRef<HTMLDivElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Automatically determine if progressive disclosure expander is needed based on manual heights
        if (textRef.current && !nodeHeight && !isExpanded) {
            setIsTruncated(textRef.current.scrollHeight > textRef.current.clientHeight);
        } else {
            setIsTruncated(false);
        }
    }, [output, nodeHeight, isExpanded]);

    if (!output) return null;

    // Expand if specifically resized
    const shouldExpand = isExpanded || !!nodeHeight;

    return (
        <div className="flex flex-col flex-1 min-h-0 mt-2">
            <div className="text-[10px] font-semibold text-neutral-500 mb-2 uppercase tracking-wider flex justify-between items-center">
                <span>Output</span>
                {isTruncated && !shouldExpand && (
                    <button onClick={() => setIsExpanded(true)} className="nodrag text-blue-400 hover:text-blue-300 normal-case tracking-normal hover:underline">
                        Expand
                    </button>
                )}
                {isExpanded && !nodeHeight && (
                    <button onClick={() => setIsExpanded(false)} className="nodrag text-neutral-400 hover:text-neutral-300 normal-case tracking-normal hover:underline">
                        Collapse
                    </button>
                )}
            </div>

            <div className={`bg-[#0A0A0A] rounded-xl border border-neutral-800/60 overflow-hidden flex flex-col relative ${shouldExpand ? 'flex-1 min-h-0' : ''}`}>
                {output.image ? (
                    <div className="relative aspect-video w-full bg-black/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={output.image}
                            alt="Output"
                            className="w-full h-full object-contain"
                        />
                    </div>
                ) : output['image[]'] && Array.isArray(output['image[]']) ? (
                    <div className="grid grid-cols-2 gap-0.5 bg-neutral-900 border-b border-neutral-800">
                        {output['image[]'].map((img: string, i: number) => (
                            <div key={i} className="relative aspect-square w-full bg-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img}
                                    alt={`Output ${i}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                ) : output.text ? (
                    <>
                        <div
                            ref={textRef}
                            className={`p-3 text-[13px] leading-relaxed text-neutral-300 break-words ${shouldExpand ? 'overflow-y-auto custom-scrollbar flex-1' : 'line-clamp-4'}`}
                        >
                            {output.text}
                        </div>
                        {!shouldExpand && isTruncated && (
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none" />
                        )}
                    </>
                ) : (
                    <pre
                        className="p-3 text-[11px] font-mono whitespace-pre-wrap text-neutral-400 overflow-auto custom-scrollbar flex-1"
                        style={{ maxHeight: shouldExpand ? '100%' : '120px' }}
                    >
                        {JSON.stringify(output, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
