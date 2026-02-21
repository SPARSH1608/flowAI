

import { buildImageGenGraph } from "../../../apps/api/src/ai/imageGen/graph.js";
import { generateImagesFal } from "../../../apps/api/src/ai/fal/image.js";
import { NodeExecutor } from "./types.js";

export const ImageGenerationExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        console.log(`[ImageGenerationExecutor] Starting execution for node ${nodeId}`);
        console.log(`[ImageGenerationExecutor] RAW CONFIG:`, JSON.stringify(config, null, 2));
        console.log(`[ImageGenerationExecutor] RAW INPUTS:`, JSON.stringify(inputs, null, 2));

        const userText = inputs.text;
        const inlinePrompt = config.prompt || config.userPrompt;

        const rawImages = inputs["image[]"] || inputs["image"];
        const normalizedImages = Array.isArray(rawImages)
            ? rawImages
            : rawImages
                ? [rawImages]
                : [];

        const referenceImages = normalizedImages.map((img: any) => {
            if (typeof img === 'string') return { id: img, url: img };
            return {
                id: img.id || img.url,
                url: img.url,
                purpose: img.purpose,
            };
        });

        console.log("[ImageGenerationExecutor] Inputs:", {
            hasUserText: !!userText,
            hasInlinePrompt: !!inlinePrompt,
            referenceImageCount: referenceImages.length,
        });

        let finalState: any;

        if (config.debugInfoOverride) {
            console.log("[ImageGenerationExecutor] Using OVERRIDDEN debug info");
            finalState = config.debugInfoOverride;
        } else {
            const compilerGraph = buildImageGenGraph();
            finalState = await compilerGraph.invoke({
                userText,
                inlinePrompt,
                referenceImages,
            });
        }

        if (!finalState.finalPrompt) {
            throw new Error("Prompt compilation failed - no final prompt generated");
        }

        console.log("[ImageGenerationExecutor] Compiled prompt:", {
            intent: finalState.intent,
            visualPlan: finalState.visualPlan,
            constraintCount: finalState.constraints?.length,
            promptLength: finalState.finalPrompt.length,
        });

        let model = config.model || "fal-ai/flux-realism";
        if (model === "custom" && config.customModel) {
            model = config.customModel;
        }

        const width = config.size?.width || 1024;
        const height = config.size?.height || 768;
        const numImages = 1;

        const imageUrls = await generateImagesFal({
            model,
            prompt: finalState.finalPrompt,
            imageUrls: referenceImages.map((r) => r.url),
            numImages,
            strength: config.strength,
            adType: finalState.intent?.adType,
            width,
            height,
        });

        const output = {
            [nodeId]: {
                "image[]": imageUrls.map((url) => ({
                    url,
                    source: "generated",
                })),
                debugInfo: {
                    receivedInputs: inputs,
                    usedConfig: config,
                    intent: finalState.intent,
                    visualPlan: finalState.visualPlan,
                    finalPrompt: finalState.finalPrompt
                }
            },
        };

        console.log(`[ImageGenerationExecutor] Generated ${imageUrls.length} images`);

        return {
            nodeOutputs: output,
            errors: [],
        };
    },
};

