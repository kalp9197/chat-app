import { useState } from 'react';
import { useGroups } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import EditGroupModal from './EditGroupModal';
import AddMembersModal from './AddMembersModal';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GroupDetails = ({ group }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteGroup } = useGroups();
  const { user } = useAuth();

  if (!group || !user) {
    return null;
  }

  const currentUserMembership = group?.memberships?.find((m) => m.user.uuid === user.uuid);
  const isCurrentUserAdmin = currentUserMembership?.role === 'admin';

  const handleDelete = async () => {
    if (isDeleting || !confirm('Delete this group?')) return;

    setIsDeleting(true);
    try {
      await deleteGroup(group.uuid);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center gap-3">
        <img src={group.avatar} alt={group.name} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h2 className="font-semibold">{group.name}</h2>
          <p className="text-sm text-gray-500">{group.memberCount} members</p>
        </div>
      </div>

      {isCurrentUserAdmin && (
        <div className="flex gap-2">
          <Button onClick={() => setShowAddModal(true)} variant="ghost" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowEditModal(true)} variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="icon"
            disabled={isDeleting}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showEditModal && <EditGroupModal group={group} onClose={() => setShowEditModal(false)} />}
      {showAddModal && (
        <AddMembersModal
          groupUuid={group.uuid}
          existingMembers={group.memberships}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default GroupDetails;
