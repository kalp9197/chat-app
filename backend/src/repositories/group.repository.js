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
  return prisma.group.create({
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

export const getGroupById = async (groupId) => {
  return prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true },
  });
};

export const updateGroupName = async (groupId, name) => {
  return prisma.group.update({
    where: { id: groupId },
    data: { name },
  });
};

export const deleteGroupByUuid = async (groupUuid) => {
  return prisma.group.delete({ where: { uuid: groupUuid } });
};

export const findGroupMembership = async (groupId, userId) => {
  return prisma.groupMembership.findFirst({
    where: { group_id: groupId, user_id: userId },
  });
};

export const deleteMemberships = async (groupId, userIds) => {
  return prisma.groupMembership.deleteMany({
    where: {
      group_id: groupId,
      user_id: { in: userIds },
    },
  });
};

export const createMemberships = async (memberships) => {
  return prisma.groupMembership.createMany({
    data: memberships,
  });
};

export const findMemberships = async (groupId, userIds) => {
  return prisma.groupMembership.findMany({
    where: { group_id: groupId, user_id: { in: userIds } },
    select: { user_id: true },
  });
};

export const updateMembershipRole = async (groupId, userId, role) => {
  return prisma.groupMembership.updateMany({
    where: { group_id: groupId, user_id: userId },
    data: { role },
  });
};
