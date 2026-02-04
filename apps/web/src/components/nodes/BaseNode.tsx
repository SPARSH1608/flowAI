"use client";

import { ReactNode } from "react";
import NodeStatusBadge from "./NodeStatusBadge";
import { Edit2, Trash2, Play, MousePointer2 } from "lucide-react";
import { NodeResizer } from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";

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
    const deleteNode = useWorkflowStore((s) => s.deleteNode);

    return (
        <>
            <NodeResizer
                isVisible={selected}
                minWidth={280}
                minHeight={150}
                lineClassName="border-blue-500"
                handleClassName="h-3 w-3 bg-blue-500 border-2 border-white rounded"
            />

            <div className={`
        group
        relative
        min-w-[280px]
        rounded-2xl
        bg-[#131313]
        transition-all duration-200
        ${selected ? "border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "border border-neutral-800/80 hover:border-neutral-700 shadow-xl"}
        text-sm
      `}>
                <div className="absolute -top-8 left-0 flex items-center gap-2 px-1">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Edit2 size={12} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                            {title}
                        </span>
                    </div>
                    <NodeStatusBadge status={status} />
                </div>

                <div className="p-4 space-y-3 h-full flex flex-col">
                    {children}

                    {!hideDefaultResult && <ExecutionResult id={id} />}
                </div>
            </div>

            {selected && (
                <div className="nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-[#1F1F1F] rounded-lg border border-neutral-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
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

function ExecutionResult({ id }: { id: string }) {
    const output = useWorkflowStore((s) => s.executionResults?.[id]);

    if (!output) return null;

    return (
        <div className="mt-2 pt-2 border-t border-neutral-800">
            <div className="text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide">
                Output
            </div>

            <div className="bg-black/20 rounded-lg overflow-hidden">
                {output.image ? (
                    <div className="relative aspect-video w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={output.image}
                            alt="Output"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : output['image[]'] && Array.isArray(output['image[]']) ? (
                    <div className="grid grid-cols-2 gap-0.5">
                        {output['image[]'].map((img: string, i: number) => (
                            <div key={i} className="relative aspect-square w-full">
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
                    <div className="p-2 text-sm text-neutral-300">
                        {output.text}
                    </div>
                ) : (
                    <pre className="p-2 text-[10px] text-neutral-400 overflow-x-auto">
                        {JSON.stringify(output, null, 2)}
                    </pre>
                )}
            </div>
        </div>
    );
}
