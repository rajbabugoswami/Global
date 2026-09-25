"use client";
import { Database, Server, Activity, ArrowUpRight, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminServerPage() {
  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Server Analytics</h1>
        <p className="text-gray-400 mt-1">Real-time WebRTC and Socket.IO infrastructure metrics.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ServerMetric 
          icon={<Server className="w-6 h-6 text-emerald-400" />}
          title="Signaling Server"
          status="Operational"
          uptime="99.99%"
          delay={0.1}
        />
        <ServerMetric 
          icon={<Database className="w-6 h-6 text-blue-400" />}
          title="Primary Database"
          status="Operational"
          uptime="100.00%"
          delay={0.2}
        />
        <ServerMetric 
          icon={<Cpu className="w-6 h-6 text-amber-400" />}
          title="TURN Relay Servers"
          status="High Load"
          uptime="99.95%"
          delay={0.3}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] h-96 flex flex-col justify-center items-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -z-10"></div>
        
        <Activity className="w-16 h-16 text-emerald-500/50 mb-6 animate-pulse z-10" />
        <h2 className="text-2xl font-bold text-white z-10">Live Metrics Streaming Soon</h2>
        <p className="text-gray-400 mt-2 z-10 max-w-md text-center">Interactive 3D charts for bandwidth and latency will be implemented in the upcoming engine update.</p>
        
        <button className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-colors z-10 flex items-center gap-2">
          View Raw Logs <ArrowUpRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}

function ServerMetric({ icon, title, status, uptime, delay }: { icon: React.ReactNode, title: string, status: string, uptime: string, delay: number }) {
  const isHighLoad = status === "High Load";
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-lg relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${isHighLoad ? 'bg-amber-500/10' : 'bg-emerald-500/10'} rounded-full blur-[40px] -z-10`}></div>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 shadow-inner`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">{title}</h3>
          <p className={`text-xs font-bold ${isHighLoad ? 'text-amber-400' : 'text-emerald-400'} uppercase tracking-wider mt-1`}>{status}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-sm text-gray-500">Uptime (30d)</span>
        <span className="font-bold text-white">{uptime}</span>
      </div>
    </motion.div>
  );
}
