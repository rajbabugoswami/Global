"use client";
import { Home, MessageSquare, Users, Phone, Settings, LogOut, Bell, Shield } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#050510] overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-[#050510]/80 backdrop-blur-3xl border-r border-white/10 flex flex-col justify-between hidden md:flex transition-all z-20">
        <div>
          <nav className="p-4 space-y-2 mt-4">
            <NavItem href="/dashboard" icon={<Phone />} label="Random Match" />
            <NavItem href="/dashboard/chats" icon={<MessageSquare />} label="Private Chats" />
            <NavItem href="/dashboard/groups" icon={<Users />} label="Communities" />
            <NavItem href="/dashboard/notifications" icon={<Bell />} label="Notifications" />
            
            {/* Admin Panel Link */}
            {((session?.user as any)?.role === "ADMIN" || (session?.user as any)?.role === "MODERATOR") && (
              <div className="pt-4 mt-4 border-t border-white/10">
                <NavItem href="/admin" icon={<Shield className="text-red-400" />} label="Admin Panel" />
              </div>
            )}
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-white/10">
          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" />
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Log out</span>
          </button>
          
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
            <div className="relative">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.email || "User"}`} alt="Avatar" className="w-10 h-10 rounded-full bg-white/10 border border-white/20" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#050510] rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name || "User"}</p>
              <p className="text-xs text-gray-400 truncate">Online in 3D</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050510]">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all text-gray-400 hover:bg-white/10 hover:text-white font-medium hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
}
