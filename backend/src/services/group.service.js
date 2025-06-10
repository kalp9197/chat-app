import { prisma } from "../config/database.config.js";

/**
 * Create a new group with members.
 * @param {string} name - The name of the group.
 * @param {string[]} memberUuids - An array of member UUIDs to add to the group.
 * @param {string} creatorId - The ID of the user creating the group.
 * @returns {Promise<object>} The created group with its members.
 */
export const createGroup = async (name, creatorId) => {
  const newGroup = await prisma.group.create({
    data: {
      name,
      memberships: {
        create: {
          user_id: creatorId,
          role: "admin",
        },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { uuid: true, name: true, email: true },
          },
        },
      },
    },
  });

  return newGroup;
};

/**
 * Get all groups for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object[]>} A list of groups the user is a member of.
 */
export const getAllGroupsForUser = async (userId) => {
  return prisma.group.findMany({
    where: {
      memberships: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { uuid: true, name: true },
          },
        },
      },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
};

/**
 * Get a group by its UUID, ensuring the user is a member.
 * @param {string} groupUuid - The UUID of the group.
 * @param {string} userId - The ID of the user requesting the group.
 * @returns {Promise<object>} The group details.
 */
export const getGroupByUuid = async (groupUuid, userId) => {
  const group = await prisma.group.findFirst({
    where: {
      uuid: groupUuid,
      memberships: {
        some: {
          user_id: userId,
        },
      },
    },
    include: {
      memberships: {
        include: {
          user: {
            select: { uuid: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!group) {
    throw new Error("Group not found or you are not a member.");
  }

  return group;
};

/**
 * Update a group's name.
 * @param {string} groupUuid - The UUID of the group to update.
 * @param {object} groupData - The data to update (e.g., { name }).
 * @returns {Promise<object>} The updated group.
 */
export const updateGroupByUuid = async (groupUuid, groupData) => {
  const group = await prisma.group.update({
    where: { uuid: groupUuid },
    data: groupData,
  });

  if (!group) {
    throw new Error("Group not found.");
  }

  return group;
};

/**
 * Delete a group by its UUID.
 * @param {string} groupUuid - The UUID of the group to delete.
 * @returns {Promise<void>}
 */
export const deleteGroupByUuid = async (groupUuid) => {
  const group = await prisma.group.findUnique({ where: { uuid: groupUuid } });

  if (!group) {
    throw new Error("Group not found.");
  }

  // Prisma's cascading delete will handle memberships and messages
  await prisma.group.delete({ where: { uuid: groupUuid } });
};
