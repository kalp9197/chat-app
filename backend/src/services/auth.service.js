import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database.config.js";
import { JWT_SECRET } from "../constants/env.js";

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare passwords
export const comparePasswords = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

// Generate token
export const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

// Create user
export const createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    return prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        uuid: uuidv4(),
      },
    });
  } catch (error) {
    throw new Error("Failed to create user", error);
  }
};

// Find user by email
export const findUserByEmail = async (email) =>
  prisma.user.findUnique({ where: { email } });

// Verify token
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
