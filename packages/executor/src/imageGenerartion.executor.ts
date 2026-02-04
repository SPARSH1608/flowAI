import { generateImages } from "./adapters/imageProvider.js";
import { NodeExecutor } from "./types.js";

export const ImageGenerationExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        const prompt = inputs.text ?? config.prompt;
        const references = inputs["image[]"] ?? [];

        if (!prompt) {
            throw new Error("Image generation requires a prompt");
        }

        // 👇 Call real image API here
        const images = await generateImages({
            prompt,
            references,
            config,
        });

        const output = {
            [nodeId]: {
                "image[]": images,
            },
        };

        console.log(`[ImageGenerationExecutor] Node ${nodeId} output:`, output);

        return {
            nodeOutputs: output,
            errors: [],
        };
    },
};
