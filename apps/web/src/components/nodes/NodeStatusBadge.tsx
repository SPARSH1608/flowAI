"use client";

import { NodeStatus } from "@/types/nodeStatus";

const STATUS_COLORS: Record<NodeStatus, string> = {
    idle: "bg-white/20 border border-white/10",
    configured: "bg-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
    completed: "bg-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.4)]",
    error: "bg-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(248,113,113,0.4)]",
    disabled: "bg-neutral-800 border border-neutral-700",
    executing: "bg-indigo-400 border border-indigo-500/50 animate-pulse shadow-[0_0_15px_rgba(129,140,248,0.6)]",
    running: "bg-indigo-400 border border-indigo-500/50 animate-pulse shadow-[0_0_15px_rgba(129,140,248,0.6)]",
};

export default function NodeStatusBadge({
    status = "idle",
}: {
    status?: NodeStatus;
}) {
    return (
        <span
            className={`
        inline-block
        w-2 h-2
        rounded-full
        ${STATUS_COLORS[status]}
      `}
        />
    );
}
