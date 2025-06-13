import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/groupValidations.js";
import * as groupController from "../controllers/group.controller.js";

const router = Router();

router.use(authMiddleware); // Apply auth to all routes

// Create a new group
router.post(
  "/",
  validate(Validation.validateCreateGroup),
  groupController.createGroup
);

// Get all groups for user
router.get("/", groupController.getAllGroups);

// Get a group by uuid
router.get(
  "/:uuid",
  validate(Validation.validateGetGroupByUuid),
  groupController.getGroupByUuid
);

// Update a group by uuid
router.put(
  "/:uuid",
  validate(Validation.validateUpdateGroup),
  groupController.updateGroupByUuid
);

// Delete a group by uuid
router.delete(
  "/:uuid",
  validate(Validation.validateDeleteGroupByUuid),
  groupController.deleteGroupByUuid
);

// Add members to a group
router.post(
  "/:uuid/members",
  validate(Validation.validateAddMembers),
  groupController.addGroupMembers
);

export default router;
