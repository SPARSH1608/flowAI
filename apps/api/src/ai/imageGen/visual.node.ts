

import type { ImageGenState } from "./state";
import { callLLM } from "../llm";

export async function visualNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    if (!state.intent) {
        return {};
    }

    try {
        const visualPlan = await callLLM<{
            camera: string;
            framing: string;
            lighting: string;
            environment: string;
            realismLevel: "strict" | "balanced";
        }>({
            model: "fal-ai/any-llm",
            system: `You are a professional commercial photographer.

Rules:
- Translate intent into concrete visual decisions
- Be specific and technical
- No adjectives without meaning
- Use photography terminology
- Return ONLY JSON`,
            user: `Intent:
${JSON.stringify(state.intent, null, 2)}

Return JSON with these fields:
- camera: camera angle/position (e.g., "eye-level", "slightly above", "low angle")
- framing: shot composition (e.g., "medium close-up", "full body", "headshot")
- lighting: specific lighting setup (e.g., "soft 45° key light with blue rim", "natural window light")
- environment: background/setting description
- realismLevel: either "strict" for photorealistic or "balanced" for stylized`,
        });

        console.log("[SSE:visual_plan]", JSON.stringify(visualPlan));
        return { visualPlan };
    } catch (error) {
        console.error("Visual planning failed:", error);
        return {
            visualPlan: {
                camera: "eye-level",
                framing: "medium close-up",
                lighting: "soft natural lighting with subtle fill",
                environment: state.intent.scenario || "clean studio background",
                realismLevel: "strict",
            },
        };
    }
}
