import * as groupService from "../services/group.service.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";

export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const data = await groupService.createGroup(name, req.user.id, members);

    return res.status(HTTP_STATUS.CREATED).json({
      message: "Group created successfully",
      data,
    });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const getAllGroups = async (req, res) => {
  try {
    const data = await groupService.getAllGroupsForUser(req.user.id);
    return res.status(HTTP_STATUS.OK).json({ data });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const getGroupByUuid = async (req, res) => {
  try {
    const data = await groupService.getGroupByUuid(
      req.params.uuid,
      req.user.id
    );
    return res.status(HTTP_STATUS.OK).json({ data });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const updateGroupByUuid = async (req, res) => {
  try {
    const data = await groupService.updateGroupByUuid(
      req.params.uuid,
      req.body,
      req.user.id
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Group updated successfully",
      data,
    });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const deleteGroupByUuid = async (req, res) => {
  try {
    await groupService.deleteGroupByUuid(req.params.uuid);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};

export const addGroupMembers = async (req, res) => {
  try {
    const data = await groupService.addMembersToGroup(
      req.params.uuid,
      req.body.members,
      req.user.id
    );

    return res.status(HTTP_STATUS.OK).json({
      message: "Members added successfully",
      data,
    });
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: error.message, success: false });
  }
};
