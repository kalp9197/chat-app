import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import * as Validation from '../validations/authValidations.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', validate(Validation.registerValidation), authController.register);

router.post('/login', validate(Validation.loginValidation), authController.login);

router.get('/check-auth', authMiddleware, authController.checkAuth);

export default router;
