"use client";
import Link from "next/link";
import { Globe, Menu, X, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#050510]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
              Global<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Connect</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Dashboard
                </Link>
                <Link href="/dashboard/calls" className="text-gray-300 hover:text-white font-medium transition-colors">
                  Calls
                </Link>
                <div className="flex items-center gap-4 border-l border-white/10 pl-8">
                  <span className="text-sm text-gray-400">{session.user?.email}</span>
                  <button 
                    onClick={() => signOut()}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all backdrop-blur-md"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 text-gray-300 hover:text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-0.5"
                >
                  <UserPlus className="w-4 h-4" /> Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
