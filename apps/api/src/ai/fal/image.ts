
import { fal } from "../../lib/fal";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";

export async function generateImagesFal({
    model,
    prompt,
    imageUrls,
    numImages,
    strength,
}: {
    model: string;
    prompt: string;
    imageUrls?: string[];
    numImages: number;
    strength?: number;
}): Promise<string[]> {
    console.log("Generating images with fal.ai:", {
        model,
        prompt: prompt.substring(0, 100) + "...",
        numImages,
        strength,
        hasReferenceImages: !!imageUrls?.length,
    });

    const input: any = {
        prompt,
        num_images: 1,
        enable_safety_checker: true,
    };

    const isRecraft = model.includes("recraft");
    const isFluxPro = model.includes("flux-pro");

    if (!isRecraft) {
        input.image_size = "portrait_16_9";
        input.guidance_scale = 2.5;
        input.num_inference_steps = 50;
    }

    if (imageUrls && imageUrls.length > 0) {
        input.image_url = imageUrls[0];

        if (!isRecraft && !isFluxPro) {
            input.strength = strength || 0.75;
        }
    }

    if (imageUrls && imageUrls.length > 0) {
        console.log("Note: Reference images provided but may not be supported by this model");
    }

    const savedUrls: string[] = [];
    const uploadDir = path.join(process.cwd(), "uploads/generated");

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    for (let i = 0; i < numImages; i++) {
        console.log(`Generating image ${i + 1}/${numImages}...`);

        let result: any;
        try {
            result = await fal.subscribe(model, { input });
            console.log("✓ Image generated successfully");
        } catch (error: any) {
            console.error(`fal.ai API error for image ${i + 1}:`);
            console.error("Error details:", JSON.stringify(error.body || error, null, 2));
            throw error;
        }

        const images = result?.images
            ? (Array.isArray(result.images) ? result.images : [result.images])
            : [];

        for (const img of images) {
            console.log("Image object:", img);
            const imageUrl = img.url || img;
            if (!imageUrl || typeof imageUrl !== 'string') {
                console.warn("Skipping invalid image URL:", img);
                continue;
            }

            const filename = `${crypto.randomUUID()}.png`;
            const filePath = path.join(uploadDir, filename);

            try {
                const res = await axios.get(imageUrl, {
                    responseType: "arraybuffer",
                });

                fs.writeFileSync(filePath, res.data);
                savedUrls.push(`/uploads/generated/${filename}`);

                console.log(`Saved generated image: ${filename}`);
            } catch (error) {
                console.error(`Failed to download image from ${imageUrl}:`, error);
            }
        }
    }

    if (savedUrls.length === 0) {
        throw new Error("No images were successfully generated or saved");
    }

    return savedUrls;
}
