"use client";
import { useEffect, useState } from "react";
import { DollarSign, Check, X, Clock, Banknote } from "lucide-react";

export default function PayoutsAdminPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await fetch("/api/admin/payouts");
      const data = await res.json();
      if (!data.error) setPayouts(data.payouts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePayoutStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) fetchPayouts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Banknote className="w-8 h-8 text-emerald-400" /> Creator Payouts
          </h1>
          <p className="text-gray-400 mt-2">Manage and approve creator withdrawal requests.</p>
        </div>
      </div>

      <div className="bg-black/40 border border-white/10 rounded-3xl overflow-x-auto backdrop-blur-md">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="p-4 text-sm text-gray-400 font-bold">Creator ID</th>
              <th className="p-4 text-sm text-gray-400 font-bold">Amount</th>
              <th className="p-4 text-sm text-gray-400 font-bold">Status</th>
              <th className="p-4 text-sm text-gray-400 font-bold">Date</th>
              <th className="p-4 text-sm text-gray-400 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading payouts...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payout requests found.</td></tr>
            ) : (
              payouts.map((req) => (
                <tr key={req.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-white">{req.userId.substring(0, 8)}...</td>
                  <td className="p-4 text-emerald-400 font-bold">${req.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                      req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                      req.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                      req.status === 'PAID' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <button onClick={() => updatePayoutStatus(req.id, 'APPROVED')} className="p-2 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => updatePayoutStatus(req.id, 'REJECTED')} className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                      </>
                    )}
                    {req.status === 'APPROVED' && (
                      <button onClick={() => updatePayoutStatus(req.id, 'PAID')} className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg">Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
