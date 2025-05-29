import {
  findUserByEmail,
  createUser,
  generateToken,
  comparePasswords,
} from "../services/auth.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await createUser({ name, email, password });
    const token = generateToken({ id: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "User not found",
        success: false,
      });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = generateToken({ id: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};
