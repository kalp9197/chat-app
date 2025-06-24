import * as authService from '../services/auth.service.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';

//register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: 'User already exists',
        success: false,
      });
    }

    await authService.createUser({ name, email, password });

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'User registered successfully',
      success: true,
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'User not found',
        success: false,
      });
    }

    const isPasswordValid = await authService.comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'Invalid credentials',
        success: false,
      });
    }

    const token = authService.generateToken({ id: user.id, email: user.email });

    return res.status(HTTP_STATUS.OK).json({
      message: 'Login successful',
      success: true,
      data: {
        user: { name: user.name, email: user.email, uuid: user.uuid },
        token,
      },
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//check if user is authenticated
export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'User not authenticated',
        success: false,
      });
    }
    return res.status(HTTP_STATUS.OK).json({
      message: 'User authenticated successfully',
      success: true,
      data: { user: { name: user.name, email: user.email, uuid: user.uuid } },
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
