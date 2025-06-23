import { groupRepository } from "../repositories/index.js";
import { HTTP_STATUS } from "../constants/statusCodes.js";
import { ApiError } from "../errors/apiError.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "../../public");

export const createGroup = async (name, creatorId, members = []) => {
  const memberUuids = members.map((m) => m.uuid).filter(Boolean);

  const roleMap = Object.fromEntries(
    members.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
  );

  const users =
    memberUuids.length > 0
      ? await groupRepository.bulkUserOperations(memberUuids)
      : [];

  const memberships = [
    { user_id: creatorId, role: "admin" },
    ...users
      .filter((u) => u.id !== creatorId)
      .map((u) => ({
        user_id: u.id,
        role: roleMap[u.uuid] || "member",
      })),
  ];

  return groupRepository.createGroupWithMembers(name, memberships);
};

export const getAllGroupsForUser = async (userId) => {
  return groupRepository.findGroupsForUser(userId);
};

export const getGroupByUuid = async (groupUuid, userId, limit, offset) => {
  const group = await groupRepository.findGroupByUuid(groupUuid, userId);
  const messages = await groupRepository.getGroupMessages(
    group.id,
    limit,
    offset
  );

  const processedMessages = await Promise.all(
    messages.map(async (message) => {
      if (message.message_type === "file") {
        let content;
        try {
          content = JSON.parse(message.content);
        } catch (parseError) {
          console.error(
            `Failed to parse message content for message ${message.id}: ${parseError.message}`
          );
          return {
            ...message,
            content: {
              fileName: "Invalid File",
              error: "Corrupted message data",
            },
          };
        }

        if (content && content.filePath) {
          try {
            const filePath = path.join(PUBLIC_DIR, content.filePath);
            const fileData = await fs.readFile(filePath);
            const base64Data = fileData.toString("base64");
            content.data = base64Data;
            delete content.filePath;
          } catch (err) {
            console.error(
              `Failed to read file for message ${message.id}: ${err.message}`
            );
            content.data = null;
            content.error = "File not found";
            delete content.filePath;
          }
        }
        return { ...message, content };
      }
      return message;
    })
  );

  return {
    ...group,
    memberCount: group.memberships.length,
    messages: processedMessages.reverse(),
  };
};

export const updateGroupByUuid = async (groupUuid, updates, requesterId) => {
  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new ApiError(
      "Group not found or admin access required",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const {
    name,
    removeMembers = [],
    addMembers = [],
    roleUpdates = [],
  } = updates;

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
    removeUserIds = removeMembers
      .map((m) => userMap[m.uuid]?.id)
      .filter(Boolean);
  }

  if (addMembers.length > 0) {
    const addUuids = addMembers.map((m) => m.uuid).filter(Boolean);
    if (addUuids.length > 0) {
      const { users: usersToAdd, existingMemberships } =
        await groupRepository.getExistingMembershipsTransaction(
          group.id,
          addUuids
        );

      const existingUserIds = new Set(
        existingMemberships.map((m) => m.user.id)
      );
      const roleMap = Object.fromEntries(
        addMembers.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
      );

      addMemberships = usersToAdd
        .filter((u) => !existingUserIds.has(u.id))
        .map((u) => ({
          user_id: u.id,
          group_id: group.id,
          role: roleMap[u.uuid] || "member",
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

export const deleteGroupByUuid = async (groupUuid, requesterId) => {
  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new ApiError(
      "Group not found or admin access required",
      HTTP_STATUS.NOT_FOUND
    );
  }

  await groupRepository.deleteGroupByUuid(groupUuid);
};

export const addMembersToGroup = async (
  groupUuid,
  members = [],
  requesterId
) => {
  if (!members.length) return { memberships: [], memberCount: 0 };

  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new ApiError(
      "Group not found or admin access required",
      HTTP_STATUS.NOT_FOUND
    );
  }

  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  if (!memberUuids.length) return { memberships: [], memberCount: 0 };

  const { users, existingMemberships } =
    await groupRepository.getExistingMembershipsTransaction(
      group.id,
      memberUuids
    );

  const existingUserIds = new Set(existingMemberships.map((m) => m.user.id));
  const newUsers = users.filter((u) => !existingUserIds.has(u.id));

  if (newUsers.length === 0) {
    const currentGroup = await groupRepository.getGroupWithMembers(group.id);
    const memberships = currentGroup.memberships.map((m) => ({
      uuid: m.user.uuid,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
    }));
    return { memberships, memberCount: memberships.length };
  }

  const roleMap = Object.fromEntries(
    members.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
  );

  const newMemberships = newUsers.map((u) => ({
    user_id: u.id,
    group_id: group.id,
    role: roleMap[u.uuid] || "member",
  }));

  const updatedGroup = await groupRepository.addMembersTransaction(
    group.id,
    newMemberships
  );

  const memberships = updatedGroup.memberships.map((m) => ({
    uuid: m.user.uuid,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return { memberships, memberCount: memberships.length };
};
