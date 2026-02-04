import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function generateImages({
    prompt,
    references,
    config,
}: {
    prompt: string;
    references: string[];
    config: any;
}): Promise<string[]> {
    console.log(`[MOCK] Generating image for prompt: "${prompt}"`);

    // Generate random dimensions for variety
    const width = 512 + Math.floor(Math.random() * 512); // 512-1024
    const height = 512 + Math.floor(Math.random() * 512); // 512-1024

    // Fetch a real placeholder image
    // Using picsum.photos as it is more reliable than pollinations.ai
    const imageUrl = `https://picsum.photos/${width}/${height}`;

    try {
        const response = await fetch(imageUrl);
        console.log(`[MOCK] Fetch status: ${response.status}, Content-Type: ${response.headers.get("content-type")}`);

        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filename = `${crypto.randomUUID()}.jpg`;
        // Assuming process.cwd() is the root of apps/api when running the server
        const uploadDir = path.join(process.cwd(), "uploads", "images");

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        console.log(`[MOCK] Saved generated image to ${filepath}`);

        // Return relative path that the API can serve
        return [`/uploads/images/${filename}`];

    } catch (error) {
        console.error("Failed to generate/save image:", error);
        // Fallback to the static placeholder if fetching fails
        return [`http://localhost:3002/uploads/images/71e84f3f-3e23-4b5e-8ca4-8adf9ce5252a-sf%2020.jpeg`];
    }
}
