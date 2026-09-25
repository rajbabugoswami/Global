"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Search, Phone, Video, MoreVertical, Paperclip, Smile, Send, ShieldCheck, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessage {
  text: string;
  senderId: string;
  time: string;
}

export default function ChatsPage() {
  const [activeChat, setActiveChat] = useState<'global' | 'ai'>('ai');
  
  // Global Room State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  
  // AI Assistant State
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { text: "Hello! I am your personal GlobalConnect AI Assistant. How can I help you today?", senderId: "ai", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("receive-message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, aiMessages, activeChat]);

  const sendMessage = () => {
    if (activeChat === 'global') {
      if (!input.trim() || !socket) return;
      const msg = {
        text: input,
        senderId: socket.id || "unknown",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit("send-message", msg);
      setInput("");
    } else if (activeChat === 'ai') {
      sendAiMessage();
    }
  };

  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiTyping) return;
    
    const userMsg: ChatMessage = {
      text: aiInput,
      senderId: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      
      const aiMsg: ChatMessage = {
        text: data.response || "Sorry, I encountered an error processing your request.",
        senderId: "ai",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setAiMessages(prev => [...prev, { text: "Network error communicating with AI.", senderId: "ai", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-80px)] bg-[#050510] text-white">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-[#050510]/50 backdrop-blur-3xl z-10">
        <div className="p-6 pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-gray-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* AI Assistant Item */}
          <div onClick={() => setActiveChat('ai')} className={`p-3 border rounded-2xl flex items-center gap-3 cursor-pointer relative overflow-hidden group transition-all ${activeChat === 'ai' ? 'bg-purple-600/10 border-purple-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <span className="text-xl font-bold text-purple-400">AI</span>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#050510]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-white truncate text-sm">AI Assistant</h3>
                <span className="text-xs text-purple-400 font-bold">Online</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{aiMessages[aiMessages.length - 1]?.text || "Ready to assist you..."}</p>
            </div>
          </div>

          {/* Global Room Item */}
          <div onClick={() => setActiveChat('global')} className={`p-3 border rounded-2xl flex items-center gap-3 cursor-pointer relative overflow-hidden group transition-all ${activeChat === 'global' ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-400" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#050510]"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-white truncate text-sm">Global Room (Live)</h3>
                <span className="text-xs text-blue-400 font-bold">Now</span>
              </div>
              <p className="text-xs text-gray-400 truncate">Real-time WebSocket active...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Area - Chat Window */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Chat Header */}
        <div className="h-20 border-b border-white/10 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full ${activeChat === 'ai' ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'bg-blue-500/20 border-blue-500/40 text-blue-400'} border flex items-center justify-center`}>
                {activeChat === 'ai' ? <span className="text-xl font-bold">AI</span> : <Globe className="w-6 h-6" />}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#050510] ${activeChat === 'ai' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
            </div>
            <div>
              <h2 className="font-bold text-lg">{activeChat === 'ai' ? 'GlobalConnect AI Assistant' : 'Global Room (Live)'}</h2>
              <p className={`text-xs font-bold flex items-center gap-1 ${activeChat === 'ai' ? 'text-purple-400' : 'text-green-400'}`}>
                <ShieldCheck className="w-3 h-3" /> {activeChat === 'ai' ? 'Intelligent Private Connection' : '3D Secured Connection'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scroll-smooth">
          <div className="flex justify-center mt-4 mb-4">
            <span className={`px-4 py-1.5 rounded-full border text-xs font-bold backdrop-blur-md ${activeChat === 'ai' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
              {activeChat === 'ai' ? 'End-to-end Encrypted AI Session' : 'End-to-end Encrypted 3D Session'}
            </span>
          </div>
          
          {(activeChat === 'ai' ? aiMessages : messages).map((msg, i) => {
            const isMe = activeChat === 'ai' ? msg.senderId === 'me' : msg.senderId === socket?.id;
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs border border-white/5 font-bold">
                      {activeChat === 'ai' ? 'AI' : msg.senderId.substring(0, 2)}
                    </div>
                  )}
                  <div className={`px-5 py-3 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-sm shadow-[0_5px_15px_rgba(59,130,246,0.3)]' : 'bg-white/10 text-white rounded-bl-sm border border-white/10 shadow-lg'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 mt-1 px-1">{msg.time}</span>
              </motion.div>
            );
          })}
          
          {isAiTyping && activeChat === 'ai' && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-2 max-w-[70%]">
                <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-xs border border-white/5 font-bold">AI</div>
                <div className="px-5 py-4 rounded-2xl bg-white/10 text-white rounded-bl-sm border border-white/10 flex gap-1">
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
             </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 pt-2 shrink-0">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2 backdrop-blur-xl shadow-lg">
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text"
              value={activeChat === 'ai' ? aiInput : input}
              onChange={(e) => activeChat === 'ai' ? setAiInput(e.target.value) : setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={activeChat === 'ai' ? "Ask the AI Assistant..." : "Type a real-time message..."}
              className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm text-white placeholder-gray-500"
            />
            <button 
              onClick={sendMessage}
              disabled={activeChat === 'ai' ? !aiInput.trim() || isAiTyping : !input.trim()}
              className={`p-3 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] disabled:opacity-50 ${activeChat === 'ai' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
