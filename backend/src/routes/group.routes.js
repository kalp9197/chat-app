import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import * as Validation from "../validations/groupValidations.js";
import * as groupController from "../controllers/group.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validate(Validation.validateCreateGroup),
  groupController.createGroup
);

router.get("/", groupController.getAllGroups);

router.get(
  "/:uuid",
  validate(Validation.validateGetGroupByUuid),
  groupController.getGroupByUuid
);

router.put(
  "/:uuid",
  validate(Validation.validateUpdateGroup),
  groupController.updateGroupByUuid
);

router.delete(
  "/:uuid",
  validate(Validation.validateDeleteGroupByUuid),
  groupController.deleteGroupByUuid
);

router.post(
  "/:uuid/members",
  validate(Validation.validateAddMembers),
  groupController.addGroupMembers
);

export default router;
