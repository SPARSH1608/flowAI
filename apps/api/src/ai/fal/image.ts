import { fal } from "../../lib/fal";
import { uploadToFal } from "./storage";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import axios from "axios";
import type { AdType } from "../imageGen/state";

interface GenerateImagesOptions {
    model: string;
    prompt: string;
    imageUrls?: string[];
    numImages: number;
    strength?: number;
    adType?: AdType;
}

export async function generateImagesFal({
    model,
    prompt,
    imageUrls,
    numImages,
    strength,
    adType,
}: GenerateImagesOptions): Promise<string[]> {
    console.log("Generating images with fal.ai:", {
        model,
        prompt: prompt.substring(0, 150) + "...",
        numImages,
        strength,
        adType,
        hasReferenceImages: !!imageUrls?.length,
    });

    // Intelligent model routing based on ad type and inputs
    const resolvedModel = resolveModel(model, adType, imageUrls);
    console.log(`[ModelRouter] Selected model: ${resolvedModel} (original: ${model}, adType: ${adType})`);

    const hasReferenceImages = imageUrls && imageUrls.length > 0;

    // Route to the appropriate generation function
    if (resolvedModel === "fal-ai/flux-pro/kontext" && hasReferenceImages) {
        return generateWithKontext(resolvedModel, prompt, imageUrls!, numImages);
    } else if (resolvedModel === "fal-ai/ip-adapter-face-id" && hasReferenceImages) {
        return generateWithFaceId(resolvedModel, prompt, imageUrls![0] as string, numImages);
    } else {
        return generateStandard(resolvedModel, prompt, imageUrls, numImages, strength);
    }
}

function resolveModel(
    requestedModel: string,
    adType?: AdType,
    imageUrls?: string[]
): string {
    const hasRefs = imageUrls && imageUrls.length > 0;

    // If user explicitly chose a model and it's not just the default, respect it
    if (requestedModel !== "fal-ai/flux-realism" && !requestedModel.includes("custom")) {
        return requestedModel;
    }

    // Smart routing based on ad type + whether we have reference images
    if (!hasRefs) {
        // No reference images: use Flux Pro for high-quality text-to-image
        return "fal-ai/flux-pro";
    }

    if (adType === "person-centric-ad") {
        // Person ads with reference face: use IP-Adapter for face preservation
        return "fal-ai/ip-adapter-face-id";
    }

    // Product/lifestyle ads with reference: use Kontext for context-aware editing
    return "fal-ai/flux-pro/kontext";
}

async function generateWithKontext(
    model: string,
    prompt: string,
    imageUrls: string[],
    numImages: number
): Promise<string[]> {
    console.log("[Kontext] Generating with reference image context...");

    // Upload reference image to fal storage first
    console.log(`[Kontext] Uploading reference image: ${imageUrls[0]}`);
    const uploadedRefUrl = await uploadToFal(imageUrls[0] as string);
    console.log(`[Kontext] Reference image uploaded to: ${uploadedRefUrl}`);

    const savedUrls: string[] = [];
    const uploadDir = ensureUploadDir();

    for (let i = 0; i < numImages; i++) {
        console.log(`[Kontext] Generating image ${i + 1}/${numImages}...`);

        const input: any = {
            prompt,
            image_url: uploadedRefUrl,
            guidance_scale: 3.5,
            num_images: 1,
            output_format: "png",
        };

        try {
            const result: any = await fal.subscribe(model, { input });
            const urls = extractImageUrls(result);

            for (const url of urls) {
                const saved = await downloadAndSave(url, uploadDir);
                if (saved) savedUrls.push(saved);
            }
        } catch (error: any) {
            console.error(`[Kontext] Error generating image ${i + 1}:`, error?.body || error);
            throw error;
        }
    }

    if (savedUrls.length === 0) {
        throw new Error("No images were successfully generated with Kontext");
    }

    return savedUrls;
}

