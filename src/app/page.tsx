"use client";
import Link from "next/link";
import { ArrowRight, MessageSquare, Video, Shield, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import GlobeCanvas from "@/components/3d/Globe";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050510] text-white overflow-hidden selection:bg-blue-500/30">
      {/* 3D Background */}
      <GlobeCanvas />

      {/* Floating UI Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Welcome to the Future of Communication
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-2xl">
            Connect <br/> Across Reality
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
            A premium 3D communication platform powered by WebRTC, WebSockets, and immersive WebGL visuals. Break down borders effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="group relative inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(59,130,246,0.6)]"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl text-lg font-bold backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* 3D Glassmorphism Feature Cards */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Video className="w-8 h-8 text-blue-400" />,
              title: "Immersive Video",
              desc: "Crystal clear 4K WebRTC calling with hardware acceleration and 3D spatial audio.",
              delay: 0.4,
              href: "/dashboard"
            },
            {
              icon: <MessageSquare className="w-8 h-8 text-purple-400" />,
              title: "Real-Time Sync",
              desc: "Instant WebSocket messaging with dynamic 3D chat bubbles and read receipts.",
              delay: 0.6,
              href: "/dashboard/chats"
            },
            {
              icon: <Globe2 className="w-8 h-8 text-emerald-400" />,
              title: "Global Reach",
              desc: "Low-latency TURN servers across 14 regions ensuring smooth connections worldwide.",
              delay: 0.8,
              href: "/dashboard/groups"
            }
          ].map((feature, i) => (
            <Link href={feature.href} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.8 }}
                whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
                style={{ transformPerspective: 1000 }}
                className="p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden group relative h-full cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer for AdSense Compliance */}
      <footer className="w-full border-t border-white/10 bg-black/40 backdrop-blur-md mt-20 py-8 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>&copy; {new Date().getFullYear()} GlobalConnect. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
