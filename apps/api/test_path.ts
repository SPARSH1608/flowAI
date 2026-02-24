import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.resolve(__dirname, "../../uploads/images");
console.log("From test_path.ts root:");
console.log("__dirname:", __dirname);
console.log("uploadDir:", uploadDir);
