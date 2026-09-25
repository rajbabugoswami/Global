"use client";
import { Search, Phone, Video, MoreVertical, Paperclip, Send, Smile, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  senderId: string;
  time: string;
}

export default function DashboardPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const myUserId = "user-123"; // In a real app, this comes from NextAuth session

  useEffect(() => {
    // Connect to the custom Socket.IO server we built in server.js
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("receive-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && socket) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input,
        senderId: myUserId,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      socket.emit("send-message", newMessage);
      setInput("");
    }
  };

  return (
    <div className="flex-1 flex h-full">
      {/* Conversations List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Active Chat Item */}
          <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800/50 bg-blue-50/50 dark:bg-blue-900/10 cursor-pointer transition-colors">
            <div className="relative">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Global" alt="Avatar" className="w-12 h-12 rounded-full bg-gray-100" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">Global Room (Live)</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Now</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">Real-time WebSocket chat is active...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Chat Area */}
      <div className="hidden md:flex flex-1 flex-col bg-[#F8FAFC] dark:bg-[#0B1120]">
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Global" alt="Avatar" className="w-10 h-10 rounded-full bg-gray-100" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Global Room (Live)</h2>
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Connected to WebSockets</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
              Today (Real-time connected)
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.senderId === myUserId;
            
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : ''}`}>
                {!isMe && (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`} alt="Avatar" className="w-8 h-8 rounded-full mb-1" />
                )}
                
                <div className={`${
                  isMe 
                    ? "bg-blue-600 text-white rounded-2xl rounded-br-sm" 
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-gray-700/50"
                  } p-4 shadow-sm max-w-md`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className={`text-[10px] mt-1 block ${isMe ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Smile className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
              <Paperclip className="w-6 h-6" />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a real-time message..." 
              className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2 text-gray-900 dark:text-white placeholder-gray-500"
            />
            <button 
              onClick={sendMessage}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
