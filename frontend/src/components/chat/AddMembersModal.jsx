import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion as Motion } from "framer-motion";
import { getAllUsers } from "@/services/userService";
import { useGroups } from "@/hooks/useGroups";

const AddMembersModal = ({ groupUuid, onClose }) => {
  const { addMembers } = useGroups();

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const users = await getAllUsers();
      setAllUsers(users);
    };
    fetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      setError("Select at least one user");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const members = selectedUsers.map((u) => ({ uuid: u.uuid }));
      const res = await addMembers(groupUuid, members);
      if (res) onClose();
    } catch (err) {
      setError(err.message || "Error");
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Users
            </label>
            <ul className="border rounded-md max-h-60 overflow-y-auto bg-white dark:bg-slate-700">
              {allUsers.map((user) => (
                <li
                  key={user.uuid}
                  className="px-3 py-2 flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedUsers.find((u) => u.uuid === user.uuid)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers([...selectedUsers, user]);
                      } else {
                        setSelectedUsers(
                          selectedUsers.filter((u) => u.uuid !== user.uuid)
                        );
                      }
                    }}
                  />
                  <span>{user.name}</span>
                </li>
              ))}
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
