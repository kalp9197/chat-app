import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, userController.getUsers);
router.post("/status", authMiddleware, userController.updateStatus);
router.get("/status/:userId", authMiddleware, userController.getStatus);

export default router;
