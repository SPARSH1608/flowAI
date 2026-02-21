"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import NodeStatusBadge from "./NodeStatusBadge";
import { Play, Trash2 } from "lucide-react";
import { NodeResizer } from "@xyflow/react";
import { useWorkflowStore } from "@/store/workflowStore";
import { serializeWorkflow } from "@/utils/serializeWorkflow";
import { executeWorkflow } from "@/utils/workflow";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
    const addExecution = useWorkflowStore((s) => s.addExecution);
    const executionResults = useWorkflowStore((s) => s.executionResults);
    const setNodeExecutionStatus = useWorkflowStore((s) => s.setNodeExecutionStatus);
    const executionStatus = useWorkflowStore((s) => s.nodeExecutionStatus[id]);
    const { token } = useAuth();

    const handleReExecute = async () => {
        // Mapping is now handled in RightInspector auto-saves.
        // Re-run the node directly
        setTimeout(async () => {
            const workflow = {
                ...serializeWorkflow(),
                targetNodeId: id,
                workflowId: params?.id as string,
            };
            const result = await executeWorkflow(workflow, (partialResults) => {
                setExecutionResults(partialResults);
                Object.keys(partialResults).forEach(nId => setNodeExecutionStatus(nId, "completed"));
            }, (nId) => {
                setNodeExecutionStatus(nId, "running");
            }, token as any);
            if (result.success && result.result) {
                setExecutionResults(result.result.nodeOutputs || {});
                if ((result as any).execution) {
                    addExecution((result as any).execution);
                }
                Object.keys(result.result.nodeOutputs || {}).forEach(nId => setNodeExecutionStatus(nId, "completed"));
                if (result.result.errors?.length) {
                    result.result.errors.forEach((e: any) => setNodeExecutionStatus(e.nodeId, "error"));
                }
            }
        }, 100);
    };

    const nodeResult = executionResults?.[id];
    const node = useWorkflowStore(s => s.nodes.find(n => n.id === id));

    // Add pulsing border ring when node is actively running
    const isRunning = executionStatus?.status === "running";
    const isError = executionStatus?.status === "error";

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
                group relative flex flex-col rounded-2xl bg-[#1C1C24]/90 backdrop-blur-xl border transition-all duration-300
                ${selected ? "border-indigo-500/50 shadow-[0_8px_30px_rgba(79,70,229,0.2)] ring-1 ring-indigo-500/30" : "border-white/5 shadow-2xl hover:border-white/10"}
                text-sm transform hover:-translate-y-1
                ${isRunning ? "ring-2 ring-indigo-400/80 shadow-[0_0_40px_rgba(99,102,241,0.3)] border-indigo-500/50" : ""}
                ${isError ? "ring-1 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)] border-red-500/30" : ""}
            `}
                style={{
                    width: node?.width ?? 320,
                    height: node?.height ?? 'auto',
                }}
            >
                {/* Status conic gradient active state */}
                {isRunning && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[pulse_1.5s_ease-in-out_infinite]" />
                )}
                {/* Header section */}
                <div className="react-flow__node-drag-handle flex items-center justify-between px-4 py-3 border-b border-white/5 bg-transparent cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2">
                        <NodeStatusBadge status={executionStatus?.status || status} />
                        <span className="text-xs font-bold tracking-wider text-neutral-200 uppercase">
                            {title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReExecute();
                            }}
                            className="nodrag p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-white transition-all transform hover:scale-105 border border-indigo-500/20"
                            title="Quick Run Node"
                        >
                            <Play size={12} className="fill-current" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-4 flex flex-col flex-1 min-h-0 relative">
                    <div className="flex-none">
                        {children}
                    </div>

                    {!hideDefaultResult && <ExecutionResult id={id} nodeHeight={node?.height} />}
                </div>
            </div >

            {selected && (
                <div className="nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#1C1C24] rounded-xl border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <ToolbarButton icon={<Trash2 size={14} />} onClick={() => deleteNode(id)} danger />
                </div>
            )
            }
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
            <div className={`text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider flex justify-between items-center`}>
                <span>Output</span>
                {isTruncated && !shouldExpand && (
                    <button onClick={() => setIsExpanded(true)} className="nodrag text-indigo-400 hover:text-indigo-300 normal-case tracking-normal hover:underline">
                        Expand
                    </button>
                )}
                {isExpanded && !nodeHeight && (
                    <button onClick={() => setIsExpanded(false)} className="nodrag text-neutral-400 hover:text-neutral-300 normal-case tracking-normal hover:underline">
                        Collapse
                    </button>
                )}
            </div>

            <div className={`bg-black/40 rounded-xl border border-white/5 overflow-hidden flex flex-col relative ${shouldExpand ? 'flex-1 min-h-0' : ''}`}>
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
