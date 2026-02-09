
import { fal } from "../lib/fal";
import { uploadToFal } from "./fal/storage";

export async function describeImage(imageUrl: string): Promise<string> {
    try {
        console.log("Analyzing image with Vision AI:", imageUrl);

        const publicUrl = await uploadToFal(imageUrl);

        const result: any = await fal.subscribe("fal-ai/llava-next", {
            input: {
                image_url: publicUrl,
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
