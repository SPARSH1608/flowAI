import type { ImageGenState } from "./state";
import { callLLM } from "../llm";
import { analyzeReferenceImage } from "../vision";

export async function intentNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    let referenceImageAnalysis = state.referenceImageAnalysis;

    if (!referenceImageAnalysis && state.referenceImages && state.referenceImages.length > 0 && state.referenceImages[0]?.url) {
        referenceImageAnalysis = await analyzeReferenceImage(state.referenceImages[0].url);
    }

    const textParts = [
        state.userText,
        state.inlinePrompt,
        referenceImageAnalysis ? `Reference Image Analysis: ${JSON.stringify(referenceImageAnalysis)}` : ""
    ].filter(Boolean).join("\n");

    if (!textParts.trim()) {
        return {
            referenceImageAnalysis,
            intent: {
                subject: "premium product",
                scenario: "modern advertisement with clean layout",
                mood: "bold and professional",
                brandTone: "premium",
                adType: "product-ad",
                adFormat: "social-media",
                designElements: ["bold typography", "minimalist layout", "vibrant colors"],
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
            headline?: string;
            primaryText?: string;
            ctaText?: string;
            designElements?: string[];
            adType: "product-ad" | "lifestyle-ad" | "person-centric-ad";
            adFormat?: string;
        }>({
            model: "fal-ai/any-llm",
            system: `You are a senior creative director at a top advertising agency.
Your job is to extract the AD INTENT from user input. You are designing ADVERTISEMENTS, not photographs.

CRITICAL RULES:
- Think like an ad designer, NOT a photographer
- Every output should describe an ADVERTISEMENT with design elements, text, and layout — not just a pretty image
- Auto-detect the ad type based on the input:
  * "product-ad" — if the input is about a product, brand, or item
  * "lifestyle-ad" — if the input implies a lifestyle, activity, or aspirational scene with a product
  * "person-centric-ad" — if the input focuses on a person (influencer, model, testimonial)
- If user provides a reference image of a person, set adType to "person-centric-ad" and reference "the person from the reference image" in the subject
- If user provides a reference image of a product, set adType to "product-ad" and describe the product as seen in the reference
- ALWAYS include designElements that make it look like a REAL AD (typography, layout cues, visual effects)
- If no headline is explicitly given, suggest a short catchy headline that fits the product/brand
- If no CTA is given, suggest one (like "Shop Now", "Learn More", "Try It Today")
- Return ONLY valid JSON`,
            user: `Input:
${textParts}

Return JSON with these fields:
- subject: the main subject of the ad (product, person, or both)
- scenario: the ad setting/context (e.g., "Instagram story ad for summer collection", "billboard for energy drink launch")
- mood: emotional tone (e.g., "bold and energetic", "luxurious and minimal", "warm and inviting")
- brandTone: brand personality (e.g., "premium", "youthful", "corporate", "playful")
- artStyle: visual style (e.g., "modern flat design", "photorealistic with graphic overlays", "neon cyberpunk")
- lighting: lighting for the scene (e.g., "dramatic studio lighting with colored gels", "bright and airy natural light")
- composition: layout/composition (e.g., "product hero center with text overlays", "split layout: image left, text right")
- audience: target audience (e.g., "Gen Z social media users", "corporate professionals")
- headline: main ad headline text (auto-generate one if not provided by user)
- primaryText: tagline or subtext
- ctaText: call-to-action text (e.g., "Shop Now", "Learn More")
- designElements: list of design keywords (e.g., ["bold sans-serif typography", "gradient background", "floating product shadow", "geometric accents", "neon glow effect"])
- adType: one of "product-ad", "lifestyle-ad", or "person-centric-ad"
- adFormat: the format (e.g., "social-media-post", "instagram-story", "banner", "poster", "billboard")`,
        });

        return { intent, referenceImageAnalysis };
    } catch (error) {
        console.error("Intent extraction failed:", error);
        return {
            referenceImageAnalysis,
            intent: {
                subject: textParts,
                scenario: "modern advertisement",
                mood: "bold and professional",
                brandTone: "premium",
                adType: referenceImageAnalysis?.type === "person" ? "person-centric-ad" : "product-ad",
                designElements: ["bold typography", "clean layout", "vibrant colors"],
            },
        };
    }
}
