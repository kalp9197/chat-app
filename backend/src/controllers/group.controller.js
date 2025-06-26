import * as groupService from '../services/group.service.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';

//create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members } = req.body;
    const data = await groupService.createGroup(name, req.user.id, members);

    return res.status(HTTP_STATUS.CREATED).json({
      message: 'Group created successfully',
      data,
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//get all groups for a user
export const getAllGroups = async (req, res) => {
  try {
    const data = await groupService.getAllGroupsForUser(req.user.id);
    return res.status(HTTP_STATUS.OK).json({ data });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//get a group and its messages by uuid
export const getGroupByUuid = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 0;
    const offset = page * limit;
    const data = await groupService.getGroupByUuid(req.params.uuid, req.user.id, limit, offset);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
      pagination: {
        total: data.totalCount,
        page,
        limit,
        hasMore: offset + data.messages.length < data.totalCount,
      },
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//update a group by uuid
export const updateGroupByUuid = async (req, res) => {
  try {
    const data = await groupService.updateGroupByUuid(req.params.uuid, req.body, req.user.id);

    return res.status(HTTP_STATUS.OK).json({
      message: 'Group updated successfully',
      data,
    });
  } catch (error) {
    console.log(error.message);
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//delete a group by uuid
export const deleteGroupByUuid = async (req, res) => {
  try {
    await groupService.deleteGroupByUuid(req.params.uuid, req.user.id);
    return res.status(HTTP_STATUS.NO_CONTENT).json({
      message: 'Group deleted successfully',
      success: true,
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

//add members to a group
export const addGroupMembers = async (req, res) => {
  try {
    const data = await groupService.addMembersToGroup(
      req.params.uuid,
      req.body.members,
      req.user.id,
    );

    return res.status(HTTP_STATUS.OK).json({
      message: 'Members added successfully',
      data,
    });
  } catch (error) {
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if (error instanceof ApiError) {
      statusCode = error.statusCode;
    }

    return res.status(statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
