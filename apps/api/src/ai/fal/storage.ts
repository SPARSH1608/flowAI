
import { fal } from "../../lib/fal";
import fs from "fs/promises";
import path from "path";

export async function uploadToFal(imageUrl: string): Promise<string> {
    try {
        if (!imageUrl) throw new Error("imageUrl is required");
        if (imageUrl.startsWith("http") && !imageUrl.includes("localhost")) {
            return imageUrl;
        }

        let filePath = imageUrl;

        if (filePath.startsWith("http://localhost") || filePath.startsWith("https://localhost")) {
            try {
                const urlObj = new URL(filePath);
                filePath = urlObj.pathname;
            } catch (e) {
            }
        }

        if (filePath.includes("?")) {
            const parts = filePath.split("?");
            filePath = parts[0] as string;
        }

        if (filePath.startsWith("/uploads/")) {
            filePath = `.${filePath}`;
        } else if (filePath.startsWith("uploads/")) {
            filePath = `./${filePath}`;
        }
        const absolutePath = path.resolve(process.cwd(), filePath);

        console.log(`[uploadToFal] Resolving local file: ${imageUrl} -> ${absolutePath}`);

        try {
            await fs.access(absolutePath);
        } catch {
            console.error(`[uploadToFal] File not found at ${absolutePath}`);
            throw new Error(`Reference image file not found: ${path.basename(filePath)}`);
        }

        const fileBuffer = await fs.readFile(absolutePath);
        const extension = path.extname(absolutePath).toLowerCase();
        let mimeType = "image/jpeg";
        if (extension === ".png") mimeType = "image/png";
        else if (extension === ".webp") mimeType = "image/webp";

        const blob = new Blob([fileBuffer], { type: mimeType });

        const url = await fal.storage.upload(blob);
        console.log(`[uploadToFal] Upload successful. URL: ${url}`);
        return url;

    } catch (error: any) {
        console.error("[uploadToFal] Upload failed with error:", error);
        if (error?.body) {
            console.error("[uploadToFal] Error body:", JSON.stringify(error.body));
        }
        return imageUrl;
    }
}
