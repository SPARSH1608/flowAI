
import type { ImageGenState } from "./state";

export async function compilerNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    if (!state.intent || !state.visualPlan) {
        throw new Error("Missing intent or visual plan - cannot compile prompt");
    }

    const parts: string[] = [];

    parts.push(state.intent.subject);
    if (state.intent.scenario) parts.push(state.intent.scenario);

    if (state.intent.artStyle) parts.push(state.intent.artStyle);
    if (state.intent.mood) parts.push(`${state.intent.mood} atmosphere`);
    if (state.intent.lighting) parts.push(state.intent.lighting);

    parts.push(state.visualPlan.camera);
    parts.push(state.visualPlan.framing);
    parts.push(state.visualPlan.lighting);
    parts.push(state.visualPlan.environment);

    if (state.intent.composition) parts.push(state.intent.composition);

    if (state.intent.headline) {
        parts.push(`text "${state.intent.headline}" in bold modern typography`);
    }
    if (state.intent.primaryText) {
        parts.push(`text "${state.intent.primaryText}" in clean sans-serif font`);
    }

    if (state.intent.designElements && state.intent.designElements.length > 0) {
        parts.push(...state.intent.designElements);
    }

    const boosters = [
        "highly detailed",
        "sharp focus",
        "8k resolution",
        "cinematic lighting",
        "commercial photography",
        "masterpiece",
        "award-winning",
        "professional",
        "studio lighting"
    ];
    parts.push(...boosters);

    // Join with commas for a tag-like structure which often works better for details, 
    // but keep the first part (subject) distinct.
    const finalPrompt = parts.filter(Boolean).join(", ");

    return { finalPrompt };
}
