"use client";

import { type NodeProps, Position } from "@xyflow/react";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";

import { useWorkflowStore } from "@/store/workflowStore";
import { WorkflowNode } from "@/types/workflow";

export default function TextNode({ data, selected, id }: NodeProps) {
    const nodeData = data as any;
    const setNodes = useWorkflowStore((s) => s.setNodes);

    const handleChange = (text: string) => {
        setNodes((nodes: WorkflowNode[]) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...node.data.config,
                                text,
                            },
                        },
                    };
                }
                return node;
            })
        );
    };

    return (
        <BaseNode title="Text" status={data.status} selected={selected} id={id}>
            <ExternalPort
                direction="out"
                type="text"
                position={Position.Right}
            />
            <div className="px-3 py-1 bg-[#161618] rounded-lg border border-white/5 mx-1 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-medium truncate max-w-[200px]">
                    {nodeData.config?.text ? `"${nodeData.config.text}"` : "Empty text block"}
                </span>
            </div>
        </BaseNode>
    );
}
