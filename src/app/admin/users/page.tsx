"use client";
import { Users, Search, MoreVertical, Shield, Ban, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isBanned: boolean;
  status: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        toast.error(data.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "toggleBan" })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "updateRole", value: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Role updated to ${newRole}`);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">User Management</h1>
        <p className="text-gray-400 mt-1">View and manage all registered users.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-11 pr-3 py-3 border border-white/10 rounded-xl bg-black/50 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all backdrop-blur-md shadow-inner"
              placeholder="Search users by name or email..."
            />
          </div>
          <button className="w-full md:w-auto px-6 py-3 bg-blue-600/20 text-blue-400 rounded-xl font-bold border border-blue-500/30 hover:bg-blue-600/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/30">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">User</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Role</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs">Current State</th>
                <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user.id}`} alt="Avatar" className="w-10 h-10 rounded-full bg-white/10 shadow-md" />
                        <div>
                          <div className="font-bold text-white">{user.name || "Anonymous User"}</div>
                          <div className="text-xs text-gray-500">{user.email || "No email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        disabled={isActionLoading}
                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="USER">User</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-400">{user.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          disabled={isActionLoading}
                          className={`p-2 rounded-xl transition-all ${user.isBanned ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                          title={user.isBanned ? 'Unban User' : 'Ban User'}
                        >
                          {user.isBanned ? <CheckCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
