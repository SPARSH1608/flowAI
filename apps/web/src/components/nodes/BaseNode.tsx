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
}

export default function BaseNode({
    id,
    title,
    children,
    status,
    selected,
}: BaseNodeProps) {
    const deleteNode = useWorkflowStore((s) => s.deleteNode);

    return (
        <>
            {/* Resizer Handle (only when selected) */}
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
                {/* Header - Outside/Top (Abstract Look) */}
                <div className="absolute -top-8 left-0 flex items-center gap-2 px-1">
                    <div className="flex items-center gap-2 text-neutral-400">
                        <Edit2 size={12} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-300">
                            {title}
                        </span>
                    </div>
                    <NodeStatusBadge status={status} />
                </div>

                {/* Content Box */}
                <div className="p-4 space-y-3 h-full flex flex-col">
                    {children}
                </div>
            </div>

            {/* Selected Toolbar (Below Node) */}
            {selected && (
                <div className="nodrag absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-[#1F1F1F] rounded-lg border border-neutral-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <ToolbarButton icon={<Play size={14} fill="currentColor" />} onClick={() => { }} />
                    <div className="w-px h-4 bg-neutral-700 mx-1" />
                    <ToolbarButton icon={<MousePointer2 size={14} />} onClick={() => { }} />
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
