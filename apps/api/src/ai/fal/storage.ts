
import { fal } from "../../lib/fal";
import fs from "fs/promises";
import path from "path";

export async function uploadToFal(imageUrl: string): Promise<string> {
    try {
        // If it's already a remote URL (and not localhost), stick with it
        if (imageUrl.startsWith("http") && !imageUrl.includes("localhost")) {
            return imageUrl;
        }

        let filePath = imageUrl;

        // Strip query params if any
        if (filePath.includes("?")) {
            filePath = filePath.split("?")[0];
        }

        // If it comes from our API as /uploads/..., resolve it relative to CWD
        // We assume CWD is the package root where uploads/ folder exists or is served from
        if (filePath.startsWith("/uploads/")) {
            filePath = `.${filePath}`; // ./uploads/...
        } else if (filePath.startsWith("uploads/")) {
            filePath = `./${filePath}`;
        }

        // Resolve to absolute path
        const absolutePath = path.resolve(process.cwd(), filePath);

        console.log(`[uploadToFal] Resolving local file: ${imageUrl} -> ${absolutePath}`);

        // Check if file exists
        try {
            await fs.access(absolutePath);
        } catch {
            console.warn(`[uploadToFal] File not found at ${absolutePath}. Keeping original URL.`);
            return imageUrl;
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
