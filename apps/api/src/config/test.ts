import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("__dirname in src/config:", __dirname);
const uploadDir = path.resolve(__dirname, "../../uploads/images");
console.log("uploadDir from src/config:", uploadDir);
