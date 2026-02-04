import { PassThroughExecutor } from "./passthrough.executor.js";
import { TextNodeExecutor } from "./text.executor.js";
import { ImageGenerationExecutor } from "./imageGenerartion.executor.js";
import { ImageNodeExecutor } from "./image.executor.js";

export const EXECUTOR_REGISTRY = {
    TEXT_NODE: TextNodeExecutor,
    PASS_THROUGH_NODE: PassThroughExecutor,
    IMAGE_GENERATION_NODE: ImageGenerationExecutor,
    IMAGE_NODE: ImageNodeExecutor,
};
