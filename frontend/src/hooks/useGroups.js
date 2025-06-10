import { create } from "zustand";
import * as groupService from "@/services/groupService";

export const useGroups = create((set) => ({
  groups: [],
  activeGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    try {
      set({ loading: true, error: null });
      const groups = await groupService.getAllGroups();
      
      set({ 
        groups: groups.map(group => ({
          ...group,
          id: `group-${group.uuid}`, // Prefix ID to differentiate from direct chats
          avatar: group.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`,
        }))
      });
      return groups;
    } catch (error) {
      set({ error: error.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  getGroup: async (uuid) => {
    if (!uuid) return null;
    
    try {
      set({ loading: true, error: null });
      const group = await groupService.getGroupByUuid(uuid);
      return {
        ...group,
        id: `group-${group.uuid}`,
        avatar: group.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`,
      };
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setActiveGroup: (group) => {
    set({ activeGroup: group });
  },

  createGroup: async (name) => {
    try {
      set({ loading: true, error: null });
      const newGroup = await groupService.createGroup(name);
      
      const formattedGroup = {
        ...newGroup,
        id: `group-${newGroup.uuid}`,
        avatar: newGroup.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${newGroup.name}`,
      };

      set((state) => ({
        groups: [...state.groups, formattedGroup]
      }));
      
      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateGroup: async (uuid, groupData) => {
    try {
      set({ loading: true, error: null });
      const updatedGroup = await groupService.updateGroup(uuid, groupData);
      
      const formattedGroup = {
        ...updatedGroup,
        id: `group-${updatedGroup.uuid}`,
        avatar: updatedGroup.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${updatedGroup.name}`,
      };

      set((state) => ({
        groups: state.groups.map(g => 
          g.uuid === uuid ? formattedGroup : g
        ),
        activeGroup: state.activeGroup?.uuid === uuid 
          ? formattedGroup 
          : state.activeGroup
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
        groups: state.groups.filter(g => g.uuid !== uuid),
        activeGroup: state.activeGroup?.uuid === uuid 
          ? null 
          : state.activeGroup
      }));
      
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    } finally {
      set({ loading: false });
    }
  }
})); 