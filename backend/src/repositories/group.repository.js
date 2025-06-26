import { prisma } from '../config/database.config.js';
import { logError } from '../helper/logger.js';

//get users by uuids
export const getUsersByUuids = async (uuids) => {
  return prisma.user.findMany({
    where: { uuid: { in: uuids } },
    select: { id: true, uuid: true, name: true, email: true },
  });
};

//get a group with its members
export const getGroupWithMembers = async (groupId) => {
  return prisma.group.findUnique({
    where: { id: groupId, is_active: 1 },
    include: {
      memberships: {
        where: {
          is_active: 1,
        },
        include: {
          user: { select: { uuid: true, name: true, email: true } },
        },
      },
    },
  });
};

//create a group with its members
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

//find groups for a user
export const findGroupsForUser = async (userId) => {
  return prisma.group.findMany({
    where: {
      memberships: { some: { user_id: userId, is_active: 1 } },
      is_active: 1,
    },
    include: {
      memberships: {
        where: {
          is_active: 1,
        },
        include: {
          user: { select: { uuid: true, name: true } },
        },
      },
      messages: {
        where: {
          is_active: 1,
        },
        orderBy: { created_at: 'desc' },
        take: 1,
      },
    },
  });
};

//find a group by uuid
export const findGroupByUuid = async (groupUuid, userId) => {
  return await prisma.group.findFirst({
    where: {
      uuid: groupUuid,
      memberships: { some: { user_id: userId, is_active: 1 } },
      is_active: 1,
    },
    include: {
      memberships: {
        include: {
          user: { select: { uuid: true, name: true, email: true } },
        },
      },
    },
  });
};

//validate group and admin access
export const validateGroupAndAdminAccess = async (groupUuid, userId) => {
  return prisma.group.findFirst({
    where: {
      uuid: groupUuid,
      is_active: 1,
      memberships: {
        some: {
          user_id: userId,
          role: 'admin',
          is_active: 1,
        },
      },
    },
    select: { id: true, uuid: true },
  });
};

//update a group
export const updateGroupTransaction = async (groupId, updates) => {
  return prisma.$transaction(async (tx) => {
    const { name, removeUserIds = [], addMemberships = [], roleUpdates = [] } = updates;
    logError('addMemberships');
    const results = {};

    if (name) {
      results.group = await tx.group.update({
        where: { id: groupId },
        data: { name },
      });
    }

    if (removeUserIds.length > 0) {
      results.removedMembers = await tx.groupMembership.updateMany({
        where: {
          group_id: groupId,
          user_id: { in: removeUserIds },
        },
        data: { is_active: 0 },
      });
    }
    if (addMemberships.length > 0) {
      results.addedMembers = [];
      for (const member of addMemberships) {
        const upserted = await tx.groupMembership.upsert({
          where: {
            user_id_group_id: {
              user_id: member.user_id,
              group_id: member.group_id,
            },
          },
          update: {
            is_active: 1,
            role: member.role,
          },
          create: member,
        });
        results.addedMembers.push(upserted);
      }
      logError('addMemberships' + JSON.stringify(results.addedMembers));
    }

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

    const adminCount = await tx.groupMembership.count({
      where: { group_id: groupId, role: 'admin', is_active: 1 },
    });
    if (adminCount === 0) {
      throw new Error('Group must have at least one admin');
    }

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

//add members to a group
export const addMembersTransaction = async (groupId, memberships) => {
  return prisma.$transaction(async (tx) => {
    await tx.groupMembership.createMany({
      data: memberships,
    });

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

//get existing memberships
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
          is_active: 1,
        },
        include: {
          user: { select: { id: true, uuid: true } },
        },
      }),
    ]);

    return { users, existingMemberships };
  });
};

//delete a group by uuid
export const deleteGroupByUuid = async (groupUuid) => {
  return prisma.$transaction(async (tx) => {
    const group = await tx.group.findUnique({
      where: { uuid: groupUuid },
      select: { id: true },
    });

    if (!group) throw new Error('Group not found');

    await tx.groupMembership.updateMany({
      where: { group_id: group.id },
      data: { is_active: 0 },
    });

    return tx.group.update({
      where: { uuid: groupUuid },
      data: { is_active: 0 },
    });
  });
};

//bulk user operations
export const bulkUserOperations = async (userUuids) => {
  return prisma.user.findMany({
    where: { uuid: { in: userUuids } },
    select: { id: true, uuid: true, name: true, email: true },
  });
};

//send a message to a group
export const sendMessageToGroup = async (groupId, message, senderId) => {
  const { content, message_type = 'text', file_path } = message;
  return prisma.message.create({
    data: {
      group_id: groupId,
      content,
      message_type,
      sender_id: senderId,
      file_path,
    },
    include: {
      sender: { select: { id: true, uuid: true, name: true } },
    },
  });
};

//get messages for a group
export const getGroupMessages = async (groupId, limit, offset) => {
  const whereClause = { group_id: groupId };

  const [messages, totalCount] = await prisma.$transaction([
    prisma.message.findMany({
      where: whereClause,
      select: {
        id: true,
        uuid: true,
        content: true,
        created_at: true,
        message_type: true,
        is_active: true,
        sender: { select: { uuid: true, name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.message.count({ where: whereClause }),
  ]);

  return { messages, totalCount };
};
