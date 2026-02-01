"use client";

import { useWorkflowStore } from "@/store/workflowStore";
import { NodeType } from "@/types/workflow";
import { nanoid } from "nanoid";

export function addNode(
    type: NodeType,
    position: { x: number; y: number }
) {
    useWorkflowStore.getState().addNode({
        id: nanoid(),
        type,
        position,
        data: {
            label: type,
            config: {},
        },
    });
}
