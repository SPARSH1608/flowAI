import type { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { uploadToR2 } from "../services/s3.service";

export async function uploadImage(req: Request, res: Response) {
    console.log("uploadImage called");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    if (!req.file) {
        return res.status(400).json({
            error: "No image uploaded",
            receivedBody: req.body,
            receivedHeaders: req.headers
        });
    }

    try {
        const uniqueFilename = `${crypto.randomUUID()}-${req.file.originalname}`;
        const r2Url = await uploadToR2(req.file.buffer, uniqueFilename, req.file.mimetype);

        const image = await prisma.image.create({
            data: {
                filename: uniqueFilename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: r2Url,
                url: r2Url,
                purpose: req.body.purpose ?? null,
            },
        });

        res.json({
            id: image.id,
            url: image.url,
            mimetype: image.mimetype,
            size: image.size,
        });
    } catch (error) {
        console.error("Error uploading to R2:", error);
        res.status(500).json({ error: "Failed to upload image" });
    }
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

        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            console.error("Failed to fetch image from URL:", imageUrl);
            return res.status(400).json({ error: "Failed to fetch source image" });
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimetype = imageResponse.headers.get("content-type") || "image/png";

        const extension = imageUrl.split('.').pop()?.split('?')[0] || "png";
        const validExtensions = ["png", "jpg", "jpeg", "webp", "gif"];
        const ext = validExtensions.includes(extension.toLowerCase()) ? extension : "png";

        const filename = `${uuidv4()}.${ext}`;

        const r2Url = await uploadToR2(buffer, filename, mimetype);

        // Create DB record
        const image = await prisma.image.create({
            data: {
                filename: filename,
                mimetype: mimetype,
                size: buffer.length,
                path: r2Url,
                url: r2Url,
                purpose: purpose || "generated",
            },
        });

        res.json(image);
    } catch (error) {
        console.error("Error saving generated image:", error);
        res.status(500).json({ error: "Failed to save image" });
    }
}
