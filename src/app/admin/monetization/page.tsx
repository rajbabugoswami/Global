"use client";
import { DollarSign, Settings, TrendingUp, MonitorPlay, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminMonetizationPage() {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [adsenseConfig, setAdsenseConfig] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/admin/monetization')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAdsEnabled(data.adsEnabled || false);
          setAdsenseConfig(data.adsenseConfig || "");
          setIsLoaded(true);
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/monetization', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adsEnabled, adsenseConfig })
      });
      if (res.ok) {
        alert("Global Ad Monetization settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (e) {
      alert("Network error.");
    }
    setIsSaving(false);
  };

  if (!isLoaded) return <div className="p-8 text-white">Loading monetization settings...</div>;

  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">Ad Monetization</h1>
        <p className="text-gray-400 mt-1">Manage global ad placements and AdSense integrations.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10"></div>
            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
              <Settings className="w-6 h-6 text-purple-400" /> Ad Configuration
            </h2>
            
            <div className="space-y-6">
              
              <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="font-bold text-white text-lg">Enable Global Advertising</h4>
                  <p className="text-sm text-gray-400 mt-1">Turn on/off all ads across the entire website instantly.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={adsEnabled} onChange={(e) => setAdsEnabled(e.target.checked)} />
                  <div className="w-14 h-7 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] border border-white/10"></div>
                </label>
              </div>

              <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                <h4 className="font-bold text-white text-lg mb-2">Google AdSense Client ID</h4>
                <p className="text-sm text-gray-400 mb-4">Paste your `ca-pub-XXXXXXXXXXXXXX` ID here. This will automatically inject your ads into the GlobalConnect Sidebars and Dashboards.</p>
                <input 
                  type="text"
                  value={adsenseConfig}
                  onChange={(e) => setAdsenseConfig(e.target.value)}
                  placeholder="ca-pub-1234567890123456"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

            </div>
            
            <div className="mt-8">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-gray-400" /> Integrations
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="font-bold text-white mb-1">Google AdSense</p>
                <p className={`text-xs font-bold ${adsenseConfig ? 'text-green-400' : 'text-gray-500'}`}>
                  {adsenseConfig ? 'Configured' : 'Not Configured'}
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="font-bold text-white mb-1">Adsterra</p>
                <p className="text-xs text-gray-500 font-bold">Not Configured</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
