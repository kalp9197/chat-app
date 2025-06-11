import { prisma } from "../config/database.config.js";

const getUsersByUuids = async (uuids) => {
  return prisma.user.findMany({
    where: { uuid: { in: uuids } },
    select: { id: true, uuid: true, name: true, email: true },
  });
};

const getGroupWithMembers = async (groupId) => {
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

export const createGroup = async (name, creatorId, members = []) => {
  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  const users = await getUsersByUuids(memberUuids);

  const memberships = [
    { user_id: creatorId, role: "admin" },
    ...users
      .filter((u) => u.id !== creatorId)
      .map((u) => ({ user_id: u.id, role: "member" })),
  ];

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

export const getAllGroupsForUser = async (userId) => {
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

export const getGroupByUuid = async (groupUuid, userId) => {
  const group = await prisma.group.findFirst({
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

  if (!group) throw new Error("Group not found or access denied");

  return { ...group, memberCount: group.memberships.length };
};

export const updateGroupByUuid = async (groupUuid, updates, requesterId) => {
  const group = await prisma.group.findUnique({
    where: { uuid: groupUuid },
    select: { id: true },
  });

  if (!group) throw new Error("Group not found");

  const membership = await prisma.groupMembership.findFirst({
    where: { group_id: group.id, user_id: requesterId },
  });

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
    await prisma.group.update({
      where: { id: group.id },
      data: { name: name.trim() },
    });
  }

  // Remove members
  if (removeMembers.length) {
    const uuids = removeMembers.map((m) => m.uuid).filter(Boolean);
    const users = await getUsersByUuids(uuids);
    await prisma.groupMembership.deleteMany({
      where: {
        group_id: group.id,
        user_id: { in: users.map((u) => u.id) },
      },
    });
  }

  // Add members
  if (addMembers.length) {
    await addMembersToGroup(groupUuid, addMembers, requesterId);
  }

  // Update roles
  for (const { uuid, role } of roleUpdates) {
    if (uuid && role) {
      const user = await prisma.user.findUnique({
        where: { uuid },
        select: { id: true },
      });
      if (user) {
        await prisma.groupMembership.updateMany({
          where: { group_id: group.id, user_id: user.id },
          data: { role },
        });
      }
    }
  }

  return getGroupWithMembers(group.id);
};

export const deleteGroupByUuid = async (groupUuid) => {
  const group = await prisma.group.findUnique({ where: { uuid: groupUuid } });
  if (!group) throw new Error("Group not found");

  await prisma.group.delete({ where: { uuid: groupUuid } });
};

export const addMembersToGroup = async (
  groupUuid,
  members = [],
  requesterId
) => {
  const group = await prisma.group.findUnique({
    where: { uuid: groupUuid },
    select: { id: true },
  });

  if (!group) throw new Error("Group not found");

  if (requesterId) {
    const membership = await prisma.groupMembership.findFirst({
      where: { group_id: group.id, user_id: requesterId },
    });
    if (membership?.role !== "admin") {
      throw new Error("Admin access required");
    }
  }

  const memberUuids = members.map((m) => m.uuid).filter(Boolean);
  if (!memberUuids.length) return { memberships: [], memberCount: 0 };

  const users = await getUsersByUuids(memberUuids);

  // Get existing members
  const existing = await prisma.groupMembership.findMany({
    where: { group_id: group.id, user_id: { in: users.map((u) => u.id) } },
    select: { user_id: true },
  });

  const existingIds = new Set(existing.map((m) => m.user_id));
  const newUsers = users.filter((u) => !existingIds.has(u.id));

  if (newUsers.length) {
    const roleMap = Object.fromEntries(
      members.map((m) => [m.uuid, m.role === "admin" ? "admin" : "member"])
    );

    await prisma.groupMembership.createMany({
      data: newUsers.map((u) => ({
        user_id: u.id,
        group_id: group.id,
        role: roleMap[u.uuid] || "member",
      })),
    });
  }

  const updatedGroup = await getGroupWithMembers(group.id);
  const memberships = updatedGroup.memberships.map((m) => ({
    uuid: m.user.uuid,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
  }));

  return { memberships, memberCount: memberships.length };
};
