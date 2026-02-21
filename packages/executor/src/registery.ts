import { PassThroughExecutor } from "./passthrough.executor.js";
import { TextNodeExecutor } from "./text.executor.js";
import { ImageGenerationExecutor } from "./imageGeneration.executor.js";
import { ImageNodeExecutor } from "./image.executor.js";
import { AssistantExecutor } from "./assistant.executor.js";
import { UpscaleExecutor } from "./upscale.executor.js";

export const EXECUTOR_REGISTRY = {
    TEXT_NODE: TextNodeExecutor,
    PASS_THROUGH_NODE: PassThroughExecutor,
    IMAGE_GENERATION_NODE: ImageGenerationExecutor,
    IMAGE_NODE: ImageNodeExecutor,
    ASSISTANT_NODE: AssistantExecutor,
    IMAGE_PROCESSING_NODE: UpscaleExecutor,
    UPSCALE_NODE: UpscaleExecutor, // Allow both keys
};
