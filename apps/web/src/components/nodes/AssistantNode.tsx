"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import TypedPort from "../ports/TypedPort";
import ExternalPort from "../ports/ExternalPort";

export default function AssistantNode({ data, selected }: NodeProps) {
    const config = data.config;

    return (
        <BaseNode title="Assistant" status={data.status} selected={selected} id={data.id}>
            <ExternalPort direction="in" type="text" position={Position.Left} style={{ top: "30%" }} />
            <ExternalPort direction="in" type="image[]" position={Position.Left} style={{ top: "70%" }} />
            <ExternalPort direction="out" type="text" position={Position.Right} />

            <textarea
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-xs"
                placeholder="Assistant instructions…"
                value={config.instructions || ""}
                onChange={(e) => {
                    config.instructions = e.target.value;
                    data.status = "configured";
                }}
            />
        </BaseNode>
    );
}
