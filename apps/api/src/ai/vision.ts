
import { fal } from "../lib/fal";
import { uploadToFal } from "./fal/storage";
import type { ReferenceImageAnalysis } from "./imageGen/state";

export async function analyzeReferenceImage(imageUrl: string): Promise<ReferenceImageAnalysis> {
    try {
        console.log("Analyzing reference image with Vision AI:", imageUrl);

        const publicUrl = await uploadToFal(imageUrl);

        const result: any = await fal.subscribe("fal-ai/llava-next", {
            input: {
                image_url: publicUrl,
                prompt: `Analyze this image and respond ONLY with valid JSON. Determine what the primary subject is.

If it's a PRODUCT (bottle, can, box, device, clothing item, etc.):
{
  "type": "product",
  "description": "Detailed visual description of the product",
  "brandDetails": {
    "brandName": "brand name if visible, or null",
    "colors": ["primary color", "secondary color"],
    "logoDescription": "describe any logo or branding visible",
    "packagingStyle": "describe the packaging design style"
  }
}

If it's a PERSON (human face, portrait, selfie, etc.):
{
  "type": "person",
  "description": "Overall description of the person and setting",
  "personDetails": {
    "appearance": "age range, gender, ethnicity, hair color/style",
    "clothing": "what they are wearing",
    "expression": "facial expression and mood",
    "distinctiveFeatures": "notable features like beard, glasses, tattoos"
  }
}

If it's a SCENE (landscape, interior, abstract, etc.):
{
  "type": "scene",
  "description": "Detailed description of the scene, location, mood, colors, and key elements"
}

Return ONLY the JSON object, no other text.`,
                max_tokens: 500,
            },
        });

        const output = result.output || "";
        console.log("Vision analysis raw output:", output);

        try {
            const cleaned = output.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log("Vision analysis parsed:", parsed);
                return parsed as ReferenceImageAnalysis;
            }
        } catch (parseError) {
            console.warn("Failed to parse vision output as JSON, using fallback");
        }

        const lowerOutput = output.toLowerCase();
        const isPerson = lowerOutput.includes("person") || lowerOutput.includes("face") ||
            lowerOutput.includes("man") || lowerOutput.includes("woman") ||
            lowerOutput.includes("portrait");

        return {
            type: isPerson ? "person" : "product",
            description: output,
            ...(isPerson ? {
                personDetails: {
                    appearance: output,
                    clothing: "",
                    expression: "",
                    distinctiveFeatures: "",
                }
            } : {
                brandDetails: {
                    colors: [],
                    packagingStyle: output,
                }
            }),
        };
    } catch (error) {
        console.error("Vision analysis failed:", error);
        return {
            type: "product",
            description: "Unable to analyze reference image",
        };
    }
}

export const describeImage = async (imageUrl: string): Promise<string> => {
    const analysis = await analyzeReferenceImage(imageUrl);
    return analysis.description;
};
