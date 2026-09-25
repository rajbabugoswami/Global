"use client";
import { Users, AlertTriangle, ShieldBan, Monitor, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminRandomChatPage() {
  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Random Chat Management</h1>
        <p className="text-gray-400 mt-1">Monitor live matchmaking queues, statistics, and enforce safety rules.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users className="w-6 h-6 text-blue-400" />} title="Users in Queue" value="1,248" color="blue" />
        <StatCard icon={<Activity className="w-6 h-6 text-green-400" />} title="Active Matches" value="842" color="green" />
        <StatCard icon={<AlertTriangle className="w-6 h-6 text-amber-400" />} title="Active Reports" value="12" color="amber" />
        <StatCard icon={<ShieldBan className="w-6 h-6 text-red-400" />} title="Bans Today" value="47" color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -z-10"></div>
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-400" /> Matchmaking Settings
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <h4 className="font-bold text-white">Strict Language Matching</h4>
                <p className="text-sm text-gray-400">Force users to match exactly with selected language.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 border border-white/10"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div>
                <h4 className="font-bold text-white">AI Content Moderation</h4>
                <p className="text-sm text-gray-400">Auto-disconnect inappropriate video streams.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-white/10"></div>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] -z-10"></div>
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Recent Live Reports
          </h2>
          
          <div className="space-y-3">
            {[
              { id: "MTCH-992", reason: "Nudity/Inappropriate", status: "Auto-Ban" },
              { id: "MTCH-883", reason: "Verbal Abuse", status: "Pending Review" },
              { id: "MTCH-881", reason: "Spam", status: "Dismissed" }
            ].map((report, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-white text-sm">{report.id}</p>
                  <p className="text-xs text-gray-400">{report.reason}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${report.status === 'Auto-Ban' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : report.status === 'Pending Review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                  {report.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-500/10 border-blue-500/30",
    green: "bg-green-500/10 border-green-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    red: "bg-red-500/10 border-red-500/30",
  };
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-3xl border ${colorMap[color]} bg-black/40 backdrop-blur-md shadow-lg`}
    >
      <div className="flex items-center gap-4 mb-2">
        <div className="p-2 rounded-xl bg-white/5 shadow-inner">
          {icon}
        </div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
      </div>
      <h3 className="text-3xl font-bold text-white mt-4">{value}</h3>
    </motion.div>
  );
}