async function generateWithFaceId(
    model: string,
    prompt: string,
    faceImageUrl: string,
    numImages: number
): Promise<string[]> {
    console.log("[FaceID] Generating with face identity preservation...");

    // Upload face image to fal storage first
    console.log(`[FaceID] Uploading face image: ${faceImageUrl}`);
    const uploadedFaceUrl = await uploadToFal(faceImageUrl);
    console.log(`[FaceID] Face image uploaded to: ${uploadedFaceUrl}`);

    const savedUrls: string[] = [];
    const uploadDir = ensureUploadDir();

    for (let i = 0; i < numImages; i++) {
        console.log(`[FaceID] Generating image ${i + 1}/${numImages}...`);

        const input: any = {
            prompt,
            face_image_url: uploadedFaceUrl,
            negative_prompt: "blurry, low resolution, bad quality, distorted face, ugly, low quality, pixelated",
            guidance_scale: 7.5,
            num_inference_steps: 50,
            num_samples: 4,
            width: 768,
            height: 1024,
            model_type: "SDXL-v2-plus",
        };

        try {
            const result: any = await fal.subscribe(model, { input });
            const urls = extractImageUrls(result);

            for (const url of urls) {
                const saved = await downloadAndSave(url, uploadDir);
                if (saved) savedUrls.push(saved);
            }
        } catch (error: any) {
            console.error(`[FaceID] Error generating image ${i + 1}:`, error?.body || error);
            // Fallback: try Kontext instead
            console.log("[FaceID] Falling back to Kontext...");
            return generateWithKontext("fal-ai/flux-pro/kontext", prompt, [uploadedFaceUrl], numImages);
        }
    }

    if (savedUrls.length === 0) {
        throw new Error("No images were successfully generated with FaceID");
    }

    return savedUrls;
}

async function generateStandard(
    model: string,
    prompt: string,
    imageUrls?: string[],
    numImages: number = 1,
    strength?: number
): Promise<string[]> {
    console.log("[Standard] Generating with standard model...");

    const input: any = {
        prompt,
        num_images: 1,
        enable_safety_checker: true,
    };

    const isRecraft = model.includes("recraft");
    const isFluxPro = model.includes("flux-pro");

    if (!isRecraft) {
        input.image_size = "portrait_16_9";
        input.guidance_scale = isFluxPro ? 3.5 : 2.5;
        input.num_inference_steps = 50;
    }

    if (imageUrls && imageUrls.length > 0) {
        // Upload reference image if present
        console.log(`[Standard] Uploading reference image: ${imageUrls[0]}`);
        const uploadedRefUrl = await uploadToFal(imageUrls[0] as string);
        input.image_url = uploadedRefUrl;

        if (!isRecraft && !isFluxPro) {
            input.strength = strength || 0.75;
        }
    }

    const savedUrls: string[] = [];
    const uploadDir = ensureUploadDir();

    for (let i = 0; i < numImages; i++) {
        console.log(`[Standard] Generating image ${i + 1}/${numImages}...`);

        try {
            const result: any = await fal.subscribe(model, { input });
            const urls = extractImageUrls(result);

            for (const url of urls) {
                const saved = await downloadAndSave(url, uploadDir);
                if (saved) savedUrls.push(saved);
            }
        } catch (error: any) {
            console.error(`[Standard] Error for image ${i + 1}:`, error?.body || error);
            throw error;
        }
    }

    if (savedUrls.length === 0) {
        throw new Error("No images were successfully generated or saved");
    }

    return savedUrls;
}

// --- Helper functions ---

function ensureUploadDir(): string {
    const uploadDir = path.join(process.cwd(), "uploads/generated");
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
}

function extractImageUrls(result: any): string[] {
    const images = result?.images
        ? (Array.isArray(result.images) ? result.images : [result.images])
        : result?.data?.images
            ? (Array.isArray(result.data.images) ? result.data.images : [result.data.images])
            : [];

    return images
        .map((img: any) => img?.url || img)
        .filter((url: any) => url && typeof url === "string");
}

async function downloadAndSave(imageUrl: string, uploadDir: string): Promise<string | null> {
    const filename = `${crypto.randomUUID()}.png`;
    const filePath = path.join(uploadDir, filename);

    try {
        const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, res.data);
        console.log(`Saved generated image: ${filename}`);
        return `/uploads/generated/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${imageUrl}:`, error);
        return null;
    }
}
