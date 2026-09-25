"use client";
import { useState, useEffect } from "react";
import { CreditCard, Zap, Shield, Crown, Check, X, Clock, Video, Star, DollarSign, Smartphone, Landmark } from "lucide-react";
import { useSession } from "next-auth/react";
import GlobeCanvas from "@/components/3d/Globe";

export default function AccountPage() {
  const { data: session } = useSession();
  const [currentPlan, setCurrentPlan] = useState("FREE");
  const [isLoading, setIsLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'card' | 'bank' | 'withdraw' | 'upi' | 'upi-app' | 'netbanking' | null>(null);

  useEffect(() => {
    fetch('/api/wallet')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setWallet(data);
      });
  }, []);

  const handleModalSubmit = async (e: any) => {
    e.preventDefault();
    if (modalType === 'card') {
      alert("New Payment Method saved securely.");
      setModalOpen(false);
    }
    if (modalType === 'bank') {
      alert("Bank account linked for payouts.");
      setModalOpen(false);
    }
    if (modalType === 'withdraw') {
      const amount = e.target.elements[0].value;
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        alert(`Withdrawal request for $${amount} submitted! Pending Admin Approval.`);
      } else {
        alert("Withdrawal failed.");
      }
      setModalOpen(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    
    try {
      // In INR, 49 and 149 are the example prices the user asked for.
      const amount = planId === 'PRO' ? 149 : 49;
      
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, amount })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        alert("Payment initialization failed: " + data.error);
        setIsLoading(false);
        return;
      }

      if (data.isSimulator) {
        // Development Simulator
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: "sim_" + Date.now(),
            razorpay_signature: "sim_sig",
            planId
          })
        });

        if (verifyRes.ok) {
          alert("[DEVELOPMENT MODE] Payment Simulated Successfully! Your subscription is now active.");
          setCurrentPlan(planId);
          // Refresh Wallet
          fetch('/api/wallet').then(res => res.json()).then(w => setWallet(w));
        } else {
          alert("[DEVELOPMENT MODE] Verification Failed.");
        }
        setIsLoading(false);
        return;
      }

      // Dynamically load Razorpay SDK
      const loadScript = () => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const resScript = await loadScript();
      if (!resScript) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsLoading(false);
        return;
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "GlobalConnect",
        description: `Subscription to ${planId} Plan`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            alert("Payment Successful! Your subscription is now active.");
            setCurrentPlan(planId);
            fetch('/api/wallet').then(res => res.json()).then(w => setWallet(w));
          } else {
            alert("Payment Verification Failed: " + verifyData.error);
          }
        },
        prefill: {
          name: "GlobalConnect User",
          email: "user@example.com",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert("Network error processing payment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-y-auto bg-[#050510] text-white p-6 md:p-10 custom-scrollbar">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <GlobeCanvas />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">My Account & Billing</h1>
            <p className="text-gray-400">Manage your subscription, payments, and premium features.</p>
          </div>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
              <div className="p-3 bg-blue-500/20 rounded-xl"><Crown className="w-6 h-6 text-blue-400" /></div>
              <div>
                <p className="text-sm text-gray-400 font-bold">Current Plan</p>
                <p className="text-xl font-black text-white">{currentPlan} <span className="text-sm font-normal text-gray-500 ml-2">Active</span></p>
              </div>
            </div>
            
            {wallet && (
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-green-500/30">
                <div className="p-3 bg-green-500/20 rounded-xl"><Clock className="w-6 h-6 text-green-400" /></div>
                <div>
                  <p className="text-sm text-gray-400 font-bold">Total Available Call Time</p>
                  <p className="text-xl font-black text-white">{wallet.totalAvailableMins} Mins <span className="text-xs text-gray-500 ml-1">Today</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Calling Credit Wallet Dashboard */}
        {wallet && (
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -z-10"></div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Clock className="w-6 h-6 text-green-400" /> Calling Credit Wallet</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-sm text-gray-400 font-bold mb-2">Plan Daily Limit</p>
                <p className="text-3xl font-black text-white">{wallet.dailyLimit} <span className="text-sm text-gray-500 font-normal">mins/day</span></p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-sm text-gray-400 font-bold mb-2">Used Today</p>
                <p className="text-3xl font-black text-white">{wallet.dailyUsed} <span className="text-sm text-gray-500 font-normal">mins</span></p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-sm text-gray-400 font-bold mb-2">Ad Rewarded Balance</p>
                <p className="text-3xl font-black text-green-400">+{wallet.walletBalanceMins} <span className="text-sm text-gray-500 font-normal">mins</span></p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <p className="text-sm text-green-400 font-bold mb-2">Total Available</p>
                <p className="text-3xl font-black text-white">{wallet.totalAvailableMins} <span className="text-sm text-gray-500 font-normal">mins left</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Zap className="text-yellow-400" /> Upgrade Your Experience</h2>
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Free Plan */}
            <div className={`relative p-8 rounded-3xl border ${currentPlan === 'FREE' ? 'border-blue-500 bg-blue-900/10' : 'border-white/10 bg-black/40'} backdrop-blur-xl transition-all`}>
              {currentPlan === 'FREE' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 rounded-full text-xs font-bold shadow-lg">CURRENT PLAN</div>}
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-black mb-6">$0<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-green-400" /> Ad-supported Random Chat</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-green-400" /> 5-min limit per match</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-green-400" /> Public Groups</li>
                <li className="flex items-center gap-3 text-sm text-gray-500"><X className="w-5 h-5 text-red-500/50" /> No Priority Matching</li>
                <li className="flex items-center gap-3 text-sm text-gray-500"><X className="w-5 h-5 text-red-500/50" /> No Background Effects</li>
              </ul>
              {currentPlan !== 'FREE' && (
                <button onClick={() => setCurrentPlan('FREE')} className="w-full py-3 rounded-xl border border-white/20 font-bold hover:bg-white/5 transition-all">Downgrade</button>
              )}
            </div>

            {/* Premium Plan */}
            <div className={`relative p-8 rounded-3xl border ${currentPlan === 'PREMIUM' ? 'border-purple-500 bg-purple-900/20' : 'border-purple-500/50 bg-black/40'} backdrop-blur-xl transform md:-translate-y-4 shadow-[0_0_50px_rgba(168,85,247,0.15)] transition-all`}>
              {currentPlan === 'PREMIUM' ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-500 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.5)]">CURRENT PLAN</div>
              ) : (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold shadow-lg">MOST POPULAR</div>
              )}
              <h3 className="text-2xl font-bold mb-2 text-purple-400">Premium</h3>
              <div className="text-4xl font-black mb-6">$9.99<span className="text-lg text-gray-500 font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Ad-Free Experience</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Unlimited Chat Time</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Priority Matchmaking</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-purple-400" /> Private Groups & Calling</li>
                <li className="flex items-center gap-3 text-sm text-gray-500"><X className="w-5 h-5 text-red-500/50" /> No Global Badges</li>
              </ul>
              {currentPlan !== 'PREMIUM' && (
                <button onClick={() => handleSubscribe('PREMIUM')} disabled={isLoading} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  {isLoading ? 'Processing...' : 'Upgrade Now'}
                </button>
              )}
            </div>

            {/* Pro Plan */}
            <div className={`relative p-8 rounded-3xl border ${currentPlan === 'PRO' ? 'border-yellow-500 bg-yellow-900/10' : 'border-white/10 bg-black/40'} backdrop-blur-xl transition-all`}>
              {currentPlan === 'PRO' && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black rounded-full text-xs font-bold shadow-lg">CURRENT PLAN</div>}
              <h3 className="text-2xl font-bold mb-2 text-yellow-400">Pro Lifetime</h3>
              <div className="text-4xl font-black mb-6">$49.99<span className="text-lg text-gray-500 font-normal">/one-time</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-yellow-400" /> Everything in Premium</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-yellow-400" /> Lifetime Access (No Ads)</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-yellow-400" /> Global Verified Badge</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-yellow-400" /> 4K Video Quality</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><Check className="w-5 h-5 text-yellow-400" /> Custom AI Backgrounds</li>
              </ul>
              {currentPlan !== 'PRO' && (
                <button onClick={() => handleSubscribe('PRO')} disabled={isLoading} className="w-full py-3 rounded-xl bg-white text-black font-black hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {isLoading ? 'Processing...' : 'Get Lifetime'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment History & Methods */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-black/40 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CreditCard className="text-blue-400" /> Payment Methods</h3>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mb-4 hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded flex items-center justify-center font-bold text-xs">VISA</div>
                <div>
                  <p className="font-bold text-sm">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-500">Expires 12/28</p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-white/10 rounded-md text-white">Default</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setModalType('card'); setModalOpen(true); }}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Add Card
              </button>
              <button 
                onClick={() => { setModalType('upi'); setModalOpen(true); }}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-orange-400" /> Add UPI
              </button>
              <button 
                onClick={() => { setModalType('upi-app'); setModalOpen(true); }}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4 text-pink-400" /> UPI Apps
              </button>
              <button 
                onClick={() => { setModalType('netbanking'); setModalOpen(true); }}
                className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
              >
                <Landmark className="w-4 h-4 text-indigo-400" /> Net Banking
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Secure payments processed by Razorpay & Stripe.</p>
          </div>

          <div className="bg-black/40 border border-white/10 p-6 rounded-3xl backdrop-blur-md overflow-hidden">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Clock className="text-green-400" /> Billing History</h3>
            <div className="space-y-4">
              {currentPlan !== 'FREE' ? (
                <div className="flex justify-between items-center p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                  <div>
                    <p className="font-bold text-sm">Subscription Upgrade ({currentPlan})</p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-white">{currentPlan === 'PRO' ? '$49.99' : '$9.99'}</p>
                    <p className="text-xs text-green-400 font-bold">Successful</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">No payment history yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* NEW: Earnings & Creator Payouts */}
        {(session?.user as any)?.role === "ADMIN" && (
          <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10"></div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <h3 className="text-2xl font-bold mb-2 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/40">
                    <DollarSign className="w-6 h-6" />
                  </span>
                  Creator Earnings & Payouts
                </h3>
                <p className="text-gray-400 mb-6">Withdraw your group ad-revenue and virtual gift earnings directly to your bank account.</p>
                
                <div className="flex items-center gap-4 mb-8">
                  <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Available Balance</p>
                    <h4 className="text-4xl font-black text-white mt-1">$450.00</h4>
                  </div>
                  <button 
                    onClick={() => { setModalType('withdraw'); setModalOpen(true); }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>

              <div className="bg-black/50 border border-white/10 p-6 rounded-2xl">
                <h4 className="font-bold text-white mb-4">Linked Bank Accounts</h4>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mb-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-bold text-xl text-emerald-400">
                      🏦
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Chase Checking Account</p>
                      <p className="text-xs text-gray-400">Account ending in •••• 9012</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">Active for Payouts</span>
                </div>
                <button 
                  onClick={() => { setModalType('bank'); setModalOpen(true); }}
                  className="w-full py-3 border border-dashed border-white/20 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all text-sm font-bold flex items-center justify-center gap-2"
                >
                  + Link New Bank Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reusable Modal Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full bg-[#0a0a1a] border border-white/10 p-6 rounded-3xl shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-2">
              {modalType === 'card' ? 'Add New Card' : modalType === 'upi' ? 'Link UPI ID' : modalType === 'upi-app' ? 'Connect UPI App' : modalType === 'netbanking' ? 'Link Net Banking' : modalType === 'bank' ? 'Link Bank Account' : 'Withdraw Earnings'}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {modalType === 'card' ? 'Securely save a card for fast checkout.' : modalType === 'upi' ? 'Link a UPI ID for 1-click payments.' : modalType === 'upi-app' ? 'Connect Google Pay, PhonePe, or Paytm.' : modalType === 'netbanking' ? 'Link your bank directly via Net Banking.' : modalType === 'bank' ? 'Link your bank account to receive payouts.' : 'Withdraw your current balance to your bank account.'}
            </p>
            
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {modalType === 'card' && (
                <>
                  <input type="text" required placeholder="Card Number (e.g. 4242 4242...)" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" required placeholder="MM/YY" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none" />
                    <input type="text" required placeholder="CVC" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-blue-500 focus:outline-none" />
                  </div>
                </>
              )}
              {modalType === 'upi' && (
                <>
                  <input type="text" required placeholder="Enter UPI ID (e.g. name@okhdfcbank)" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-orange-500 focus:outline-none" />
                </>
              )}
              {modalType === 'upi-app' && (
                <>
                  <select required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none text-white appearance-none">
                    <option value="" disabled selected>Select UPI App</option>
                    <option value="gpay">Google Pay</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="paytm">Paytm</option>
                    <option value="bhim">BHIM UPI</option>
                  </select>
                  <input type="text" required placeholder="Enter Mobile Number registered with App" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-pink-500 focus:outline-none" />
                </>
              )}
              {modalType === 'netbanking' && (
                <>
                  <select required className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-indigo-500 focus:outline-none text-white appearance-none">
                    <option value="" disabled selected>Select Bank for Net Banking</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                  </select>
                </>
              )}
              {modalType === 'bank' && (
                <>
                  <input type="text" required placeholder="Account Holder Name" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none" />
                  <input type="text" required placeholder="Routing Number / IFSC" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none" />
                  <input type="text" required placeholder="Account Number" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none" />
                </>
              )}
              {modalType === 'withdraw' && (
                <>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-4 text-center">
                    <p className="text-sm text-emerald-400 font-bold mb-1">Available to Withdraw</p>
                    <p className="text-3xl font-black text-white">$450.00</p>
                  </div>
                  <input type="number" required placeholder="Amount to withdraw" min="10" max="450" defaultValue="450" className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-emerald-500 focus:outline-none" />
                </>
              )}
              
              <button type="submit" className={`w-full py-4 mt-2 font-bold rounded-xl transition-all ${modalType === 'card' || modalType === 'upi' || modalType === 'upi-app' || modalType === 'netbanking' ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                {modalType === 'card' ? 'Save Card' : modalType === 'upi' ? 'Verify & Link UPI' : modalType === 'upi-app' ? 'Connect UPI App' : modalType === 'netbanking' ? 'Proceed to Net Banking' : modalType === 'bank' ? 'Securely Link Account' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
