import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImage(req: Request, res: Response) {
    if (!req.file) {
        return res.status(400).json({
            error: "No image uploaded",
        });
    }

    const image = await prisma.image.create({
        data: {
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            url: `/uploads/images/${req.file.filename}`,
            purpose: req.body.purpose ?? null,
        },
    });

    res.json({
        id: image.id,
        url: image.url,
        mimetype: image.mimetype,
        size: image.size,
    });
}

export async function listImages(req: Request, res: Response) {
    const images = await prisma.image.findMany({
        orderBy: { createdAt: "desc" },
    });

    res.json(images);
}

export async function saveGeneratedImage(req: Request, res: Response) {
    try {
        const { imageUrl, purpose } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "No imageUrl provided" });
        }

        // Clean up URL to get relative path
        // Handles both full URL and relative path
        const relativePath = imageUrl.replace(/^https?:\/\/[^\/]+/, "");

        // Construct source path (assuming app.ts serves 'uploads' at root or similar)
        // If relativePath is '/uploads/generated/foo.png', and app root is where we are running.
        // We need to resolve where this file actually exists on disk.
        // Based on app.ts: app.use("/uploads", express.static("uploads"));
        // So '/uploads/foo.png' maps to './uploads/foo.png' relative to CWD.

        // Remove leading slash for path.join
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        const sourcePath = path.resolve(process.cwd(), cleanPath);

        if (!fs.existsSync(sourcePath)) {
            return res.status(404).json({ error: "Source image not found" });
        }

        const filename = `${uuidv4()}${path.extname(sourcePath)}`;
        const targetDir = path.join(process.cwd(), "uploads", "images");
        const targetPath = path.join(targetDir, filename);

        // Ensure target directory exists
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy file
        await fs.promises.copyFile(sourcePath, targetPath);

        // Get file stats for size
        const stats = await fs.promises.stat(targetPath);

        // Create DB record
        const image = await prisma.image.create({
            data: {
                filename: filename,
                mimetype: "image/png", // Assuming PNG for now, or infer from extension
                size: stats.size,
                path: targetPath,
                url: `/uploads/images/${filename}`,
                purpose: purpose || "generated",
            },
        });

        res.json(image);
    } catch (error) {
        console.error("Error saving generated image:", error);
        res.status(500).json({ error: "Failed to save image" });
    }
}
