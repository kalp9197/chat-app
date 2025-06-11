import { create } from "zustand";
import * as groupService from "@/services/groupService";

export const useGroups = create((set) => ({
  groups: [],
  loading: false,
  error: null,

  fetchGroups: async () => {
    try {
      set({ loading: true, error: null });
      const groups = await groupService.getAllGroups();

      // Transform groups to include id and avatar
      const formattedGroups = groups.map((group) => ({
        ...group,
        id: `group-${group.uuid}`, // Add id field
        avatar:
          group.avatar ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`,
      }));

      set({ groups: formattedGroups });
      return formattedGroups;
    } catch (error) {
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  createGroup: async (name, members = []) => {
    try {
      set({ loading: true, error: null });
      const newGroup = await groupService.createGroup(name, members);

      // Add id and avatar to new group
      const formattedGroup = {
        ...newGroup,
        id: `group-${newGroup.uuid}`,
        avatar:
          newGroup.avatar ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${newGroup.name}`,
      };

      set((state) => ({
        groups: [...state.groups, formattedGroup],
      }));

      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateGroup: async (uuid, data) => {
    try {
      set({ loading: true, error: null });
      const updatedGroup = await groupService.updateGroup(uuid, data);

      // Add id and avatar to updated group
      const formattedGroup = {
        ...updatedGroup,
        id: `group-${updatedGroup.uuid}`,
        avatar:
          updatedGroup.avatar ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${updatedGroup.name}`,
      };

      set((state) => ({
        groups: state.groups.map((group) =>
          group.uuid === uuid ? formattedGroup : group
        ),
      }));

      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteGroup: async (uuid) => {
    try {
      set({ loading: true, error: null });
      await groupService.deleteGroup(uuid);
      set((state) => ({
        groups: state.groups.filter((group) => group.uuid !== uuid),
      }));
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  addMembers: async (uuid, members) => {
    try {
      set({ loading: true, error: null });
      const memberships = await groupService.addGroupMembers(uuid, members);

      // update group in store (memberCount etc.)
      set((state) => ({
        groups: state.groups.map((g) =>
          g.uuid === uuid ? { ...g, memberCount: memberships.length } : g
        ),
      }));

      return memberships;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },
}));
