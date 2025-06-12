import { useState, useEffect } from "react";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { motion as Motion } from "framer-motion";

const MemberRow = ({ member, removeMode, onToggleRemove, onRoleChange }) => (
  <li className="flex items-center gap-2 px-3 py-2 border-b last:border-none">
    {removeMode && (
      <input
        type="checkbox"
        checked={member.remove}
        onChange={(e) => onToggleRemove(member.uuid, e.target.checked)}
      />
    )}
    <span className="flex-1">{member.name}</span>
    {!member.remove && (
      <select
        className="border rounded px-1 py-0.5 text-xs"
        value={member.newRole}
        onChange={(e) => onRoleChange(member.uuid, e.target.value)}
      >
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
    )}
  </li>
);

const EditGroupModal = ({ group, onClose }) => {
  const { updateGroup } = useGroups();
  const [name, setName] = useState("");
  const [members, setMembers] = useState([]);
  const [removeMode, setRemoveMode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || "");
      setMembers(
        (group.memberships || []).map((m) => ({
          uuid: m.user.uuid,
          name: m.user.name,
          role: m.role,
          newRole: m.role,
          remove: false,
        }))
      );
    }
  }, [group]);

  const handleToggleRemove = (uuid, remove) => {
    setMembers((prev) =>
      prev.map((m) => (m.uuid === uuid ? { ...m, remove } : m))
    );
  };

  const handleRoleChange = (uuid, newRole) => {
    setMembers((prev) =>
      prev.map((m) => (m.uuid === uuid ? { ...m, newRole } : m))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = { name: name.trim() };

      const removeMembers = members
        .filter((m) => m.remove)
        .map((m) => ({ uuid: m.uuid }));
      const roleUpdates = members
        .filter((m) => !m.remove && m.newRole !== m.role)
        .map((m) => ({ uuid: m.uuid, role: m.newRole }));

      if (removeMembers.length) payload.removeMembers = removeMembers;
      if (roleUpdates.length) payload.roleUpdates = roleUpdates;

      const result = await updateGroup(group.uuid, payload);
      if (result) onClose();
    } catch (error) {
      setError(error.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <Motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Group</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setRemoveMode(!removeMode)}
            >
              {removeMode ? "Cancel Remove" : "Remove Members"}
            </Button>
          </div>

          <div className="mb-4 max-h-60 overflow-y-auto border rounded">
            <ul>
              {members.map((member) => (
                <MemberRow
                  key={member.uuid}
                  member={{ ...member, newRole: member.newRole }}
                  removeMode={removeMode}
                  onToggleRemove={handleToggleRemove}
                  onRoleChange={handleRoleChange}
                />
              ))}
            </ul>
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

export default EditGroupModal;
