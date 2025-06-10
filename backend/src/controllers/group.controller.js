import * as groupService from "../services/group.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

// Controller to create a new group.
export const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const creatorId = req.user.id; // from authMiddleware

    const newGroup = await groupService.createGroup(name, creatorId);

    res.status(HTTP_STATUS.CREATED).json({
      message: "Group created successfully.",
      data: newGroup,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false,
    });
  }
};

// Controller to get all groups for the logged-in user.
export const getAllGroups = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const groups = await groupService.getAllGroupsForUser(userId);
    res.status(HTTP_STATUS.OK).json({ data: groups });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false,
    });
  }
};

// Controller to get a single group by its UUID.
export const getGroupByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const userId = req.user.id;
    const group = await groupService.getGroupByUuid(uuid, userId);
    res.status(HTTP_STATUS.OK).json({ data: group });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false,
    });
  }
};

// Controller to update a group's details.
export const updateGroupByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    const groupData = req.body;

    const updatedGroup = await groupService.updateGroupByUuid(uuid, groupData);

    res.status(HTTP_STATUS.OK).json({
      message: "Group updated successfully.",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false,
    });
  }
};

// Controller to delete a group.
export const deleteGroupByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;
    await groupService.deleteGroupByUuid(uuid);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      success: false,
    });
  }
};
