import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.join(process.cwd(), "uploads/images");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export const imageUpload = multer({
    storage: multer.diskStorage({
        destination: uploadDir,
        filename: (_, file, cb) => {
            const unique = crypto.randomUUID() + "-" + file.originalname;
            cb(null, unique);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
