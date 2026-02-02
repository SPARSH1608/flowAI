import { TextNodeExecutor } from "./text.executor.js";

export const EXECUTOR_REGISTRY: Record<string, any> = {
    TEXT_NODE: TextNodeExecutor,
    // IMAGE_NODE next
    // ASSISTANT_NODE next
};
