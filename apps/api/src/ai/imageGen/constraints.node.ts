
import type { ImageGenState } from "./state";

export async function constraintsNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    const adType = state.intent?.adType || "product-ad";

    const constraints = [
        "professional advertisement layout",
        "commercial grade visual quality",
        "crisp and sharp rendering",
        "natural color grading",
        "realistic shadows and highlights",
        "high production value",
    ];

    if (adType === "product-ad") {
        constraints.push(
            "product must be the visual hero — sharp, prominent, and well-lit",
            "professional product photography quality",
            "clean composition with clear visual hierarchy",
            "text elements should be readable and well-placed",
            "brand-consistent color usage",
        );
    } else if (adType === "person-centric-ad") {
        constraints.push(
            "photorealistic skin texture",
            "natural facial proportions",
            "realistic lighting on skin",
            "no plastic or airbrushed look",
            "authentic human expression",
            "person must be recognizable and natural-looking",
            "commercial model photography quality",
        );
    } else if (adType === "lifestyle-ad") {
        constraints.push(
            "aspirational lifestyle setting",
            "natural and authentic scene composition",
            "product integrated naturally into the scene",
            "warm and inviting atmosphere",
            "editorial photography quality",
        );
    }

    const adFormat = state.intent?.adFormat?.toLowerCase() || "";
    if (adFormat.includes("story") || adFormat.includes("9:16")) {
        constraints.push("vertical composition optimized for mobile viewing");
    } else if (adFormat.includes("banner")) {
        constraints.push("horizontal banner layout with text on one side");
    } else if (adFormat.includes("poster") || adFormat.includes("billboard")) {
        constraints.push("large-scale composition readable from distance");
    }

    if (state.adCreativePlan) {
        constraints.push(
            "include visible text elements as part of the design",
            "typography should be bold, modern, and readable",
            "layout should feel designed and intentional, not random",
        );
    }

    return { constraints };
}
