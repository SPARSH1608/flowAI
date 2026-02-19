
import type { ImageGenState } from "./state";

export async function compilerNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    if (!state.intent || !state.visualPlan) {
        throw new Error("Missing intent or visual plan - cannot compile prompt");
    }

    const adType = state.intent.adType || "product-ad";
    const adPlan = state.adCreativePlan;

    let finalPrompt = "";

    if (adType === "product-ad") {
        finalPrompt = buildProductAdPrompt(state, adPlan);
    } else if (adType === "person-centric-ad") {
        finalPrompt = buildPersonAdPrompt(state, adPlan);
    } else {
        finalPrompt = buildLifestyleAdPrompt(state, adPlan);
    }

    finalPrompt += ". Ultra high quality, professional advertising photography, 8k resolution, sharp focus, commercial grade, award-winning ad design.";

    finalPrompt += " Not a plain photograph. This is a designed advertisement with intentional layout and composition.";

    return { finalPrompt };
}

function buildProductAdPrompt(state: ImageGenState, adPlan?: ImageGenState["adCreativePlan"]): string {
    const intent = state.intent!;
    const visual = state.visualPlan!;

    const parts: string[] = [];

    parts.push(`A professional advertisement featuring ${intent.subject}`);

    if (intent.scenario) {
        parts.push(`in the context of ${intent.scenario}`);
    }

    if (adPlan) {
        parts.push(`with the following ad layout: ${adPlan.layout}`);

        if (adPlan.headline) {
            parts.push(`Headline text: "${adPlan.headline}". Typography style: ${adPlan.typographyStyle}`);
        }
        if (adPlan.tagline) {
            parts.push(`Tagline text: "${adPlan.tagline}" positioned below`);
        }
        if (adPlan.ctaText) {
            parts.push(`Call-to-action button with text: "${adPlan.ctaText}" at the bottom`);
        }
    } else if (intent.headline) {
        parts.push(`with bold text "${intent.headline}" as the headline`);
        if (intent.primaryText) {
            parts.push(`and tagline "${intent.primaryText}"`);
        }
    }

    parts.push(`Shot with ${visual.camera} angle, ${visual.framing}`);
    parts.push(`Lighting: ${visual.lighting}`);
    parts.push(`Environment: ${visual.environment}`);

    if (intent.mood) parts.push(`The overall mood is ${intent.mood}`);
    if (intent.artStyle) parts.push(`Visual style: ${intent.artStyle}`);
    if (intent.brandTone) parts.push(`Brand tone: ${intent.brandTone}`);

    if (intent.designElements && intent.designElements.length > 0) {
        parts.push(`Design elements include: ${intent.designElements.join(", ")}`);
    }
    if (adPlan?.colorPalette && adPlan.colorPalette.length > 0) {
        parts.push(`Color palette: ${adPlan.colorPalette.join(", ")}`);
    }

    return parts.join(". ");
}

function buildPersonAdPrompt(state: ImageGenState, adPlan?: ImageGenState["adCreativePlan"]): string {
    const intent = state.intent!;
    const visual = state.visualPlan!;
    const refAnalysis = state.referenceImageAnalysis;

    const parts: string[] = [];

    if (refAnalysis?.type === "person" && refAnalysis.personDetails) {
        const p = refAnalysis.personDetails;
        parts.push(`A professional advertisement featuring a person (${p.appearance}, wearing ${p.clothing}, ${p.expression})`);
    } else {
        parts.push(`A professional advertisement featuring ${intent.subject}`);
    }

    if (intent.scenario) {
        parts.push(`in ${intent.scenario}`);
    }

    if (adPlan) {
        parts.push(`Ad layout: ${adPlan.layout}`);
        if (adPlan.headline) {
            parts.push(`Headline text: "${adPlan.headline}". Typography style: ${adPlan.typographyStyle}`);
        }
        if (adPlan.ctaText) {
            parts.push(`Call-to-action button text: "${adPlan.ctaText}" at the bottom`);
        }
    }

    parts.push(`${visual.camera} angle, ${visual.framing}, ${visual.lighting}`);
    parts.push(`Setting: ${visual.environment}`);

    if (intent.mood) parts.push(`Mood: ${intent.mood}`);
    if (intent.designElements && intent.designElements.length > 0) {
        parts.push(`Design elements: ${intent.designElements.join(", ")}`);
    }

    return parts.join(". ");
}

function buildLifestyleAdPrompt(state: ImageGenState, adPlan?: ImageGenState["adCreativePlan"]): string {
    const intent = state.intent!;
    const visual = state.visualPlan!;

    const parts: string[] = [];

    parts.push(`A lifestyle advertisement showing ${intent.subject}`);

    if (intent.scenario) {
        parts.push(`in an aspirational ${intent.scenario} setting`);
    }

    if (adPlan) {
        parts.push(`Layout: ${adPlan.layout}`);
        if (adPlan.headline) {
            parts.push(`Headline text: "${adPlan.headline}". Typography style: integrated into the design`);
        }
        if (adPlan.tagline) {
            parts.push(`Tagline text: "${adPlan.tagline}"`);
        }
        if (adPlan.ctaText) {
            parts.push(`Call-to-action text: "${adPlan.ctaText}"`);
        }
    }

    parts.push(`${visual.camera}, ${visual.framing}, ${visual.lighting}`);
    parts.push(`Environment: ${visual.environment}`);

    if (intent.mood) parts.push(`Mood: ${intent.mood}`);
    if (intent.artStyle) parts.push(`Style: ${intent.artStyle}`);
    if (intent.designElements && intent.designElements.length > 0) {
        parts.push(`Design: ${intent.designElements.join(", ")}`);
    }

    return parts.join(". ");
}
