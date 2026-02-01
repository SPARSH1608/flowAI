"use client";

import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    NodeChange,
    EdgeChange,
} from "reactflow";
import { useWorkflowStore } from "@/store/workflowStore";
import { addNode } from "./CanvasContextMenu";

import { nodeTypes } from "@/components/nodes";
import DeletableEdge from "@/components/edges/DeletableEdge";
import { PORT_CONNECTIONS } from "@/types/ports";

const edgeTypes = {
    default: DeletableEdge,
};

const TYPE_COLORS: Record<string, string> = {
    text: "#52796F", // Muted Green
    image: "#5C7C99", // Muted Blue
    "image[]": "#5C7C99",
    prompt: "#666666", // Dark Gray
    video: "#7B6496", // Muted Purple
    audio: "#966478", // Muted Rose
};

function isValidConnection(connection: any) {
    if (!connection.sourceHandle || !connection.targetHandle)
        return false;

    const [, sourceType] = connection.sourceHandle.split(":");
    const [, targetType] = connection.targetHandle.split(":");

    return PORT_CONNECTIONS[sourceType as keyof typeof PORT_CONNECTIONS]?.includes(targetType as any);
}

export default function WorkflowCanvas() {
    const { nodes, edges, setNodes, setEdges, deleteNode, deleteEdge, deleteMode, toggleDeleteMode } = useWorkflowStore();

    const onNodesChange = (changes: NodeChange[]) => {
        setNodes(applyNodeChanges(changes, nodes as Node[]) as any);
    };

    const onEdgesChange = (changes: EdgeChange[]) => {
        setEdges(applyEdgeChanges(changes, edges as Edge[]) as any);
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

    return (
        <div
            className={`w-full h-full ${deleteMode ? 'delete-mode-active' : ''}`}
        >
            <ReactFlow
                nodes={nodes as Node[]}
                edges={edges as Edge[]}
                nodeTypes={nodeTypes as any}
                edgeTypes={edgeTypes as any}
                isValidConnection={isValidConnection}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    if (deleteMode) {
                        deleteNode(node.id);
                        toggleDeleteMode();
                    }
                }}
                onEdgeClick={(_, edge) => {
                    if (deleteMode) {
                        deleteEdge(edge.id);
                        toggleDeleteMode();
                    }
                }}
                onConnect={onConnect}
                fitView
                onPaneContextMenu={(e) => {
                    e.preventDefault();

                    const position = {
                        x: e.clientX,
                        y: e.clientY,
                    };

                    addNode("TEXT_NODE", position);
                }}
            >
                {/* Grid background */}
                <Background
                    gap={24}
                    size={1}
                    color="#222"
                />

                {/* Zoom & fit controls */}
                <Controls />


            </ReactFlow>
        </div>
    );
}
