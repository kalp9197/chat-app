import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Get all users
router.get("/", authMiddleware, userController.getUsers);

export default router;
