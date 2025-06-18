import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { authRepository } from "../repositories/index.js";
import { JWT_SECRET } from "../constants/env.js";
import { apiError } from "../utils/apiError.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);
export const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });

export const createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    return authRepository.createUser({
      ...userData,
      password: hashedPassword,
      uuid: uuidv4(),
    });
  } catch {
    throw new apiError("Failed to create user", HTTP_STATUS.BAD_REQUEST);
  }
};

export const findUserByEmail = async (email) =>
  authRepository.findUserByEmail(email);

export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
