
import { fal } from "../lib/fal";

export async function describeImage(imageUrl: string): Promise<string> {
    try {
        console.log("Analyzing image with Vision AI:", imageUrl);
        const result: any = await fal.subscribe("fal-ai/llava-next", {
            input: {
                image_url: imageUrl,
                prompt: "Describe this person in detail, focusing on their physical appearance, clothing, and distinctive features. Be concise.",
                max_tokens: 300,
            },
        });

        const description = result.output;
        console.log("Vision analysis result:", description);
        return description;
    } catch (error) {
        console.error("Vision analysis failed:", error);
        return "";
    }
}
