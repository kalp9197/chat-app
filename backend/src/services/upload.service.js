import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const saveBase64File = async (data, type, fileName) => {
  const buffer = Buffer.from(data, "base64");
  const uniqueFileName = `${fileName}_${crypto.randomInt(1000000000)}.${type}`;
  const filePath = path.join(UPLOADS_DIR, uniqueFileName);

  // Save file to disk
  await fs.promises.writeFile(filePath, buffer);
  return uniqueFileName;
};
