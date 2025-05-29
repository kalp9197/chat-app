import express from "express";
import { register, login, checkAuth } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  registerValidation,
  loginValidation,
} from "../validations/authValidations.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.get("/check-auth", authMiddleware, checkAuth);

export default router;
