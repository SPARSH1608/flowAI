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
            <textarea
                className="w-full h-32 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-neutral-200 text-xs focus:outline-none focus:border-neutral-700 resize-none font-mono leading-relaxed"
                placeholder="Enter text..."
                defaultValue={data.config?.text}
                onBlur={(e) => handleChange(e.target.value)}
            />
        </BaseNode>
    );
}
