"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";

export default function TextNode({ data, selected }: NodeProps) {
    return (
        <BaseNode title="Text" status={data.status} selected={selected} id={data.id}>
            <ExternalPort
                direction="out"
                type="text"
                position={Position.Right}
            />
            <textarea
                className="w-full h-32 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-xs focus:outline-none focus:border-neutral-700 resize-none font-mono leading-relaxed"
                placeholder="Enter text..."
                defaultValue={data.config?.text}
                onBlur={(e) => {
                    data.config = { ...data.config, text: e.target.value };
                }}
            />
        </BaseNode>
    );
}
