import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authRepository } from '../repositories/index.js';
import { JWT_SECRET } from '../constants/env.js';
import { ApiError } from '../errors/apiError.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';

//hash a password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

//compare a plain password with a hashed password
export const comparePasswords = async (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword);

//generate a jwt token
export const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

//create a new user
export const createUser = async (userData) => {
  try {
    const hashedPassword = await hashPassword(userData.password);
    return authRepository.createUser({
      ...userData,
      password: hashedPassword,
      uuid: uuidv4(),
    });
  } catch {
    throw new ApiError('Failed to create user', HTTP_STATUS.BAD_REQUEST);
  }
};

//find a user by email
export const findUserByEmail = async (email) => authRepository.findUserByEmail(email);

//verify a jwt token
export const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
