
import type { ImageGenState } from "./state";
import { callLLM } from "../llm";

export async function intentNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    const text = [state.userText, state.inlinePrompt]
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
- Extract what the user wants, not how to create it`,
            user: `Input:
${text}

Return JSON with these fields:
- subject: what/who is being photographed
- scenario: the context or setting
- mood: emotional tone or feeling
- brandTone: professional style (e.g., premium, casual, corporate)
- audience: target viewer (optional)`,
        });

        return { intent };
    } catch (error) {
        console.error("Intent extraction failed:", error);
        return {
            intent: {
                subject: "person portrait",
                scenario: text.substring(0, 100),
                mood: "professional",
                brandTone: "premium",
            },
        };
    }
}
