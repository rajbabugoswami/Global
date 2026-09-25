"use client";
import { Settings, Save, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    announcement: "",
    maxCallDurationMins: 120,
    maxFileUploadMB: 50
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSettings({
            maintenanceMode: data.maintenanceMode || false,
            announcement: data.announcement || "",
            maxCallDurationMins: data.maxCallDurationMins || 120,
            maxFileUploadMB: data.maxFileUploadMB || 50
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success("Global Settings saved securely!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (e) {
      toast.error("Network error.");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-8 text-white">Loading configuration...</div>;

  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-gray-500">Global Settings</h1>
        <p className="text-gray-400 mt-1">Configure platform-wide rules and defaults.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative max-w-4xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-500/5 rounded-full blur-[100px] -z-10"></div>
        
        <div className="space-y-8">
          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" /> Platform Configuration
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-2">Global Announcement Banner</label>
                <input 
                  type="text" 
                  value={settings.announcement}
                  onChange={(e) => setSettings({...settings, announcement: e.target.value})}
                  placeholder="Leave empty to hide banner" 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all shadow-inner" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Max Free Call Duration (Mins)</label>
                  <input 
                    type="number" 
                    value={settings.maxCallDurationMins}
                    onChange={(e) => setSettings({...settings, maxCallDurationMins: Number(e.target.value)})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all shadow-inner" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">Max File Upload Size (MB)</label>
                  <input 
                    type="number" 
                    value={settings.maxFileUploadMB}
                    onChange={(e) => setSettings({...settings, maxFileUploadMB: Number(e.target.value)})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-gray-500 focus:outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" /> Security Policies
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white">Maintenance Mode</h4>
                  <p className="text-sm text-gray-400">Lock down the platform for updates. Only admins can log in.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  />
                  <div className="w-14 h-7 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500 border border-white/10 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save Global Settings"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
