
import type { ImageGenState } from "./state";

export async function compilerNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    if (!state.intent || !state.visualPlan) {
        throw new Error("Missing intent or visual plan - cannot compile prompt");
    }

    const parts: string[] = [];

    parts.push(
        `Photorealistic 9:16 portrait of ${state.intent.subject}.`
    );

    if (state.intent.scenario) {
        parts.push(`Scenario: ${state.intent.scenario}.`);
    }
    if (state.intent.mood) {
        parts.push(`Mood: ${state.intent.mood}.`);
    }
    if (state.intent.brandTone) {
        parts.push(`Brand tone: ${state.intent.brandTone}.`);
    }

    parts.push(`\nCamera: ${state.visualPlan.camera}.`);
    parts.push(`Framing: ${state.visualPlan.framing}.`);
    parts.push(`Lighting: ${state.visualPlan.lighting}.`);
    parts.push(`Environment: ${state.visualPlan.environment}.`);
    if (state.constraints && state.constraints.length > 0) {
        parts.push(`\nRealism requirements:`);
        state.constraints.forEach((constraint) => {
            parts.push(`- ${constraint}`);
        });
    }

    const finalPrompt = parts.join("\n").trim();

    return { finalPrompt };
}
