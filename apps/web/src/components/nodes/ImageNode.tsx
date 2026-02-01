"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";

export default function ImageNode({ data, selected }: NodeProps) {
    return (
        <BaseNode title="Image" status={data.status} selected={selected} id={data.id}>
            {/* Output Port */}
            <ExternalPort
                direction="out"
                type="image"
                position={Position.Right}
            />

            <div className="
        h-24
        bg-neutral-800
        border border-neutral-700
        rounded
        flex items-center justify-center
        text-xs text-neutral-400
      ">
                Upload / URL
            </div>
        </BaseNode>
    );
}
