import { SerializedWorkflow } from "@/types/serializedWorkflow";

export const podcastTemplate: SerializedWorkflow = {
    version: "v1",
    metadata: {
        name: "Podcast Portrait",
        description: "High-authority podcast portrait workflow",
        createdAt: Date.now(),
        updatedAt: Date.now(),
    },
    canvas: {
        nodes: [
            {
                id: "img1",
                type: "IMAGE_NODE",
                position: { x: 100, y: 200 },
                data: { label: "Image", config: {} },
            },
            {
                id: "assist1",
                type: "ASSISTANT_NODE",
                position: { x: 350, y: 200 },
                data: { label: "Assistant", config: {} },
            },
            {
                id: "gen1",
                type: "IMAGE_GENERATION_NODE",
                position: { x: 600, y: 200 },
                data: { label: "Generate", config: {} },
            },
            // {
            //   id: "export1",
            //   type: "EXPORT_NODE",
            //   position: { x: 850, y: 200 },
            //   data: { label: "Export", config: {} },
            // },
        ],
        edges: [
            {
                id: "e1",
                source: "img1",
                sourceHandle: "out:image",
                target: "assist1",
                targetHandle: "in:image[]",
            },
            {
                id: "e2",
                source: "assist1",
                sourceHandle: "out:text",
                target: "gen1",
                targetHandle: "in:text",
            },
            // {
            //   id: "e3",
            //   source: "gen1",
            //   sourceHandle: "out:image[]",
            //   target: "export1",
            //   targetHandle: "in:image[]",
            // },
        ],
    },
};
