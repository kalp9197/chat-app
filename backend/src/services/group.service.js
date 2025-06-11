import { groupRepository, userRepository } from "../repositories/index.js";

/**
 * Create a new group
 * @param {string} name
 * @param {number} creatorId
 * @param {Object[]} members
 * @returns {Promise<Object>} //return group
 */
export const createGroup = async (name, creatorId, members = []) => {
  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  const users = await groupRepository.getUsersByUuids(memberUuids);

  const memberships = [
    { user_id: creatorId, role: "admin" },
    ...users
      .filter((u) => u.id !== creatorId)
      .map((u) => ({ user_id: u.id, role: "member" })),
  ];

  return groupRepository.createGroupWithMembers(name, memberships);
};

/**
 * Get all groups for a user
 * @param {number} userId
 * @returns {Promise<Object[]>} //return groups
 */
export const getAllGroupsForUser = async (userId) => {
  return groupRepository.findGroupsForUser(userId);
};

/**
 * Get a group by uuid
 * @param {string} groupUuid
 * @param {number} userId
 * @returns {Promise<Object>} //return group
 */
export const getGroupByUuid = async (groupUuid, userId) => {
  const group = await groupRepository.findGroupByUuid(groupUuid, userId);

  if (!group) throw new Error("Group not found or access denied");

  return { ...group, memberCount: group.memberships.length };
};

/**
 * Update a group by uuid
 * @param {string} groupUuid
 * @param {Object} updates
 * @param {number} requesterId
 * @returns {Promise<Object>} //return updated group
 */
export const updateGroupByUuid = async (groupUuid, updates, requesterId) => {
  const groupRecord = await groupRepository.getGroupByUuid(groupUuid);
  const group = groupRecord;

  if (!group) throw new Error("Group not found");

  const membership = await groupRepository.findGroupMembership(
    group.id,
    requesterId
  );

  if (membership?.role !== "admin") {
    throw new Error("Admin access required");
  }

  const {
    name,
    removeMembers = [],
    addMembers = [],
    roleUpdates = [],
  } = updates;

  // Update name
  if (name?.trim()) {
    await groupRepository.updateGroupName(group.id, name.trim());
  }

  // Remove members
  if (removeMembers.length) {
    const uuids = removeMembers.map((m) => m.uuid).filter(Boolean);
    const users = await groupRepository.getUsersByUuids(uuids);
    await groupRepository.deleteMemberships(
      group.id,
      users.map((u) => u.id)
    );
  }

  // Add members
  if (addMembers.length) {
    await addMembersToGroup(groupUuid, addMembers, requesterId);
  }

  // Update roles
  for (const { uuid, role } of roleUpdates) {
    if (uuid && role) {
      const user = await userRepository.findUserByUuid(uuid);
      if (user) {
        await groupRepository.updateMembershipRole(group.id, user.id, role);
      }
    }
  }

  return groupRepository.getGroupWithMembers(group.id);
};

/**
 * Delete a group by uuid
 * @param {string} groupUuid
 * @returns {Promise<void>}
 */
export const deleteGroupByUuid = async (groupUuid) => {
  const groupRecord2 = await groupRepository.getGroupByUuid(groupUuid);
  const group = groupRecord2;
  if (!group) throw new Error("Group not found");

  await groupRepository.deleteGroupByUuid(groupUuid);
};

/**
 * Add members to a group
 * @param {string} groupUuid
 * @param {Object[]} members
 * @param {number} requesterId
 * @returns {Promise<Object>} //return updated group
 */
export const addMembersToGroup = async (
  groupUuid,
  members = [],
  requesterId
) => {
  const groupRecord3 = await groupRepository.getGroupByUuid(groupUuid);
  const group = groupRecord3;

  if (!group) throw new Error("Group not found");

  if (requesterId) {
    const membership = await groupRepository.findGroupMembership(
      group.id,
      requesterId
    );
    if (membership?.role !== "admin") {
      throw new Error("Admin access required");
    }
  }

  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  if (!memberUuids.length) return { memberships: [], memberCount: 0 };

  const users = await groupRepository.getUsersByUuids(memberUuids);

  // Get existing members
  const existing = await groupRepository.findMemberships(
    group.id,
    users.map((u) => u.id)
  );

  const existingIds = new Set(existing.map((m) => m.user_id));
  const newUsers = users.filter((u) => !existingIds.has(u.id));

  if (newUsers.length) {
    const roleMap = Object.fromEntries(
      members.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
    );

    const newMemberships = newUsers.map((u) => ({
      user_id: u.id,
      group_id: group.id,
      role: roleMap[u.uuid] || "member",
    }));

    await groupRepository.createMemberships(newMemberships);
  }

  const updatedGroup = await groupRepository.getGroupWithMembers(group.id);
  const memberships = updatedGroup.memberships.map((m) => ({
    uuid: m.user.uuid,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return { memberships, memberCount: memberships.length };
};
