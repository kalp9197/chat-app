import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion as Motion } from "framer-motion";
import { getAllUsers } from "@/services/userService";
import { useGroups } from "@/hooks/useGroups";



const AddMembersModal = ({ groupUuid, existingMembers = [], onClose }) => {
  const { addMembers } = useGroups();
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await getAllUsers();
      const existingUuids = new Set(existingMembers.map((m) => m.user.uuid));
      setAllUsers(users.filter((u) => !existingUuids.has(u.uuid)));
    };
    fetchUsers();
  }, [existingMembers]);

  const handleToggle = (user, checked) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, { ...user, role: "member" }]);
    } else {
      setSelectedUsers((prev) => prev.filter((u) => u.uuid !== user.uuid));
    }
  };

  const handleRoleChange = (uuid, role) => {
    setSelectedUsers((prev) =>
      prev.map((u) => (u.uuid === uuid ? { ...u, role } : u))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUsers.length) {
      setError("Select at least one user");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const members = selectedUsers.map((u) => ({
        uuid: u.uuid,
        role: u.role,
      }));
      const res = await addMembers(groupUuid, members);
      if (res) onClose();
    } catch (err) {
      setError(err.message || "Error adding members");
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
        <h2 className="text-xl font-semibold mb-4">Add Members</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Users
            </label>
            <ul className="border rounded-md max-h-60 overflow-y-auto">
              {allUsers.map((user) => {
                const selected = selectedUsers.find(
                  (u) => u.uuid === user.uuid
                );
                return (
                  <li key={user.uuid} className="px-3 py-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={(e) => handleToggle(user, e.target.checked)}
                    />
                    <span className="flex-1">{user.name}</span>
                    {selected && (
                      <select
                        className="border rounded px-1 py-0.5 text-xs"
                        value={selected.role || "member"}
                        onChange={(e) => handleRoleChange(user.uuid, e.target.value)}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </li>
                );
              })}
            </ul>
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

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
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  );
};

export default AddMembersModal;
