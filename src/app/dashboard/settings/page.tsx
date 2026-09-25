"use client";
import GlobeCanvas from "@/components/3d/Globe";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  User, Shield, Bell, Monitor, Volume2, Key, 
  Moon, Sun, CheckCircle2, ChevronRight, LogOut,
  Camera, Mic, Loader2, Phone, Eye, UserPlus,
  VolumeX, MessageSquare, Mail, Lock, ShieldCheck
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

type TabType = "profile" | "privacy" | "notifications" | "audio" | "appearance" | "security";

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [savedMessage, setSavedMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Profile Form State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Privacy Form State
  const [privacy, setPrivacy] = useState({
    whoCanSeeOnline: "EVERYONE",
    whoCanCallMe: "EVERYONE",
    whoCanAddMeToGroups: "EVERYONE",
    allowReadReceipts: true,
    disappearingMessages: false,
  });

  // Settings Form State
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    soundEnabled: true,
  });

  // Security Form State
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    if (activeTab === "privacy") {
      fetch("/api/privacy")
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setPrivacy({
              whoCanSeeOnline: data.whoCanSeeOnline || "EVERYONE",
              whoCanCallMe: data.whoCanCallMe || "EVERYONE",
              whoCanAddMeToGroups: data.whoCanAddMeToGroups || "EVERYONE",
              allowReadReceipts: data.allowReadReceipts ?? true,
              disappearingMessages: data.disappearingMessages ?? false,
            });
          }
        })
        .catch(console.error);
    } else if (activeTab === "notifications") {
      fetch("/api/settings")
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setUserSettings({
              notifications: data.notifications ?? true,
              soundEnabled: data.soundEnabled ?? true,
            });
          }
        })
        .catch(console.error);
    }
  }, [activeTab]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      if (activeTab === "profile") {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        if (!res.ok) throw new Error("Failed to save profile");
        await updateSession({ name });

      } else if (activeTab === "privacy") {
        const res = await fetch("/api/privacy", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(privacy),
        });

        if (!res.ok) throw new Error("Failed to save privacy settings");
      } else if (activeTab === "notifications") {
        const res = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userSettings),
        });

        if (!res.ok) throw new Error("Failed to save notifications settings");
      } else if (activeTab === "security") {
        if (!securityData.currentPassword || !securityData.newPassword) {
          throw new Error("Please fill in both current and new password");
        }
        if (securityData.newPassword !== securityData.confirmPassword) {
          throw new Error("New passwords do not match");
        }
        if (securityData.newPassword.length < 6) {
          throw new Error("New password must be at least 6 characters long");
        }

        const res = await fetch("/api/security", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: securityData.currentPassword,
            newPassword: securityData.newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update password");
        
        // Clear passwords from form on success
        setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }

      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "privacy", label: "Privacy & Safety", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "audio", label: "Audio & Video", icon: Volume2 },
    { id: "appearance", label: "Appearance", icon: Monitor },
    { id: "security", label: "Account Security", icon: Key },
  ];

  return (
    <div className="relative flex-1 h-[calc(100vh-80px)] overflow-hidden bg-[#050510] text-white flex">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <GlobeCanvas />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl mx-auto py-8 px-4 gap-8 h-full">
        
        {/* Sidebar Settings Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-72 flex-shrink-0 flex flex-col gap-2 bg-[#050510]/60 backdrop-blur-3xl rounded-3xl p-4 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] h-full overflow-y-auto"
        >
          <div className="p-4 mb-2">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Settings
            </h2>
            <p className="text-xs text-gray-400 mt-1">Manage your 3D experience</p>
          </div>

          <div className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeTab === tab.id 
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabIndicator">
                    <ChevronRight className="w-4 h-4" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <button 
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Log out of all devices</span>
            </button>
          </div>
        </motion.div>

        {/* Settings Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto h-full relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl pb-24"
            >
              {/* === PROFILE SETTINGS === */}
              {activeTab === "profile" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">My Profile</h3>
                    <p className="text-sm text-gray-400">Update your personal information and avatar.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center gap-6 p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email || "User"}`} alt="Avatar" className="w-full h-full object-cover bg-white/10" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">{name || session?.user?.name || "GlobalConnect User"}</h4>
                      <p className="text-sm text-gray-400 mb-3">{session?.user?.email}</p>
                      <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Display Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <input type="text" disabled value={`@${(name || session?.user?.name || "user").toLowerCase().replace(/\s/g, '')}`} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 opacity-70 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Bio</label>
                      <textarea 
                        rows={3} 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell the world about yourself..." 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* === PRIVACY & SAFETY === */}
              {activeTab === "privacy" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Privacy & Safety</h3>
                    <p className="text-sm text-gray-400">Control who can see and interact with you.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Select Fields */}
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Eye className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Who can see my online status</h4>
                            <p className="text-sm text-gray-400">Determines if others see the green dot</p>
                          </div>
                        </div>
                        <select 
                          value={privacy.whoCanSeeOnline}
                          onChange={(e) => setPrivacy({...privacy, whoCanSeeOnline: e.target.value})}
                          className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[140px] cursor-pointer"
                        >
                          <option value="EVERYONE">Everyone</option>
                          <option value="CONTACTS">My Contacts</option>
                          <option value="NOBODY">Nobody</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Phone className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Who can call me</h4>
                            <p className="text-sm text-gray-400">Restrict incoming 3D video calls</p>
                          </div>
                        </div>
                        <select 
                          value={privacy.whoCanCallMe}
                          onChange={(e) => setPrivacy({...privacy, whoCanCallMe: e.target.value})}
                          className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none min-w-[140px] cursor-pointer"
                        >
                          <option value="EVERYONE">Everyone</option>
                          <option value="CONTACTS">My Contacts</option>
                          <option value="NOBODY">Nobody</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                            <UserPlus className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Who can add me to groups</h4>
                            <p className="text-sm text-gray-400">Prevent unwanted group invitations</p>
                          </div>
                        </div>
                        <select 
                          value={privacy.whoCanAddMeToGroups}
                          onChange={(e) => setPrivacy({...privacy, whoCanAddMeToGroups: e.target.value})}
                          className="bg-[#050510] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none min-w-[140px] cursor-pointer"
                        >
                          <option value="EVERYONE">Everyone</option>
                          <option value="CONTACTS">My Contacts</option>
                          <option value="NOBODY">Nobody</option>
                        </select>
                      </div>
                    </div>

                    <div className="w-full h-px bg-white/10 my-6"></div>

                    {/* Toggle Fields */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-white">Read Receipts</h4>
                          <p className="text-sm text-gray-400">Let others know when you've read their messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={privacy.allowReadReceipts}
                            onChange={(e) => setPrivacy({...privacy, allowReadReceipts: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-medium text-white">Disappearing Messages</h4>
                          <p className="text-sm text-gray-400">New messages will disappear from chats after 24 hours</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={privacy.disappearingMessages}
                            onChange={(e) => setPrivacy({...privacy, disappearingMessages: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </label>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* === NOTIFICATIONS SETTINGS === */}
              {activeTab === "notifications" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Notifications</h3>
                    <p className="text-sm text-gray-400">Choose how you are notified of new events.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                            <Bell className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Push Notifications</h4>
                            <p className="text-sm text-gray-400">Receive alerts for new messages and calls</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={userSettings.notifications}
                            onChange={(e) => setUserSettings({...userSettings, notifications: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <Volume2 className="w-5 h-5 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Notification Sounds</h4>
                            <p className="text-sm text-gray-400">Play sounds for incoming events</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={userSettings.soundEnabled}
                            onChange={(e) => setUserSettings({...userSettings, soundEnabled: e.target.checked})}
                          />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 opacity-60">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-500/20 flex items-center justify-center border border-gray-500/30">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-medium text-white">Email Digests</h4>
                            <p className="text-sm text-gray-400">Coming soon in next update</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-not-allowed">
                          <input type="checkbox" className="sr-only peer" disabled />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* === APPEARANCE SETTINGS === */}
              {activeTab === "appearance" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Appearance</h3>
                    <p className="text-sm text-gray-400">Customize how GlobalConnect looks on your device.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-300">Theme Preference</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="cursor-pointer group">
                        <div className="h-24 rounded-xl border-2 border-blue-500 bg-[#050510] flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] mb-2 relative overflow-hidden">
                          <Moon className="w-8 h-8 text-blue-400" />
                          <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /></div>
                        </div>
                        <p className="text-center text-sm font-medium text-blue-400">3D Dark Glass</p>
                      </div>
                      <div className="cursor-pointer group opacity-50 hover:opacity-100 transition-opacity">
                        <div className="h-24 rounded-xl border-2 border-white/10 bg-gray-50 flex items-center justify-center mb-2">
                          <Sun className="w-8 h-8 text-gray-800" />
                        </div>
                        <p className="text-center text-sm font-medium text-gray-400 group-hover:text-white">Light (Coming Soon)</p>
                      </div>
                      <div className="cursor-pointer group opacity-50 hover:opacity-100 transition-opacity">
                        <div className="h-24 rounded-xl border-2 border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center mb-2">
                          <Monitor className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-center text-sm font-medium text-gray-400 group-hover:text-white">System Sync</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-medium text-white">3D Animations</h4>
                        <p className="text-sm text-gray-400">Enable WebGL Globe and smooth transitions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* === AUDIO & VIDEO === */}
              {activeTab === "audio" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Audio & Video</h3>
                    <p className="text-sm text-gray-400">Configure your devices for 3D Video Calls.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center h-48 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white/50 animate-pulse" />
                      </div>
                      <p className="relative z-10 text-sm font-medium text-gray-300">Camera preview unavailable</p>
                    </div>

                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Camera className="w-4 h-4"/> Camera</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                          <option>FaceTime HD Camera (Built-in)</option>
                          <option>OBS Virtual Camera</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2"><Mic className="w-4 h-4"/> Microphone</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
                          <option>MacBook Pro Microphone</option>
                          <option>External USB Mic</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <h4 className="text-base font-medium text-white">Hardware Acceleration</h4>
                        <p className="text-sm text-gray-400">Improves 4K video encoding performance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* === ACCOUNT SECURITY === */}
              {activeTab === "security" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Account Security</h3>
                    <p className="text-sm text-gray-400">Update your password and secure your account.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                          <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Change Password</h4>
                          <p className="text-sm text-gray-400">Ensure your account uses a long, random password</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Current Password</label>
                          <div className="relative">
                            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                              type="password" 
                              value={securityData.currentPassword}
                              onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                              className="w-full bg-[#050510] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              placeholder="Enter current password"
                            />
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/5 my-2"></div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">New Password</label>
                          <div className="relative">
                            <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                              type="password" 
                              value={securityData.newPassword}
                              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                              className="w-full bg-[#050510] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              placeholder="Enter new password"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                          <div className="relative">
                            <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input 
                              type="password" 
                              value={securityData.confirmPassword}
                              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                              className="w-full bg-[#050510] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-red-400 mb-1">Danger Zone</h4>
                        <p className="text-sm text-red-400/70">Permanently delete your account and all data.</p>
                      </div>
                      <button className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors border border-red-500/30">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Save Action Footer */}
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#050510] to-transparent pointer-events-none flex justify-end">
            <div className="pointer-events-auto flex items-center gap-4">
              <AnimatePresence>
                {savedMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-400/10 px-4 py-2 rounded-full border border-green-400/20 backdrop-blur-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Settings Saved
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
