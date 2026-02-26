"use client";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
    type Connection,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    type NodeChange,
    type EdgeChange,
    useReactFlow,
    type Viewport,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/store/workflowStore";
import { addNode } from "./CanvasContextMenu";

import { nodeTypes } from "@/components/nodes";
import DeletableEdge from "@/components/edges/DeletableEdge";
import { PORT_CONNECTIONS } from "@/types/ports";
import { useEffect, useState } from "react";

const VIEWPORT_STORAGE_KEY = "workflow-viewport";

const edgeTypes = {
    default: DeletableEdge,
};

const TYPE_COLORS: Record<string, string> = {
    text: "#52796F", 
    image: "#5C7C99", 
    "image[]": "#5C7C99",
    prompt: "#666666", 
    video: "#7B6496", 
    audio: "#966478", 
};

function isValidConnection(connection: any) {
    if (!connection.sourceHandle || !connection.targetHandle)
        return false;

    const [, sourceType] = connection.sourceHandle.split(":");
    const [, targetType] = connection.targetHandle.split(":");

    return PORT_CONNECTIONS[sourceType as keyof typeof PORT_CONNECTIONS]?.includes(targetType as any);
}

export default function WorkflowCanvas() {
    const { nodes, edges, setNodes, setEdges, deleteNode, deleteEdge, deleteMode, toggleDeleteMode, setSelectedNodeId } = useWorkflowStore();
    const { fitView, setViewport } = useReactFlow();
    const [isInitialized, setIsInitialized] = useState(false);
    const onNodesChange = (changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds as Node[]) as any);
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds as Edge[]) as any);
    };

    const onConnect = (connection: Connection) => {
        const [, sourceType] = (connection.sourceHandle || "").split(":");
        const color = TYPE_COLORS[sourceType as string] || "#555555";

        const edge = {
            ...connection,
            style: { stroke: color, strokeWidth: 2, opacity: 0.8 },
        };

        setEdges(addEdge(edge, edges as Edge[]) as any);
    };

    useEffect(() => {
        const savedViewport = localStorage.getItem(VIEWPORT_STORAGE_KEY);
        if (savedViewport) {
            try {
                const viewport = JSON.parse(savedViewport) as Viewport;
                
                requestAnimationFrame(() => {
                    setViewport(viewport, { duration: 0 });
                });
            } catch (e) {
                console.error("Failed to restore viewport:", e);
            }
        }
        setIsInitialized(true);
    }, [setViewport]);

    useEffect(() => {
        if (isInitialized && nodes.length > 0) {
            const savedViewport = localStorage.getItem(VIEWPORT_STORAGE_KEY);
            if (!savedViewport) {
                setTimeout(() => {
                    fitView({ padding: 0.2 });
                }, 50);
            }
        }
    }, [nodes.length, fitView, isInitialized]);

    const onMove = (_event: any, viewport: Viewport) => {
        localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewport));
    };
    const onDrop = (event: React.DragEvent) => {
        event.preventDefault();

        const data = event.dataTransfer.getData("application/xyflow");
        if (!data) return;

        try {
            const { type, imageData } = JSON.parse(data);
            if (type === "IMAGE_NODE" && imageData) {
                const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
                const position = {
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                };

                const newNode = {
                    id: `${type.toLowerCase()}-${Date.now()}`,
                    type,
                    position,
                    data: {
                        label: "Image",
                        config: imageData,
                    },
                };

                setNodes([...nodes, newNode as any]);
            }
        } catch (err) {
            console.error("Failed to parse drop data:", err);
        }
    };

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    return (
        <div
            className={`w-full h-full bg-[#FAFAFA] ${deleteMode ? 'delete-mode-active' : ''}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
            <ReactFlow
                nodes={nodes as Node[]}
                edges={edges as Edge[]}
                nodeTypes={nodeTypes as any}
                edgeTypes={edgeTypes as any}
                isValidConnection={isValidConnection}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onMove={onMove}
                onNodeClick={(_, node) => {
                    if (deleteMode) {
                        deleteNode(node.id);
                        toggleDeleteMode();
                    } else {
                        setSelectedNodeId(node.id);
                    }
                }}
                onPaneClick={() => setSelectedNodeId(null)}
                onEdgeClick={(_, edge) => {
                    if (deleteMode) {
                        deleteEdge(edge.id);
                        toggleDeleteMode();
                    }
                }}
                onConnect={onConnect}
            >
                <Background
                    gap={24}
                    size={1.5}
                    color="#A3A3A3"
                    style={{ opacity: 0.2 }}
                    variant={"dots" as any}
                />

                <Controls className="react-flow__controls-custom" />


            </ReactFlow>
        </div>
    );
}
