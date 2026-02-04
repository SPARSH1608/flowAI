"use client";

import { NodeProps, Position } from "reactflow";
import BaseNode from "./BaseNode";
import ExternalPort from "../ports/ExternalPort";
import { useWorkflowStore } from "@/store/workflowStore";
import { uploadImage } from "@/utils/images";
import { Upload, Loader2 } from "lucide-react";
import { WorkflowNode } from "@/types/workflow";

export default function ImageNode({ data, id, selected }: NodeProps) {
    const setNodes = useWorkflowStore((s) => s.setNodes);
    const { config } = data;

    async function handleFile(file: File) {
        setNodes((nodes: WorkflowNode[]) =>
            nodes.map((n: WorkflowNode) =>
                n.id === id
                    ? {
                        ...n,
                        data: {
                            ...n.data,
                            config: {
                                ...config,
                                uploading: true,
                                error: undefined,
                            },
                        },
                    }
                    : n
            )
        );

        try {
            const result = await uploadImage(
                file,
                config.purpose ?? "identity"
            );

            setNodes((nodes: WorkflowNode[]) =>
                nodes.map((n: WorkflowNode) =>
                    n.id === id
                        ? {
                            ...n,
                            data: {
                                ...n.data,
                                config: {
                                    imageId: result.id,
                                    url: result.url,
                                    purpose: config.purpose ?? "identity",
                                    uploading: false,
                                },
                            },
                        }
                        : n
                )
            );
        } catch (err) {
            setNodes((nodes: WorkflowNode[]) =>
                nodes.map((n) =>
                    n.id === id
                        ? {
                            ...n,
                            data: {
                                ...n.data,
                                config: {
                                    ...config,
                                    uploading: false,
                                    error: "Upload failed",
                                },
                            },
                        }
                        : n
                )
            );
        }
    }

    return (
        <BaseNode title="Image" status={data.status} selected={selected} id={id} hideDefaultResult>
            {/* Output Port */}
            <ExternalPort
                direction="out"
                type="image"
                position={Position.Right}
            />

            {/* Image Preview or Placeholder */}
            {config.url ? (
                <img
                    src={`http://localhost:3002${config.url}`}
                    alt="Uploaded"
                    className="w-full h-32 object-cover rounded-md border border-neutral-700"
                />
            ) : (
                <div className="h-32 bg-neutral-800 border border-neutral-700 rounded-md flex items-center justify-center text-xs text-neutral-400">
                    {config.uploading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Uploading...</span>
                        </div>
                    ) : (
                        <span>No image</span>
                    )}
                </div>
            )}

            {/* Error Message */}
            {config.error && (
                <div className="text-xs text-red-400 mt-1">
                    {config.error}
                </div>
            )}

            {/* Upload Button */}
            <label className="mt-2 flex items-center gap-2 text-xs cursor-pointer text-blue-400 hover:text-blue-300 transition-colors">
                <Upload size={14} />
                <span>{config.url ? "Replace image" : "Upload image"}</span>
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </label>
        </BaseNode>
    );
}
