import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/groupValidations.js";
import * as groupController from "../controllers/group.controller.js";

const router = express.Router();

// Create a new group for the logged-in user
router.post(
  "/",
  authMiddleware,
  validate(Validation.validateCreateGroup),
  groupController.createGroup
);

// Get all groups for the logged-in user
router.get("/", authMiddleware, groupController.getAllGroups);

// Get group by GroupUuid
router.get("/:uuid", authMiddleware, groupController.getGroupByUuid);

// Update group by GroupUuid
router.put(
  "/:uuid",
  authMiddleware,
  validate(Validation.validateUpdateGroup),
  groupController.updateGroupByUuid
);

// Delete group by GroupUuid
router.delete("/:uuid", authMiddleware, groupController.deleteGroupByUuid);

// Add members to group
router.post(
  "/:uuid/members",
  authMiddleware,
  validate(Validation.validateAddMembers),
  groupController.addGroupMembers
);

export default router;
