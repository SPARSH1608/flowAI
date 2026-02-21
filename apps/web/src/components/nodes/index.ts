import TextNode from "./TextNode";
import ImageNode from "./ImageNode";
import ImageGenerationNode from "./ImageGenerationNode";
import AssistantNode from "./AssistantNode";
import UpscaleNode from "./UpscaleNode";

export const nodeTypes = {
    TEXT_NODE: TextNode,
    IMAGE_NODE: ImageNode,
    IMAGE_GENERATION_NODE: ImageGenerationNode,
    ASSISTANT_NODE: AssistantNode,
    IMAGE_PROCESSING_NODE: UpscaleNode,
    UPSCALE_NODE: UpscaleNode,
};
