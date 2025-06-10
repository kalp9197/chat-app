import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/authValidations.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Register a new user
router.post(
  "/register",
  validate(Validation.registerValidation),
  authController.register
);

// Login an existing user
router.post(
  "/login",
  validate(Validation.loginValidation),
  authController.login
);

// Check if the user is authenticated
router.get("/check-auth", authMiddleware, authController.checkAuth);

export default router;
