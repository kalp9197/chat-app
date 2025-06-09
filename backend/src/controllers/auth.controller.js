import * as authService from "../services/auth.service.js";
import * as userService from "../services/user.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await authService.createUser({ name, email, password });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(HTTP_STATUS.CREATED).json({
      message: "User registered successfully",
      success: true,
      data: { user: userWithoutPassword },
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
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: "User not found",
        success: false,
      });
    }

    const isPasswordValid = await authService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    // Set user as online
    await userService.updateUserStatus(user.id, true);

    const token = authService.generateToken({ id: user.id, email: user.email });
    const { password: _, ...userWithoutPassword } = user;

    return res.status(HTTP_STATUS.OK).json({
      message: "Login successful",
      success: true,
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const logout = async (req, res) => {
  try {
    const userId = req.user.id;

    // Set user as offline and update last_seen
    await userService.updateUserStatus(userId, false);

    return res.status(HTTP_STATUS.OK).json({
      message: "Logout successful",
      success: true,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
        success: false,
      });
    }
    return res.status(HTTP_STATUS.OK).json({
      message: "User authenticated successfully",
      success: true,
      data: { user },
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};
