import { body } from "express-validator";

export const validateCreateGroup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Group name must be between 3 and 50 characters."),
];

export const validateUpdateGroup = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Group name cannot be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Group name must be between 3 and 50 characters."),
];
