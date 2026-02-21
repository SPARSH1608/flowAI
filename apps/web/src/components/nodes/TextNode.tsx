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
            <div className="px-1">
                <textarea
                    className="nodrag w-full h-32 bg-transparent text-neutral-300 text-[13px] leading-relaxed focus:outline-none resize-none font-sans placeholder:text-neutral-600 custom-scrollbar"
                    placeholder="Type starting prompt..."
                    defaultValue={data.config?.text}
                    onBlur={(e) => handleChange(e.target.value)}
                />
            </div>
        </BaseNode>
    );
}
