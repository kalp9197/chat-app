import { PrismaClient } from "@prisma/client";
export const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
export const prisma = new PrismaClient();