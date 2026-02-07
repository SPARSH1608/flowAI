/**
 * Image Generation Executor
 * 
 * Integrates the internal LangGraph compiler pipeline with fal.ai rendering.
 * 
 * Flow:
 * 1. Collect raw inputs
 * 2. Run internal compiler (LangGraph)
 * 3. Extract finalPrompt
 * 4. Call fal.ai renderer
 * 5. Store results
 */

import { buildImageGenGraph } from "../../../apps/api/src/ai/imageGen/graph.js";
import { generateImagesFal } from "../../../apps/api/src/ai/fal/image.js";
import { NodeExecutor } from "./types.js";

export const ImageGenerationExecutor: NodeExecutor = {
    async execute(nodeId, config, inputs, state) {
        console.log(`[ImageGenerationExecutor] Starting execution for node ${nodeId}`);

        // 1️⃣ Collect raw inputs
        const userText = inputs.text;
        const inlinePrompt = config.prompt || config.userPrompt;

        const referenceImages =
            inputs["image[]"]?.map((img: any) => ({
                id: img.id || img.url,
                url: img.url,
                purpose: img.purpose,
            })) ?? [];

        console.log("[ImageGenerationExecutor] Inputs:", {
            hasUserText: !!userText,
            hasInlinePrompt: !!inlinePrompt,
            referenceImageCount: referenceImages.length,
        });

        // 2️⃣ Run INTERNAL LangGraph (compiler)
        const compilerGraph = buildImageGenGraph();

        const finalState = await compilerGraph.invoke({
            userText,
            inlinePrompt,
            referenceImages,
        });

        if (!finalState.finalPrompt) {
            throw new Error("Prompt compilation failed - no final prompt generated");
        }

        console.log("[ImageGenerationExecutor] Compiled prompt:", {
            intent: finalState.intent,
            visualPlan: finalState.visualPlan,
            constraintCount: finalState.constraints?.length,
            promptLength: finalState.finalPrompt.length,
        });

        // 3️⃣ Call fal.ai (renderer)
        const model = config.model || "fal-ai/flux-realism";
        const numImages = 1; // Forced to 1 to save costs as requested

        const imageUrls = await generateImagesFal({
            model,
            prompt: finalState.finalPrompt,
            imageUrls: referenceImages.map((r) => r.url),
            numImages,
        });

        // 4️⃣ Return results
        const output = {
            [nodeId]: {
                "image[]": imageUrls.map((url) => ({
                    url,
                    source: "generated",
                })),
            },
        };

        console.log(`[ImageGenerationExecutor] Generated ${imageUrls.length} images`);

        return {
            nodeOutputs: output,
            errors: [],
        };
    },
};

