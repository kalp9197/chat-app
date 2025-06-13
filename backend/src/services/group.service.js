import { groupRepository } from "../repositories/index.js";

/**
 * Create a new group
 * @param {string} name
 * @param {number} creatorId
 * @param {Object[]} members
 * @returns {Promise<Object>}
 */
export const createGroup = async (name, creatorId, members = []) => {
  const memberUuids = members.map((m) => m.uuid).filter(Boolean);

  // Build role map from incoming members array (uuid -> role)
  const roleMap = Object.fromEntries(
    members.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
  );

  // Get users outside transaction for better performance
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

  // Use transaction for group creation
  return groupRepository.createGroupWithMembers(name, memberships);
};

/**
 * Get all groups for a user
 * @param {number} userId
 * @returns {Promise<Object[]>}
 */
export const getAllGroupsForUser = async (userId) => {
  return groupRepository.findGroupsForUser(userId);
};

/**
 * Get a group by uuid
 * @param {string} groupUuid
 * @param {number} userId
 * @returns {Promise<Object>}
 */
export const getGroupByUuid = async (groupUuid, userId) => {
  const group = await groupRepository.findGroupByUuid(groupUuid, userId);
  const messages = await groupRepository.getGroupMessages(group.id);

  if (!group) throw new Error("Group not found or access denied");

  return { ...group, memberCount: group.memberships.length, messages };
};

/**
 * Update a group by uuid - Transaction version
 * @param {string} groupUuid
 * @param {Object} updates
 * @param {number} requesterId
 * @returns {Promise<Object>}
 */
export const updateGroupByUuid = async (groupUuid, updates, requesterId) => {
  // Validate access first (outside transaction)
  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new Error("Group not found or admin access required");
  }

  const {
    name,
    removeMembers = [],
    addMembers = [],
    roleUpdates = [],
  } = updates;

  // Prepare data outside transaction
  let removeUserIds = [];
  let addMemberships = [];
  let processedRoleUpdates = [];

  // Process all user lookups in parallel outside transaction
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

  // Process remove members
  if (removeMembers.length > 0) {
    removeUserIds = removeMembers
      .map((m) => userMap[m.uuid]?.id)
      .filter(Boolean);
  }

  // Process add members - check existing memberships
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

  // Process role updates
  if (roleUpdates.length > 0) {
    processedRoleUpdates = roleUpdates
      .filter((r) => r.uuid && r.role && userMap[r.uuid])
      .map((r) => ({ userId: userMap[r.uuid].id, role: r.role }));
  }

  // Execute all updates in a single transaction
  return groupRepository.updateGroupTransaction(group.id, {
    name: name?.trim(),
    removeUserIds,
    addMemberships,
    roleUpdates: processedRoleUpdates,
  });
};

/**
 * Delete a group by uuid
 * @param {string} groupUuid
 * @param {number} requesterId
 * @returns {Promise<void>}
 */
export const deleteGroupByUuid = async (groupUuid, requesterId) => {
  // Validate admin access before deletion
  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new Error("Group not found or admin access required");
  }

  // Use transaction for deletion
  await groupRepository.deleteGroupByUuid(groupUuid);
};

/**
 * Add members to a group - Transaction version
 * @param {string} groupUuid
 * @param {Object[]} members
 * @param {number} requesterId
 * @returns {Promise<Object>}
 */
export const addMembersToGroup = async (
  groupUuid,
  members = [],
  requesterId
) => {
  if (!members.length) return { memberships: [], memberCount: 0 };

  // Validate access first
  const group = await groupRepository.validateGroupAndAdminAccess(
    groupUuid,
    requesterId
  );

  if (!group) {
    throw new Error("Group not found or admin access required");
  }

  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  if (!memberUuids.length) return { memberships: [], memberCount: 0 };

  // Get users and existing memberships in transaction
  const { users, existingMemberships } =
    await groupRepository.getExistingMembershipsTransaction(
      group.id,
      memberUuids
    );

  const existingUserIds = new Set(existingMemberships.map((m) => m.user.id));
  const newUsers = users.filter((u) => !existingUserIds.has(u.id));

  if (newUsers.length === 0) {
    // No new users to add, return current group
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

  // Add members in transaction and return updated group
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
