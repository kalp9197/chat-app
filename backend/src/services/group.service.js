import { groupRepository } from '../repositories/index.js';
import { HTTP_STATUS } from '../constants/statusCodes.js';
import { ApiError } from '../errors/apiError.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logError } from '../helper/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '../../public');

//create a new group
export const createGroup = async (name, creatorId, members = []) => {
  const memberUuids = members.map((m) => m.uuid).filter(Boolean);

  const roleMap = Object.fromEntries(
    members.map((m) => [m.uuid, m.role === 'admin' ? 'admin' : 'member']),
  );

  const users = memberUuids.length > 0 ? await groupRepository.bulkUserOperations(memberUuids) : [];

  const memberships = [
    { user_id: creatorId, role: 'admin' },
    ...users
      .filter((u) => u.id !== creatorId)
      .map((u) => ({
        user_id: u.id,
        role: roleMap[u.uuid] || 'member',
      })),
  ];

  return groupRepository.createGroupWithMembers(name, memberships);
};

//get all groups for a user
export const getAllGroupsForUser = async (userId) => {
  return groupRepository.findGroupsForUser(userId);
};

//get a group and its messages by uuid
export const getGroupByUuid = async (groupUuid, userId, limit, offset) => {
  const group = await groupRepository.findGroupByUuid(groupUuid, userId);

  if (!group) {
    throw new ApiError(
      'Group not found or you are not a member of this group',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const { messages, totalCount } = await groupRepository.getGroupMessages(group.id, limit, offset);

  const processedMessages = await Promise.all(
    messages.map(async (message) => {
      if (message.is_active === 0) {
        return {
          ...message,
          content: 'This message was deleted',
          message_type: 'text',
        };
      }
      if (message.message_type === 'file') {
        let content;
        try {
          content = JSON.parse(message.content);
        } catch {
          return {
            ...message,
            content: {
              fileName: 'Invalid File',
              error: 'Corrupted message data',
            },
          };
        }

        if (content && content.filePath) {
          try {
            const filePath = path.join(PUBLIC_DIR, content.filePath);
            const fileData = await fs.readFile(filePath);
            const base64Data = fileData.toString('base64');
            content.data = base64Data;
            delete content.filePath;
          } catch (err) {
            logError('getGroupByUuid', err, { messageId: message.id });
            content.data = null;
            content.error = 'File not found';
            delete content.filePath;
          }
        }
        return { ...message, content };
      }
      return message;
    }),
  );

  return {
    ...group,
    memberCount: group.memberships.length,
    messages: processedMessages.reverse(),
    totalCount,
  };
};

//update a group by uuid
export const updateGroupByUuid = async (groupUuid, updates, requesterId) => {
  const group = await groupRepository.validateGroupAndAdminAccess(groupUuid, requesterId);
  if (!group) {
    throw new ApiError('Group not found or admin access required', HTTP_STATUS.NOT_FOUND);
  }

  const { name, removeMembers = [], addMembers = [], roleUpdates = [] } = updates;

  let removeUserIds = [];
  let addMemberships = [];
  let processedRoleUpdates = [];
  const allUuids = [
    ...removeMembers.map((m) => m.uuid),
    ...addMembers.map((m) => m.uuid),
    ...roleUpdates.map((r) => r.uuid),
  ].filter(Boolean);

  let allUsers = [];
  if (allUuids.length > 0) {
    allUsers = await groupRepository.bulkUserOperations([...new Set(allUuids)]);
  }

  const userMap = Object.fromEntries(allUsers.map((u) => [u.uuid, u]));

  if (removeMembers.length > 0) {
    removeUserIds = removeMembers.map((m) => userMap[m.uuid]?.id).filter(Boolean);
  }

  if (addMembers.length > 0) {
    const addUuids = addMembers.map((m) => m.uuid).filter(Boolean);
    if (addUuids.length > 0) {
      const { users: usersToAdd } = await groupRepository.getExistingMembershipsTransaction(
        group.id,
        addUuids,
      );

      const roleMap = Object.fromEntries(
        addMembers.map((m) => [m.uuid, m.role === 'admin' ? 'admin' : 'member']),
      );

      addMemberships = usersToAdd.map((u) => ({
        user_id: u.id,
        group_id: group.id,
        role: roleMap[u.uuid] || 'member',
      }));
    }
  }

  if (roleUpdates.length > 0) {
    processedRoleUpdates = roleUpdates
      .filter((r) => r.uuid && r.role && userMap[r.uuid])
      .map((r) => ({ userId: userMap[r.uuid].id, role: r.role }));
  }

  return groupRepository.updateGroupTransaction(group.id, {
    name: name?.trim(),
    removeUserIds,
    addMemberships,
    roleUpdates: processedRoleUpdates,
  });
};

//delete a group by uuid
export const deleteGroupByUuid = async (groupUuid, requesterId) => {
  const group = await groupRepository.validateGroupAndAdminAccess(groupUuid, requesterId);

  if (!group) {
    throw new ApiError('Group not found or admin access required', HTTP_STATUS.NOT_FOUND);
  }

  await groupRepository.deleteGroupByUuid(groupUuid);
};

//add members to a group
export const addMembersToGroup = async (groupUuid, members = [], requesterId) => {
  if (!members.length) return { memberships: [], memberCount: 0 };

  const group = await groupRepository.validateGroupAndAdminAccess(groupUuid, requesterId);

  if (!group) {
    throw new ApiError('Group not found or admin access required', HTTP_STATUS.NOT_FOUND);
  }

  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  if (!memberUuids.length) return { memberships: [], memberCount: 0 };

  const { users } = await groupRepository.getExistingMembershipsTransaction(group.id, memberUuids);

  const roleMap = Object.fromEntries(
    members.map((m) => [m.uuid, m.role === 'admin' ? 'admin' : 'member']),
  );

  const newMemberships = users.map((u) => ({
    user_id: u.id,
    group_id: group.id,
    role: roleMap[u.uuid] || 'member',
  }));

  const updatedGroup = await groupRepository.addMembersTransaction(group.id, newMemberships);

  const memberships = updatedGroup.memberships.map((m) => ({
    uuid: m.user.uuid,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return { memberships, memberCount: memberships.length };
};
