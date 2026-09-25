"use client";
import { Users, PhoneCall, AlertTriangle, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCalls: 0,
    pendingReports: 0,
    revenue: 0,
  });

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 pb-20 relative z-10">
      <div className="mb-8 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">System Overview</h1>
          <p className="text-gray-400 mt-1">Super Admin Dashboard & Analytics</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-full text-sm font-bold border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
        >
          Super Admin Mode
        </motion.div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-8 h-8 text-blue-400" />}
          color="blue"
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend="Live from Database"
          delay={0.1}
        />
        <StatCard 
          icon={<PhoneCall className="w-8 h-8 text-green-400" />}
          color="green"
          title="Active Calls"
          value={stats.activeCalls.toLocaleString()}
          trend="Live WebRTC Streams"
          delay={0.2}
        />
        <StatCard 
          icon={<AlertTriangle className="w-8 h-8 text-amber-400" />}
          color="amber"
          title="Pending Reports"
          value={stats.pendingReports.toLocaleString()}
          trend="Requires Moderation"
          delay={0.3}
        />
        <StatCard 
          icon={<DollarSign className="w-8 h-8 text-purple-400" />}
          color="purple"
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          trend="From Premium Plans"
          delay={0.4}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* System Health */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -z-10"></div>
          <h2 className="text-xl font-bold mb-8 text-white">Server Health (SFU Media Server)</h2>
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="font-medium text-gray-400">CPU Usage</span>
                <span className="text-green-400 font-bold">24%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "24%" }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="font-medium text-gray-400">Memory (RAM)</span>
                <span className="text-amber-400 font-bold">68%</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-3 text-sm">
                <span className="font-medium text-gray-400">Bandwidth (TURN servers)</span>
                <span className="text-blue-400 font-bold">4.2 TB / 10 TB</span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Moderation Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -z-10"></div>
          <h2 className="text-xl font-bold mb-6 text-white">Recent Moderation Activity</h2>
          <div className="space-y-4">
            {[
              { user: "Spammer123", action: "Account Banned", admin: "Mod_Sarah", time: "10 mins ago" },
              { user: "User_884", action: "Warning Issued", admin: "Mod_James", time: "1 hour ago" },
              { user: "GlobalGroupX", action: "Group Deleted", admin: "SuperAdmin", time: "3 hours ago" }
            ].map((log, i) => (
              <motion.div 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                key={i} 
                className="flex justify-between items-center p-4 bg-white/5 rounded-2xl transition-colors border border-white/5"
              >
                <div>
                  <p className="font-bold text-sm text-white">{log.user}</p>
                  <p className="text-xs text-gray-400 mt-1">Action: <span className="text-red-400">{log.action}</span> by {log.admin}</p>
                </div>
                <span className="text-xs text-gray-500 bg-black/50 px-3 py-1 rounded-full">{log.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, title, value, trend, delay }: { icon: React.ReactNode, color: string, title: string, value: string, trend: string, delay: number }) {
  const colorMap: any = {
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    green: "bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]",
    amber: "bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] flex items-start gap-5 relative overflow-hidden"
    >
      {/* Subtle glow behind icon */}
      <div className={`absolute top-4 left-4 w-16 h-16 rounded-full blur-[20px] ${colorMap[color].split(" ")[0]} opacity-50 z-0`}></div>
      
      <div className={`relative z-10 p-4 rounded-2xl border ${colorMap[color]} backdrop-blur-md`}>
        {icon}
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
        <p className="text-xs text-gray-500 mt-2 font-medium">{trend}</p>
      </div>
    </motion.div>
  );
}
