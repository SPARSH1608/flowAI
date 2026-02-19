
import { fal } from "../../lib/fal";
import fs from "fs/promises";
import path from "path";

export async function uploadToFal(imageUrl: string): Promise<string> {
    try {
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
        const blob = new Blob([fileBuffer]);

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
