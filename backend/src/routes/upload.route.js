import express from "express";
import * as uploadController from "../controllers/upload.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/uploadFileValidations.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(Validation.validateUploadFile),
  uploadController.uploadFile
);

export default router;
