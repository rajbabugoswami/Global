import { Home, MessageSquare, Users, Phone, Settings, LogOut, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between hidden md:flex transition-all">
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                G
              </div>
              <span className="hidden lg:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                GlobalConnect
              </span>
            </Link>
          </div>

          <nav className="p-4 space-y-2">
            <NavItem href="/dashboard" icon={<MessageSquare />} label="Chats" active />
            <NavItem href="/dashboard/calls" icon={<Phone />} label="Calls" />
            <NavItem href="/dashboard/contacts" icon={<Users />} label="Contacts" />
            <NavItem href="/dashboard/notifications" icon={<Bell />} label="Notifications" />
          </nav>
        </div>

        <div className="p-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
          <NavItem href="/dashboard/settings" icon={<Settings />} label="Settings" />
          <button className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Log out</span>
          </button>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-10 h-10 rounded-full bg-gray-100" />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
        active 
          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium" 
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
      }`}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
}
