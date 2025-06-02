import pkg from "@prisma/client";
const { PrismaClient } = pkg;

export const prisma = new PrismaClient();

export const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
