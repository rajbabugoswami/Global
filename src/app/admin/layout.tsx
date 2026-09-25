"use client";
import { ShieldAlert, Users, Settings, Activity, AlertTriangle, FileText, Database, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import GlobeCanvas from "@/components/3d/Globe";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#050510] overflow-hidden relative">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <GlobeCanvas />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`w-64 bg-[#050510]/95 backdrop-blur-3xl border-r border-white/10 flex flex-col justify-between z-40 fixed inset-y-0 left-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div>
          <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/20">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400 tracking-wide">
                SA Panel
              </span>
            </Link>
          </div>

          <div className="px-4 py-4 mt-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">Management</p>
            <nav className="space-y-2">
              <NavItem href="/admin" icon={<Activity />} label="Dashboard" active={pathname === "/admin"} />
              <NavItem href="/admin/users" icon={<Users />} label="Users & Roles" active={pathname === "/admin/users"} />
              <NavItem href="/admin/moderation" icon={<AlertTriangle />} label="Moderation Reports" active={pathname === "/admin/moderation"} />
              <NavItem href="/admin/payments" icon={<Database />} label="Payments & Revenue" active={pathname === "/admin/payments"} />
              <NavItem href="/admin/payouts" icon={<FileText />} label="Creator Payouts" active={pathname === "/admin/payouts"} />
            </nav>
          </div>

          <div className="px-4 py-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2">System</p>
            <nav className="space-y-2">
              <NavItem href="/admin/random" icon={<Users />} label="Random Chat Mgmt" active={pathname === "/admin/random"} />
              <NavItem href="/admin/monetization" icon={<FileText />} label="Ad Monetization" active={pathname === "/admin/monetization"} />
              <NavItem href="/admin/server" icon={<Database />} label="Server Analytics" active={pathname === "/admin/server"} />
              <NavItem href="/admin/settings" icon={<Settings />} label="Global Settings" active={pathname === "/admin/settings"} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 font-bold border border-red-500/30">
                SA
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#050510] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">Super Admin</p>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide">Level 10 Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-y-auto relative z-10">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center px-4 sticky top-0 z-20">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 mr-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <span className="font-bold text-white">GlobalConnect Admin</span>
        </div>
        
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? "bg-red-500/10 text-red-400 font-bold shadow-[0_0_20px_rgba(239,68,68,0.15)] border border-red-500/20" 
          : "text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
      }`}
    >
      <div className={`w-5 h-5 ${active ? "animate-pulse" : ""}`}>{icon}</div>
      <span className="text-sm">{label}</span>
    </Link>
  );
}
