"use client";

import { addNode } from "../canvas/CanvasContextMenu";
import { NodeType } from "@/types/workflow";

const NODE_TYPES: NodeType[] = [
    "TEXT_NODE",
    "IMAGE_NODE",
    "IMAGE_GENERATION_NODE",
    "ASSISTANT_NODE",
    "BATCH_VARIATION_NODE",
    "IMAGE_PROCESSING_NODE",
    "EXPORT_NODE",
];

export default function NodeSidebar() {
    return (
        <div className="w-64 h-full bg-neutral-900 border-r border-neutral-800 p-4 space-y-2">
            <h2 className="text-sm font-semibold text-neutral-400">
                Nodes
            </h2>

            {NODE_TYPES.map((type) => (
                <button
                    key={type}
                    className="w-full text-left px-3 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-sm"
                    onClick={() =>
                        addNode(type, { x: 200, y: 200 })
                    }
                >
                    {type}
                </button>
            ))}
        </div>
    );
}
