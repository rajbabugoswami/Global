"use client";

import { useState } from "react";
import GlobeCanvas from "@/components/3d/Globe";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Heart, MessageSquare, UserPlus, ShieldAlert, Check, X, Users, Video } from "lucide-react";

type NotificationType = "like" | "message" | "friend_request" | "system" | "group_invite";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  actionRequired?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "friend_request",
    title: "New Friend Request",
    message: "Alex from London wants to connect with you.",
    time: "2 mins ago",
    read: false,
    actionRequired: true,
  },
  {
    id: "2",
    type: "group_invite",
    title: "Community Invitation",
    message: "You have been invited to join 'Next.js Developers'.",
    time: "1 hour ago",
    read: false,
    actionRequired: true,
  },
  {
    id: "3",
    type: "message",
    title: "New Message",
    message: "Hey! Are you ready for the video call?",
    time: "3 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Security Alert",
    message: "New login detected from Windows (Chrome) in New York.",
    time: "Yesterday",
    read: true,
  },
  {
    id: "5",
    type: "like",
    title: "Post Liked",
    message: "Sarah liked your post in the GlobalConnect Community.",
    time: "2 days ago",
    read: true,
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => activeTab === "unread" ? !n.read : true);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "like": return <Heart className="w-5 h-5 text-pink-400" />;
      case "message": return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case "friend_request": return <UserPlus className="w-5 h-5 text-green-400" />;
      case "group_invite": return <Users className="w-5 h-5 text-purple-400" />;
      case "system": return <ShieldAlert className="w-5 h-5 text-red-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getGradient = (type: NotificationType) => {
    switch (type) {
      case "like": return "from-pink-500/20 to-rose-500/5";
      case "message": return "from-blue-500/20 to-cyan-500/5";
      case "friend_request": return "from-green-500/20 to-emerald-500/5";
      case "group_invite": return "from-purple-500/20 to-fuchsia-500/5";
      case "system": return "from-red-500/20 to-orange-500/5";
      default: return "from-gray-500/20 to-gray-500/5";
    }
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden bg-[#050510] text-white">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <GlobeCanvas />
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 w-full max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">Notification Center</h1>
            <p className="text-gray-400">Stay updated with your connections worldwide.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <button onClick={() => setActiveTab("all")} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'all' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                All
              </button>
              <button onClick={() => setActiveTab("unread")} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'unread' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                Unread 
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>
            <button onClick={markAllAsRead} className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-colors text-blue-400 flex items-center gap-2">
              <Check className="w-4 h-4" /> Mark all read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 relative" style={{ perspective: '1000px' }}>
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center bg-black/20 backdrop-blur-xl border border-white/5 rounded-3xl"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                  <Bell className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">You're all caught up!</h3>
                <p className="text-gray-400">There are no new notifications right now.</p>
              </motion.div>
            ) : (
              filteredNotifications.map((notification, idx) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20, rotateX: -10 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.05, duration: 0.4, type: "spring" }}
                  whileHover={{ scale: 1.01, translateZ: 20 }}
                  className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${notification.read ? 'bg-black/40 border-white/5' : 'bg-white/5 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.03)]'}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(notification.type)} opacity-20`}></div>
                  
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  )}

                  <div className="relative p-6 flex items-start gap-4">
                    {/* Icon Bubble */}
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center bg-black/50 border border-white/10 shadow-inner`}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-lg ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs font-bold text-gray-500 whitespace-nowrap ml-4 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                          {notification.time}
                        </span>
                      </div>
                      <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                        {notification.message}
                      </p>

                      {/* Action Buttons */}
                      {notification.actionRequired && !notification.read && (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => markAsRead(notification.id)} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                            Accept
                          </button>
                          <button onClick={() => removeNotification(notification.id)} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm rounded-xl transition-colors border border-white/10">
                            Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button onClick={() => markAsRead(notification.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-colors" title="Mark as read">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => removeNotification(notification.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors" title="Remove notification">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
