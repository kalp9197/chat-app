import { body } from "express-validator";

export const validateCreateGroup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Group name is required.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Group name must be between 3 and 50 characters."),
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members must be a non-empty array."),
  body("members.*.uuid")
    .isUUID()
    .withMessage("Each member must have a valid uuid."),
];

export const validateUpdateGroup = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Group name cannot be empty.")
    .isLength({ min: 3, max: 50 })
    .withMessage("Group name must be between 3 and 50 characters."),
  body("members").optional().isArray().withMessage("Members must be an array."),
  body("members.*.uuid")
    .optional()
    .isUUID()
    .withMessage("Each member must have a valid uuid."),
];

export const validateAddMembers = [
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members must be a non-empty array."),
  body("members.*.uuid")
    .isUUID()
    .withMessage("Each member must have a valid uuid."),
];
