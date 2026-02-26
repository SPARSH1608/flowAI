"use client";

import { Handle, Position } from "@xyflow/react";
import { PortDataType } from "@/types/ports";

interface TypedPortProps {
    direction: "in" | "out";
    type: PortDataType;
    position: Position;
}

export default function TypedPort({
    direction,
    type,
    position,
}: TypedPortProps) {
    const id = `${direction}:${type}`;

    return (
        <div className="relative group">
            <Handle
                id={id}
                type={direction === "in" ? "target" : "source"}
                position={position}
                className="
          w-2 h-2
          bg-neutral-400
          border border-neutral-700
          opacity-0
          group-hover:opacity-100
          transition-opacity
        "
            />

            {}
            <span
                className="
          absolute
          top-1/2 -translate-y-1/2
          text-[10px]
          text-neutral-400
          opacity-0
          group-hover:opacity-100
          whitespace-nowrap
        "
                style={{
                    left: direction === "in" ? "-48px" : "12px",
                }}
            >
                {type}
            </span>
        </div>
    );
}
