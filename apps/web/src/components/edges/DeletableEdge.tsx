"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { X } from "lucide-react";
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
} from "reactflow";

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected,
}: EdgeProps) {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const deleteEdge = useWorkflowStore((s) => s.deleteEdge);

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    strokeWidth: 3,
                    ...style,
                }}
            />
            {selected && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: "absolute",
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: "all",
                        }}
                        className="nodrag nopan"
                    >
                        <button
                            className="
                flex items-center justify-center
                w-5 h-5
                bg-red-500 hover:bg-red-600
                rounded-full
                text-white
                shadow-md
                border border-red-400
                transition-transform hover:scale-110
              "
                            onClick={() => deleteEdge(id)}
                        >
                            <X size={10} />
                        </button>
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    );
}
