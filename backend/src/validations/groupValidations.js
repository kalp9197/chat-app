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
  body("members.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),
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
  body("members.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),

  body("removeMembers")
    .optional()
    .isArray()
    .withMessage("removeMembers must be an array."),
  body("removeMembers.*.uuid")
    .optional()
    .isUUID()
    .withMessage("Each removeMember must have a valid uuid."),
  body("removeMembers.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),

  body("addMembers")
    .optional()
    .isArray()
    .withMessage("addMembers must be an array."),
  body("addMembers.*.uuid")
    .optional()
    .isUUID()
    .withMessage("Each addMember must have a valid uuid."),
  body("addMembers.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),

  body("roleUpdates")
    .optional()
    .isArray()
    .withMessage("roleUpdates must be an array."),
  body("roleUpdates.*.uuid")
    .optional()
    .isUUID()
    .withMessage("Each roleUpdates item must have a valid uuid."),
  body("roleUpdates.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),
];

export const validateAddMembers = [
  body("members")
    .isArray({ min: 1 })
    .withMessage("Members must be a non-empty array."),
  body("members.*.uuid")
    .isUUID()
    .withMessage("Each member must have a valid uuid."),
  body("members.*.role")
    .optional()
    .isIn(["admin", "member"])
    .withMessage("Role must be either 'admin' or 'member'."),
];
