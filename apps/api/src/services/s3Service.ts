import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
    console.warn("Missing R2 environment variables. Image uploads to R2 will fail.");
}

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export const uploadToR2 = async (buffer: Buffer, filename: string, mimetype: string): Promise<string> => {
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");

    if (!bucketName || !publicUrl) {
        throw new Error("R2 bucket name or public URL is not configured");
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimetype,
    });

    await s3Client.send(command);

    return `${publicUrl}/${filename}`;
};
