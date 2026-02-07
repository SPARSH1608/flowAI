

import type { ImageGenState } from "./state";

export async function constraintsNode(
    state: ImageGenState
): Promise<Partial<ImageGenState>> {
    const constraints = [
        "photorealistic skin texture",
        "natural facial proportions",
        "realistic lighting spill on skin",
        "no plastic or airbrushed look",
        "no beautification filters",
        "natural color grading",
        "realistic shadows and highlights",
        "no text overlays",
        "no logos or watermarks",
        "authentic human expressions",
    ];

    if (state.intent?.scenario?.toLowerCase().includes("podcast")) {
        constraints.push(
            "realistic microphone placement",
            "natural studio environment",
            "authentic recording setup"
        );
    }

    return { constraints };
}
