import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

export const PORT = process.env.PORT;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
export const JWT_SECRET = process.env.JWT_SECRET;
