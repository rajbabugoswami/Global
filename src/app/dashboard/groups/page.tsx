"use client";

import { useEffect, useState } from "react";
import { Users, TrendingUp, Search, Plus, Compass, Hash, ShieldCheck, Lock, Globe as GlobeIcon } from "lucide-react";
import Link from "next/link";

interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  privacy: string;
  isTrending: boolean;
  _count: {
    members: number;
    posts: number;
  };
}

export default function GroupsDiscoveryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');
  
  // Create Group Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", privacy: "PUBLIC", category: "Technology" });
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroup.name) return;
    setIsCreating(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGroup)
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchGroups();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const categories = ["Technology", "Gaming", "Music", "Education", "Lifestyle", "Sports", "Art"];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar p-6 space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Groups & Communities</h1>
          <p className="text-gray-400">Discover and join vibrant communities around the world.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" /> Create Group
        </button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
          <button onClick={() => setActiveTab('discover')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'discover' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Compass className="w-4 h-4" /> Discover
          </button>
          <button onClick={() => setActiveTab('my-groups')} className={`px-6 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'my-groups' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Users className="w-4 h-4" /> My Groups
          </button>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search communities..." 
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Trending Categories */}
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-400" /> Browse Categories
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat, i) => (
            <button key={i} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap text-sm font-bold">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Discover Groups Grid */}
      <div>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" /> Trending Communities
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-white/5 animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link href={`/dashboard/groups/${group.id}`} key={group.id} className="group relative rounded-3xl bg-black/40 border border-white/10 overflow-hidden hover:border-blue-500/50 transition-all flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-6 flex-1 relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
                      {group.category}
                    </div>
                    {group.privacy === 'PUBLIC' ? <GlobeIcon className="w-4 h-4 text-gray-500" /> : <Lock className="w-4 h-4 text-gray-500" />}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{group.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{group.description || "No description provided."}</p>
                </div>
                <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex items-center justify-between text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {group._count?.members || 0} Members</span>
                  <span className="text-blue-400 group-hover:underline">View Feed &rarr;</span>
                </div>
              </Link>
            ))}
            {groups.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white/5 rounded-3xl border border-white/10">
                <Users className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">No groups found</h3>
                <p className="text-gray-400">Be the first to create a community!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0a15] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-6">Create Community</h2>
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Next.js Developers"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1">Description</label>
                <textarea 
                  value={newGroup.description}
                  onChange={e => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none min-h-[100px]"
                  placeholder="What is this community about?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Category</label>
                  <select 
                    value={newGroup.category}
                    onChange={e => setNewGroup({...newGroup, category: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Privacy</label>
                  <select 
                    value={newGroup.privacy}
                    onChange={e => setNewGroup({...newGroup, privacy: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors">Cancel</button>
                <button onClick={handleCreateGroup} disabled={isCreating || !newGroup.name} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold disabled:opacity-50 transition-colors shadow-lg">
                  {isCreating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
