import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../../public/uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const saveBase64File = async (data, extension, fileName) => {
  const buffer = Buffer.from(data, "base64");
  const baseName = path.parse(fileName).name;
  const uniqueFileName = `${baseName}_${crypto.randomInt(1000000000)}.${extension}`;
  const filePath = path.join(UPLOADS_DIR, uniqueFileName);

  await fs.promises.writeFile(filePath, buffer);
  return uniqueFileName;
};
