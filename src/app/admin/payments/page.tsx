"use client";
import { DollarSign, ArrowUpRight, TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Search, Filter, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminPaymentsDashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ grossRevenue: 0, gatewayFees: 0, netSettlement: 0, refunds: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setPayments(data.transactions || []);
          if (data.stats) setStats(data.stats);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-8 text-white">Loading payments data...</div>;

  return (
    <div className="p-8 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">Payment & Settlements Dashboard</h1>
          <p className="text-gray-400 mt-1">Track revenue, gateways fees, and bank settlements securely.</p>
        </div>
        <button className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* High-Level Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<TrendingUp className="w-6 h-6 text-emerald-400" />} title="Gross Revenue (Total)" value={`₹${stats.grossRevenue.toLocaleString()}`} color="emerald" trend="Gross" />
        <StatCard icon={<DollarSign className="w-6 h-6 text-amber-400" />} title="Gateway Fees & Taxes" value={`₹${stats.gatewayFees.toLocaleString()}`} color="amber" trend="Deducted" />
        <StatCard icon={<CheckCircle2 className="w-6 h-6 text-blue-400" />} title="Net Bank Settlement" value={`₹${stats.netSettlement.toLocaleString()}`} color="blue" trend="Settled" />
        <StatCard icon={<XCircle className="w-6 h-6 text-red-400" />} title="Refunds & Chargebacks" value={`₹${stats.refunds.toLocaleString()}`} color="red" trend="Refunded" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#050510]/60 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" /> Recent Transactions
          </h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search Txn ID, User..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-emerald-500 transition-all text-white w-full md:w-64" />
            </div>
            <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all flex-shrink-0">
              <Filter className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Transaction ID</th>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Gross Amt</th>
                <th className="p-4 font-bold">Gateway Fee</th>
                <th className="p-4 font-bold">Net Amt</th>
                <th className="p-4 font-bold">Provider</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-500">No transactions found.</td></tr>
              ) : payments.map((tx, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-gray-300">{tx.providerTxId}</td>
                  <td className="p-4 text-white">{tx.user?.email || "Unknown User"}</td>
                  <td className="p-4 font-bold text-white">₹{tx.amount}</td>
                  <td className="p-4 text-amber-400">₹{tx.gatewayFee}</td>
                  <td className="p-4 font-bold text-emerald-400">₹{tx.netAmount}</td>
                  <td className="p-4 text-gray-400">{tx.provider}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      tx.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                      tx.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                      Details <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, title, value, color, trend }: { icon: React.ReactNode, title: string, value: string, color: string, trend: string }) {
  const colorMap: any = {
    emerald: "bg-emerald-500/10 border-emerald-500/30",
    blue: "bg-blue-500/10 border-blue-500/30",
    amber: "bg-amber-500/10 border-amber-500/30",
    red: "bg-red-500/10 border-red-500/30",
  };
  
  const trendColor = trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400';
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-3xl border ${colorMap[color]} bg-black/40 backdrop-blur-md shadow-lg`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-2 rounded-xl bg-white/5 shadow-inner">
          {icon}
        </div>
        <p className="text-sm font-bold text-gray-400">{title}</p>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        <span className={`text-xs font-bold ${trendColor} bg-white/5 px-2 py-1 rounded-md`}>{trend}</span>
      </div>
    </motion.div>
  );
}
