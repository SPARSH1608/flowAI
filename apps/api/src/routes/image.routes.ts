import { Router } from "express";
import { imageUpload } from "../config/upload";
import { uploadImage, listImages, saveGeneratedImage } from "../controllers/image.controller";

const router = Router();

router.get("/", listImages);
router.post("/", imageUpload.single("image"), uploadImage);
router.post("/save-generated", saveGeneratedImage);

export default router;
