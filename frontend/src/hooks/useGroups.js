import { create } from 'zustand';
import * as groupService from '@/services/groupService';
import { websocketService } from '@/services/websocketService';

const formatGroup = (group) => ({
  ...group,
  id: `group-${group.uuid}`,
  avatar: group.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name}`,
  memberCount: group.memberCount ?? group.memberships?.length ?? 0,
});

const useGroupsStore = create((set) => ({
  groups: [],
  loading: false,
  error: null,
  activeGroup: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const groups = await groupService.getAllGroups();
      const formattedGroups = groups.map(formatGroup);
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
    set({ loading: true, error: null });
    try {
      const newGroup = await groupService.createGroup(name, members);
      const formattedGroup = formatGroup(newGroup);
      set((state) => ({ groups: [...state.groups, formattedGroup] }));
      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateGroup: async (uuid, data) => {
    set({ loading: true, error: null });
    try {
      const updatedGroup = await groupService.updateGroup(uuid, data);
      const formattedGroup = formatGroup(updatedGroup);

      set((state) => {
        const groups = state.groups.map((group) => (group.uuid === uuid ? formattedGroup : group));
        return {
          groups,
          activeGroup: state.activeGroup?.uuid === uuid ? formattedGroup : state.activeGroup,
        };
      });

      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteGroup: async (uuid) => {
    set({ loading: true, error: null });
    try {
      await groupService.deleteGroup(uuid);
      set((state) => ({
        groups: state.groups.filter((group) => group.uuid !== uuid),
        activeGroup: state.activeGroup?.uuid === uuid ? null : state.activeGroup,
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
    set({ loading: true, error: null });
    try {
      const updatedGroup = await groupService.addGroupMembers(uuid, members);
      let formattedGroup = formatGroup(updatedGroup);

      set((state) => {
        const existingGroup = state.groups.find((g) => g.uuid === uuid);
        if (existingGroup) {
          if (!formattedGroup.name)
            formattedGroup = { ...formattedGroup, name: existingGroup.name };
          if (!formattedGroup.avatar)
            formattedGroup = {
              ...formattedGroup,
              avatar: existingGroup.avatar,
            };
        }

        const groupExists = !!existingGroup;
        const groups = groupExists
          ? state.groups.map((g) => (g.uuid === uuid ? formattedGroup : g))
          : [...state.groups, formattedGroup];

        return {
          groups,
          activeGroup: state.activeGroup?.uuid === uuid ? formattedGroup : state.activeGroup,
        };
      });

      return formattedGroup;
    } catch (error) {
      set({ error: error.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  setActiveGroup: (group) => set({ activeGroup: group }),

  _handleMemberCountUpdate: (payload) => {
    const { groupUuid, memberCount } = payload;
    set((state) => ({
      groups: state.groups.map((group) =>
        group.uuid === groupUuid ? { ...group, memberCount } : group,
      ),
      activeGroup:
        state.activeGroup?.uuid === groupUuid
          ? { ...state.activeGroup, memberCount }
          : state.activeGroup,
    }));
  },

  _handleGroupDeleted: (payload) => {
    const { groupUuid } = payload;
    set((state) => ({
      groups: state.groups.filter((g) => g.uuid !== groupUuid),
      activeGroup: state.activeGroup?.uuid === groupUuid ? null : state.activeGroup,
    }));
  },
}));

websocketService.on(
  'GROUP_MEMBER_COUNT_UPDATED',
  useGroupsStore.getState()._handleMemberCountUpdate,
);
websocketService.on('GROUP_DELETED', useGroupsStore.getState()._handleGroupDeleted);

export const useGroups = useGroupsStore;
