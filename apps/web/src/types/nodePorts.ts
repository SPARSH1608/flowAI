import { PortDataType } from "./ports";

export const NODE_PORTS: Record<
    string,
    {
        inputs?: PortDataType[];
        outputs?: PortDataType[];
    }
> = {
    TEXT_NODE: {
        outputs: ["text"],
    },
    IMAGE_NODE: {
        outputs: ["image"],
    },
    IMAGE_GENERATION_NODE: {
        inputs: ["text", "image[]"],
        outputs: ["image[]"],
    },
    ASSISTANT_NODE: {
        inputs: ["text", "image[]"],
        outputs: ["text"],
    },
    BATCH_VARIATION_NODE: {
        inputs: ["text", "image"],
        outputs: ["image[]"],
    },
    IMAGE_PROCESSING_NODE: {
        inputs: ["image"],
        outputs: ["image"],
    },
    EXPORT_NODE: {
        inputs: ["image[]"],
    },
    VIDEO_GENERATION_NODE: {
        inputs: ["text", "image", "image"],
        outputs: ["video"],
    },
};
