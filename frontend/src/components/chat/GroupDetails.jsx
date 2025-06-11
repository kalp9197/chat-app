import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import EditGroupModal from "./EditGroupModal";
import AddMembersModal from "./AddMembersModal";
import { Pencil, Trash2 } from "lucide-react";

const GroupDetails = ({ group }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { deleteGroup } = useGroups();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    if (confirm("Are you sure you want to delete this group?")) {
      setIsDeleting(true);
      try {
        await deleteGroup(group.uuid);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!group) return null;

  return (
    <div className="p-4 border-b flex justify-between items-center bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          <img
            src={group.avatar}
            alt={`${group.name} group avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="font-semibold">{group.name}</h2>
          <p className="text-sm text-gray-500">
            {group.memberCount || 0} members
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => setShowAddModal(true)}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
        >
          +
        </Button>
        <Button
          onClick={() => setShowEditModal(true)}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleDelete}
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {showEditModal && (
        <EditGroupModal group={group} onClose={() => setShowEditModal(false)} />
      )}
      {showAddModal && (
        <AddMembersModal
          groupUuid={group.uuid}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default GroupDetails;
