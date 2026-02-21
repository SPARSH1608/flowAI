"use client";

import { NodeStatus } from "@/types/nodeStatus";

const STATUS_COLORS: Record<NodeStatus, string> = {
    idle: "bg-neutral-600",
    configured: "bg-emerald-500",
    error: "bg-red-500",
    disabled: "bg-neutral-700",
    executing: "bg-blue-500 animate-pulse ring-2 ring-blue-500/50",
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
