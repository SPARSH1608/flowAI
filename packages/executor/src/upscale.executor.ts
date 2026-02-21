import { NodeExecutor } from "./types.js";
import { fal } from "../../../apps/api/src/lib/fal.js";
import { uploadToFal } from "../../../apps/api/src/ai/fal/storage.js";

export const UpscaleExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        console.log(`[UpscaleExecutor] Executing node ${nodeId}`);

        const rawInput = inputs.image || inputs["image[]"];
        if (!rawInput) {
            console.warn(`[UpscaleExecutor] Node ${nodeId} has no image input. Inputs:`, JSON.stringify(inputs));
            throw new Error("No image provided for upscaling. Please ensure an image node is connected.");
        }

        const imageItem = Array.isArray(rawInput) ? rawInput[0] : rawInput;
        const imageUrl = typeof imageItem === 'string' ? imageItem : (imageItem.url || imageItem.image || imageItem.imageUrl);

        if (!imageUrl) {
            throw new Error("Invalid image input format. Could not find image URL.");
        }
        const model = config.model || "fal-ai/ccsr";

        console.log(`[UpscaleExecutor] Upscaling image ${imageUrl} using ${model}`);

        try {
            // Ensure image is uploaded to Fal if it's local
            const uploadedUrl = await uploadToFal(imageUrl);

            const result: any = await fal.subscribe(model, {
                input: {
                    image_url: uploadedUrl,
                    upscale_factor: config.factor || 2,
                },
            });

            // Extract image URL from result - handling multiple possible response shapes from Fal
            const outputUrl = result.image?.url ||
                result.url ||
                result.data?.image?.url ||
                (typeof result.image === 'string' ? result.image : null) ||
                (Array.isArray(result.images) ? (result.images[0]?.url || result.images[0]) : null);

            if (!outputUrl) {
                console.error("[UpscaleExecutor] Could not extract URL from result:", JSON.stringify(result));
                throw new Error("Upscale failed - no output image URL found in response");
            }

            return {
                nodeOutputs: {
                    [nodeId]: {
                        image: outputUrl,
                        "image[]": [outputUrl]
                    }
                },
                errors: []
            };
        } catch (error: any) {
            console.error("[UpscaleExecutor] Upscale failed:", error);
            throw error;
        }
    }
};
