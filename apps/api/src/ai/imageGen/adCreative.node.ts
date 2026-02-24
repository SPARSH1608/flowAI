import type { ImageGenState, AdCreativePlan } from "./state";
import { callLLM } from "../llm";

export async function adCreativeNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    if (!state.intent) {
        return {};
    }

    try {
        const adCreativePlan = await callLLM<AdCreativePlan>({
            model: "fal-ai/any-llm",
            system: `You are a world-class advertising art director. Your job is to create an advertising layout blueprint.

RULES:
- Design ADVERTISEMENTS, not photographs
- Think about visual hierarchy: what the viewer sees first, second, third
- Every ad needs: a hero element (main visual), headline area, and CTA area
- Consider the ad format and platform when designing layout
- Choose colors that match the brand tone
- Suggest typography that fits the mood
- Return ONLY valid JSON

IMPORTANT: Your layout description should be specific enough that an AI image generator can recreate it. Describe WHERE things go (top, center, bottom, left, right) and HOW they look (size, style, prominence).`,
            user: `Intent:
${JSON.stringify(state.intent, null, 2)}

${state.referenceImageAnalysis ? `Reference Image Analysis:\n${JSON.stringify(state.referenceImageAnalysis, null, 2)}` : ""}

${state.visualPlan ? `Visual Plan:\n${JSON.stringify(state.visualPlan, null, 2)}` : ""}

Create an ad layout blueprint. Return JSON with:
- layout: detailed description of the ad layout (e.g., "Full-bleed product image as background with slight blur. Product bottle sharp and centered in the lower third. Bold headline spanning the upper third. Subtle gradient overlay from bottom to top for text readability. CTA button bottom-center.")
- headline: the main headline text for the ad (use the one from intent, or improve it)
- tagline: optional supporting tagline
- ctaText: call-to-action text (use from intent or suggest one)
- colorPalette: array of 3-5 hex colors that define the ad's color scheme
- typographyStyle: describe the typography (e.g., "Bold condensed sans-serif for headline, light weight for body, all-caps CTA")
- visualHierarchy: what the viewer sees in order (e.g., "1. Hero product image 2. Bold headline 3. Brand logo 4. CTA button")
- heroElement: the main visual focus (e.g., "The Coca-Cola can, glistening with condensation droplets, tilted at 15 degrees")
- textPlacement: where text elements go (e.g., "Headline: top-center, large. Tagline: below headline, smaller. CTA: bottom-center, button style")`,
        });

        console.log("[SSE:ad_creative]", JSON.stringify(adCreativePlan));
        return { adCreativePlan };
    } catch (error) {
        console.error("Ad creative planning failed:", error);

        // Sensible defaults
        return {
            adCreativePlan: {
                layout: "Product centered with clean background. Bold headline at top. CTA at bottom.",
                headline: state.intent.headline || "Discover Something New",
                tagline: state.intent.primaryText || "",
                ctaText: state.intent.ctaText || "Learn More",
                colorPalette: ["#000000", "#FFFFFF", "#FF4444"],
                typographyStyle: "Bold modern sans-serif",
                visualHierarchy: "1. Product 2. Headline 3. CTA",
                heroElement: state.intent.subject,
                textPlacement: "Headline: top-center. CTA: bottom-center.",
            },
        };
    }
}
