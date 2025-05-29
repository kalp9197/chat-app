import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../config/database.config.js";
import { JWT_SECRET } from "../constants/env.js";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

export const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

export const createUser = async (userData) => {
  const hashedPassword = await hashPassword(userData.password);
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      uuid: uuidv4(),
    },
  });
};

export const findUserByEmail = async (email) =>
  prisma.user.findUnique({ where: { email } });

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
