"use client";

import { Handle, Position } from "reactflow";

interface PortProps {
    id: string;
    type: "source" | "target";
    position: Position;
}

export default function Port({ id, type, position }: PortProps) {
    return (
        <Handle
            id={id}
            type={type}
            position={position}
            className="
        opacity-0 group-hover:opacity-100
        transition-opacity
        w-2 h-2
        bg-neutral-400
        border border-neutral-700
      "
        />
    );
}
