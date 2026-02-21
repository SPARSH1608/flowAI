"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";

import { useWorkflowStore } from "@/store/workflowStore";
import { WorkflowNode } from "@/types/workflow";

export default function TextNode({ data, selected, id }: NodeProps) {
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
                    {data.config?.text ? `"${data.config.text}"` : "Empty text block"}
                </span>
            </div>
        </BaseNode>
    );
}
