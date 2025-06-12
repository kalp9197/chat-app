import { prisma } from "../config/database.config.js";

export const getUsersByUuids = async (uuids) => {
  return prisma.user.findMany({
    where: { uuid: { in: uuids } },
    select: { id: true, uuid: true, name: true, email: true },
  });
};

export const getGroupWithMembers = async (groupId) => {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      memberships: {
        include: {
          user: { select: { uuid: true, name: true, email: true } },
        },
      },
    },
  });
};

export const createGroupWithMembers = async (name, memberships) => {
  return prisma.$transaction(async (tx) => {
    return tx.group.create({
      data: {
        name,
        memberships: { create: memberships },
      },
      include: {
        memberships: {
          include: {
            user: { select: { uuid: true, name: true, email: true } },
          },
        },
      },
    });
  });
};

export const findGroupsForUser = async (userId) => {
  return prisma.group.findMany({
    where: {
      memberships: { some: { user_id: userId } },
    },
    include: {
      memberships: {
        include: {
          user: { select: { uuid: true, name: true } },
        },
      },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
  });
};

export const findGroupByUuid = async (groupUuid, userId) => {
  return prisma.group.findFirst({
    where: {
      uuid: groupUuid,
      memberships: { some: { user_id: userId } },
    },
    include: {
      memberships: {
        include: {
          user: { select: { uuid: true, name: true, email: true } },
        },
      },
      messages: {
        orderBy: { created_at: "asc" },
        include: {
          sender: { select: { uuid: true, name: true, email: true } },
        },
      },
    },
  });
};

// Validate group and admin access
export const validateGroupAndAdminAccess = async (groupUuid, userId) => {
  return prisma.group.findFirst({
    where: {
      uuid: groupUuid,
      memberships: {
        some: {
          user_id: userId,
          role: "admin",
        },
      },
    },
    select: { id: true, uuid: true },
  });
};

// Transaction-based group update with all operations
export const updateGroupTransaction = async (groupId, updates) => {
  return prisma.$transaction(async (tx) => {
    const {
      name,
      removeUserIds = [],
      addMemberships = [],
      roleUpdates = [],
    } = updates;

    const results = {};

    // Update group name if provided
    if (name) {
      results.group = await tx.group.update({
        where: { id: groupId },
        data: { name },
      });
    }

    // Remove members if any
    if (removeUserIds.length > 0) {
      results.removedMembers = await tx.groupMembership.deleteMany({
        where: {
          group_id: groupId,
          user_id: { in: removeUserIds },
        },
      });
    }

    // Add new members if any
    if (addMemberships.length > 0) {
      results.addedMembers = await tx.groupMembership.createMany({
        data: addMemberships,
      });
    }

    // Update roles if any
    if (roleUpdates.length > 0) {
      results.roleUpdates = [];
      for (const { userId, role } of roleUpdates) {
        const roleUpdate = await tx.groupMembership.updateMany({
          where: { group_id: groupId, user_id: userId },
          data: { role },
        });
        results.roleUpdates.push(roleUpdate);
      }
    }

    // Ensure at least one admin remains
    const adminCount = await tx.groupMembership.count({
      where: { group_id: groupId, role: "admin" },
    });
    if (adminCount === 0) {
      throw new Error("Group must have at least one admin");
    }

    // Return updated group with members
    results.updatedGroup = await tx.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          include: {
            user: { select: { uuid: true, name: true, email: true } },
          },
        },
      },
    });

    return results.updatedGroup;
  });
};

// Transaction for adding members
export const addMembersTransaction = async (groupId, memberships) => {
  return prisma.$transaction(async (tx) => {
    // Add new memberships
    await tx.groupMembership.createMany({
      data: memberships,
    });

    // Return updated group with all members
    return tx.group.findUnique({
      where: { id: groupId },
      include: {
        memberships: {
          include: {
            user: { select: { uuid: true, name: true, email: true } },
          },
        },
      },
    });
  });
};

// Get existing memberships with user data in transaction
export const getExistingMembershipsTransaction = async (groupId, userUuids) => {
  return prisma.$transaction(async (tx) => {
    const [users, existingMemberships] = await Promise.all([
      tx.user.findMany({
        where: { uuid: { in: userUuids } },
        select: { id: true, uuid: true, name: true, email: true },
      }),
      tx.groupMembership.findMany({
        where: {
          group_id: groupId,
          user: { uuid: { in: userUuids } },
        },
        include: {
          user: { select: { id: true, uuid: true } },
        },
      }),
    ]);

    return { users, existingMemberships };
  });
};

export const deleteGroupByUuid = async (groupUuid) => {
  return prisma.$transaction(async (tx) => {
    // First delete all memberships, then delete the group
    const group = await tx.group.findUnique({
      where: { uuid: groupUuid },
      select: { id: true },
    });

    if (!group) throw new Error("Group not found");

    await tx.groupMembership.deleteMany({
      where: { group_id: group.id },
    });

    return tx.group.delete({
      where: { uuid: groupUuid },
    });
  });
};

// Bulk operations for better performance
export const bulkUserOperations = async (userUuids) => {
  return prisma.user.findMany({
    where: { uuid: { in: userUuids } },
    select: { id: true, uuid: true, name: true, email: true },
  });
};
