"use client";
import { Shield, AlertTriangle, Check, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/moderation')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReports(data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleAction = async (reportId: string, action: "DISMISS" | "BAN") => {
    try {
      const res = await fetch('/api/admin/moderation', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action })
      });
      
      if (res.ok) {
        toast.success(action === "BAN" ? "User has been banned." : "Report dismissed.");
        setReports(reports.filter(r => r.id !== reportId));
      } else {
        toast.error("Failed to perform action.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
  };

  if (isLoading) return <div className="p-8 text-white">Loading moderation queue...</div>;

  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-500">Moderation Queue</h1>
        <p className="text-gray-400 mt-1">Review reported users and offensive content.</p>
      </motion.div>

      <div className="space-y-6 max-w-5xl">
        {reports.length === 0 ? (
          <div className="p-10 bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
            No pending reports! The queue is clean.
          </div>
        ) : (
          reports.map((report, i) => (
            <motion.div 
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#050510]/60 backdrop-blur-3xl rounded-2xl border border-red-500/20 p-6 flex items-start justify-between gap-6 hover:bg-white/5 transition-all shadow-[0_0_30px_rgba(239,68,68,0.05)]"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-white text-lg">Report: {report.reason}</h3>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase">High Priority</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">"{report.details || "No additional details provided."}"</p>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-gray-500">Reported User: <span className="text-white">{report.reported?.name || report.reported?.email}</span></span>
                    <span className="text-gray-500">Reported By: <span className="text-white">{report.reporter?.name || report.reporter?.email}</span></span>
                    <span className="text-gray-500">Time: <span className="text-white">{new Date(report.createdAt).toLocaleString()}</span></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button 
                  onClick={() => handleAction(report.id, "BAN")}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                >
                  <Ban className="w-4 h-4" /> Ban User
                </button>
                <button 
                  onClick={() => handleAction(report.id, "DISMISS")}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Dismiss
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
