import type { ImageGenState } from "./state";
import { callLLM } from "../llm";
import { describeImage } from "../vision";

export async function intentNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    let visualDescription = "";

    if (state.referenceImages && state.referenceImages.length > 0 && state.referenceImages[0]?.url) {
        visualDescription = await describeImage(state.referenceImages[0].url);
    }

    const text = [
        state.userText,
        state.inlinePrompt,
        visualDescription ? `Reference Image Description: ${visualDescription}` : ""
    ]
        .filter(Boolean)
        .join("\n");

    if (!text.trim()) {
        return {
            intent: {
                subject: "person portrait",
                scenario: "professional portrait",
                mood: "neutral professional",
                brandTone: "premium",
            },
        };
    }

    try {
        const intent = await callLLM<{
            subject: string;
            scenario?: string;
            mood?: string;
            brandTone?: string;
            artStyle?: string;
            lighting?: string;
            composition?: string;
            audience?: string;
        }>({
            model: "fal-ai/any-llm",
            system: `You are a senior creative director.
Extract intent from the input.

Rules:
- Do NOT write a prompt
- Do NOT add creativity
- Return ONLY valid JSON
- Be specific and concrete
- Extract what the user wants, not how to create it
- If the user asks for an "Ad" or "Advertisement", ensure the scenario describes a commercial product shot or lifestyle ad setting.
- If the user provides an image or mentions "him/her/them", explicitly refer to "The person in the provided reference image" in the subject.`,
            user: `Input:
${text}

Return JSON with these fields:
- subject: what/who is being photographed
- scenario: the context or setting
- mood: emotional tone or feeling
- brandTone: professional style (e.g., premium, casual, corporate)
- artStyle: visual style (e.g., photorealistic, cinematic, 3d render, minimal)
- lighting: lighting description (e.g., soft studio lighting, golden hour, neon)
- composition: camera angle or framing (e.g., wide angle, macro, bokeh)
- audience: target viewer (optional)`,
        });

        return { intent };
    } catch (error) {
        console.error("Intent extraction failed:", error);
        return {
            intent: {
                subject: text,
                scenario: "artistic composition",
                mood: "dynamic",
                brandTone: "professional",
            },
        };
    }
}
