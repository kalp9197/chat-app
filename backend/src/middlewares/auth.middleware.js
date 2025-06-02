import * as authService from "../services/auth.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "Authorization header missing or invalid",
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: "No token provided",
        success: false,
      });
    }

    req.user = authService.verifyToken(token);
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: "Invalid token",
      success: false,
    });
  }
};
