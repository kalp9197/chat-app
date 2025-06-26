import { useGroups } from '@/hooks/useGroups';
import EmptyState from '@/components/common/EmptyState';
import { motion as Motion } from 'framer-motion';

const GroupList = ({ onSelectGroup, currentGroupId, onCreateGroup }) => {
  const { groups, fetchGroups, loading, error } = useGroups();

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse">Loading groups...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading groups: {error}
        <button onClick={fetchGroups} className="block mx-auto mt-2 text-blue-500 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

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
                key={group.id || group.uuid}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 cursor-pointer ${
                  currentGroupId === group.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => onSelectGroup(group)}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      src={
                        group.avatar ||
                        `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name || 'group'}`
                      }
                      alt={`${group.name || 'Group'} avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${group.name || 'fallback'}`;
                      }}
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
