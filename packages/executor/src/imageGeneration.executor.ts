

import { buildImageGenGraph } from "../../../apps/api/src/ai/imageGen/graph.js";
import { generateImagesFal } from "../../../apps/api/src/ai/fal/image.js";
import { NodeExecutor } from "./types.js";
import { loggerContext } from "../../../apps/api/src/utils/logger.js";

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
            const parentContext = loggerContext.getStore();

            // Re-wrap the LangGraph invocation to ensure AsyncLocalStorage context isn't lost
            const invokeGraph = () => compilerGraph.invoke({
                userText,
                inlinePrompt,
                referenceImages,
            });

            if (parentContext) {
                finalState = await loggerContext.run(parentContext, invokeGraph);
            } else {
                finalState = await invokeGraph();
            }
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

        console.log("[SSE:generation_start]", JSON.stringify({ model, width, height, numImages, hasReferenceImages: referenceImages.length > 0 }));

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

        console.log("[SSE:generation_complete]", JSON.stringify({ imageCount: imageUrls.length }));

        const output = {
            [nodeId]: {
                "image[]": imageUrls.map((url) => ({
                    url,
                    source: "generated",
                })),
                debugInfo: {
                    receivedInputs: inputs,
                    usedConfig: {
                        model: config.model,
                        prompt: config.prompt,
                        width: config.width || config.size?.width,
                        height: config.height || config.size?.height,
                        strength: config.strength,
                        customModel: config.customModel,
                    },
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

