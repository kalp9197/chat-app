import { useEffect, useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/common/EmptyState";
import { motion as Motion } from "framer-motion";

const GroupList = ({ onSelectGroup, currentGroupId, onCreateGroup }) => {
  const { groups, fetchGroups, deleteGroup } = useGroups();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDeleteGroup = async (uuid, e) => {
    e.stopPropagation();
    if (isDeleting) return;
    
    if (confirm("Are you sure you want to delete this group?")) {
      setIsDeleting(true);
      try {
        await deleteGroup(uuid);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto">
        {groups.length === 0 ? (
          <EmptyState
            message="No groups yet"
            action={() => onCreateGroup()}
            actionText="Create a group"
          />
        ) : (
          <ul className="divide-y">
            {groups.map((group) => (
              <Motion.li
                key={group.id}
                whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                className={`p-4 cursor-pointer ${
                  currentGroupId === group.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
                onClick={() => onSelectGroup(group)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={group.avatar}
                      alt={`${group.name} group avatar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {group.memberCount || 0} members
                    </p>
                  </div>
                </div>
              </Motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupList; 