"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff, Send, Globe, AlertTriangle, Play, FastForward, StopCircle, MapPin, Languages, MessageSquare, Maximize, Minimize, Clock, UserPlus, Check, Lock, Crown } from "lucide-react";
import GlobeCanvas from "@/components/3d/Globe";
import { motion, AnimatePresence } from "framer-motion";

const COUNTRIES = ["Worldwide", "United States", "India", "United Kingdom", "Canada", "Australia", "Brazil", "France", "Germany", "Japan", "Mexico"];
const LANGUAGES = ["Any Language", "English", "Hindi", "Spanish", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Japanese", "German"];

interface MatchMessage {
  text: string;
  senderId: string;
  time: string;
}

export default function OmeTVStyleDashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Media States
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // App States
  const [matchState, setMatchState] = useState<'idle' | 'searching' | 'connecting' | 'connected'>('idle');
  const [countryFilter, setCountryFilter] = useState("Worldwide");
  const [languageFilter, setLanguageFilter] = useState("Any Language");
  
  // Chat States
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Monkey App Features
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [friendStatus, setFriendStatus] = useState<'none' | 'sent' | 'received' | 'friends'>('none');

  // Ad Lock Feature
  const [isLocked, setIsLocked] = useState(true);
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  const handleWatchAd = () => {
    setIsAdPlaying(true);
    setTimeout(() => {
      setIsAdPlaying(false);
      setIsLocked(false);
      setTimeLeft(300); // 5 minutes free
    }, 3000);
  };
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    // Matchmaking Events
    newSocket.on("match-found", async (data: { partnerId: string, caller: boolean }) => {
      setMatchState('connecting');
      setMessages([]);
      setFriendStatus('none');
      await createPeerConnection(newSocket, data.partnerId);
      
      if (data.caller) {
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        newSocket.emit("call-user", { offer, to: data.partnerId });
      }
    });

    newSocket.on("partner-disconnected", () => {
      setMatchState('idle');
      setTimeLeft(null);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      setMessages((prev) => [...prev, { text: "Stranger disconnected.", senderId: "system", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });

    // WebRTC Signaling
    newSocket.on("call-made", async (data) => {
      setMatchState('connected');
      setTimeLeft(15);
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      newSocket.emit("make-answer", { answer, to: data.socket });
    });

    newSocket.on("answer-made", async (data) => {
      setMatchState('connected');
      setTimeLeft(15);
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    newSocket.on("ice-candidate-received", async (candidate) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    // Chat
    newSocket.on("receive-match-message", (msg: MatchMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Monkey App Features
    newSocket.on("partner-added-time", () => {
      setTimeLeft(prev => prev !== null ? prev + 15 : 15);
    });

    newSocket.on("friend-request-received", () => {
      setFriendStatus(prev => {
        if (prev === 'sent') {
          newSocket.emit("accept-friend");
          return 'friends';
        }
        return 'received';
      });
    });

    newSocket.on("friend-request-accepted", () => {
      setFriendStatus('friends');
      setMessages((prev) => [...prev, { text: "You are now friends! You can find them in Private Chats later.", senderId: "system", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });

    return () => {
      newSocket.close();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (matchState === 'connected' && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (matchState === 'connected' && timeLeft === 0) {
      nextMatch();
    }
    
    // Ad lock expiry logic (overall session)
    if (!isLocked && timeLeft !== null && timeLeft > 0 && matchState !== 'connected') {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (!isLocked && timeLeft === 0) {
      setIsLocked(true);
      setMatchState('idle');
      nextMatch();
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [matchState, timeLeft, isLocked]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createPeerConnection = async (socketInstance: Socket, remoteSocketId: string) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", { candidate: event.candidate, to: remoteSocketId });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
    peerConnection.current = pc;
  };

  const startMatching = () => {
    if (!socket) return;
    setMatchState('searching');
    setTimeLeft(null);
    setFriendStatus('none');
    setMessages([]);
    socket.emit("join-random-queue", { type: 'video', country: countryFilter, language: languageFilter });
  };

  const nextMatch = () => {
    if (!socket) return;
    socket.emit("leave-match");
    setTimeLeft(null);
    setFriendStatus('none');
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    startMatching();
  };

  const stopMatching = () => {
    if (!socket) return;
    socket.emit("leave-match");
    setMatchState('idle');
    setTimeLeft(null);
    setFriendStatus('none');
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
  };

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !micEnabled;
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !cameraEnabled;
      setCameraEnabled(!cameraEnabled);
    }
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket || matchState !== 'connected') return;
    
    const msg = {
      text: chatInput,
      senderId: "me",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, msg]);
    socket.emit("send-match-message", msg);
    setChatInput("");
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      const elem = videoContainerRef.current as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch((err: any) => console.error(err));
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) { /* Safari */
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) { /* IE11 */
        doc.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };
  
  const addTime = () => {
    if (!socket || matchState !== 'connected') return;
    setTimeLeft(prev => prev !== null ? prev + 15 : 15);
    socket.emit("add-time");
  };

  const addFriend = () => {
    if (!socket || matchState !== 'connected') return;
    
    if (friendStatus === 'received') {
      setFriendStatus('friends');
      socket.emit("accept-friend");
      setMessages((prev) => [...prev, { text: "You are now friends! You can find them in Private Chats later.", senderId: "system", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    } else {
      setFriendStatus('sent');
      socket.emit("add-friend");
      setMessages((prev) => [...prev, { text: "Friend request sent.", senderId: "system", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <>
      {isAdPlaying && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
          <GlobeCanvas />
          <div className="relative z-10 bg-black/60 backdrop-blur-xl border border-white/20 p-12 rounded-3xl text-center max-w-lg shadow-[0_0_100px_rgba(59,130,246,0.3)]">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">Advertisement Playing...</h2>
            <p className="text-gray-400">Please wait while we unlock your 5-minute free chat session.</p>
          </div>
        </div>
      )}

      {isLocked && !isAdPlaying && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050510] text-white p-6">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <GlobeCanvas />
          </div>
          <div className="relative z-10 bg-black/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-3xl text-center max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black mb-4">Unlock Live Chat</h1>
            <p className="text-gray-400 mb-10 text-lg">Watch a quick ad to get 5 minutes of free GlobalConnect chat, or upgrade to Premium for unlimited, ad-free access.</p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button onClick={handleWatchAd} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-lg">
                <Play className="w-6 h-6 text-blue-400" /> Watch Ad to Chat
              </button>
              <Link href="/dashboard/account" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-lg shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                <Crown className="w-6 h-6 text-white" /> Get Premium
              </Link>
            </div>
          </div>
        </div>
      )}

    <div className={`relative flex-1 flex flex-col h-[calc(100vh-80px)] bg-[#050510] text-white overflow-hidden ${isLocked ? 'hidden' : ''}`}>
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <GlobeCanvas />
      </div>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row h-full p-4 lg:p-6 gap-6">
        
        {/* LEFT COLUMN: Video Feeds & Controls */}
        <div className="flex-1 flex flex-col h-full space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Random Match</h1>
                <div className="flex items-center gap-2 text-xs font-medium mt-1">
                  <span className={`w-2 h-2 rounded-full ${matchState === 'idle' ? 'bg-gray-400' : matchState === 'searching' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></span>
                  <span className="text-gray-400">
                    {matchState === 'idle' ? 'Status: Idle' : matchState === 'searching' ? 'Status: Searching...' : matchState === 'connecting' ? 'Status: Connecting...' : 'Status: Connected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={toggleFullscreen} className={`p-2.5 rounded-xl transition-colors ${isFullscreen ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button onClick={toggleMic} className={`p-2.5 rounded-xl transition-colors ${micEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button onClick={toggleCamera} className={`p-2.5 rounded-xl transition-colors ${cameraEnabled ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {cameraEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Video Container (Split Screen) */}
          <div ref={videoContainerRef} className={`flex-1 flex flex-col md:flex-row gap-6 min-h-0 rounded-3xl ${isFullscreen ? 'bg-[#050510] p-4 absolute inset-0 z-50 h-screen w-screen' : 'bg-[#050510] md:bg-transparent p-2 md:p-0'}`}>
            
            {/* Stranger's Video */}
            <div className="flex-1 relative rounded-3xl overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center">
              <video 
                ref={remoteVideoRef}
                autoPlay 
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-500 ${matchState === 'connected' ? 'opacity-100' : 'opacity-0'}`}
              />
              
              {matchState !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-10 p-6 text-center">
                  <Globe className={`w-16 h-16 mb-4 ${matchState === 'searching' ? 'text-blue-400 animate-spin-slow' : 'text-gray-500'}`} />
                  <h2 className="text-xl font-bold text-white mb-2">
                    {matchState === 'searching' ? 'Searching for a stranger...' : matchState === 'connecting' ? 'Connecting...' : 'Stranger\'s Video'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {matchState === 'searching' ? `Looking in ${countryFilter} • ${languageFilter}` : 'Press Start to meet someone new.'}
                  </p>
                </div>
              )}

              {matchState === 'connected' && timeLeft !== null && (
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 backdrop-blur-md transition-colors ${timeLeft <= 5 ? 'bg-red-500/80 border-red-400 text-white animate-pulse' : 'bg-black/50 border-white/10 text-white'}`}>
                  <Clock className="w-3 h-3" /> 0:{timeLeft.toString().padStart(2, '0')}
                </div>
              )}
              {matchState === 'connected' && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="p-2 bg-black/50 backdrop-blur-md rounded-full text-red-400 border border-white/10 hover:bg-red-500/20 transition-all">
                    <AlertTriangle className="w-4 h-4" />
                  </button>
                </div>
              )}
              {matchState === 'connected' && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addTime}
                    className="px-4 py-2 bg-black/50 backdrop-blur-md hover:bg-blue-600/80 text-white border border-white/20 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
                  >
                    <Clock className="w-4 h-4" /> +15s
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addFriend}
                    disabled={friendStatus === 'sent' || friendStatus === 'friends'}
                    className={`px-4 py-2 backdrop-blur-md text-white border border-white/20 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-lg ${friendStatus === 'sent' ? 'bg-gray-600/50' : friendStatus === 'friends' ? 'bg-green-600/80' : friendStatus === 'received' ? 'bg-yellow-600/80 hover:bg-yellow-500' : 'bg-black/50 hover:bg-blue-600/80'}`}
                  >
                    {friendStatus === 'friends' ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {friendStatus === 'sent' ? 'Sent' : friendStatus === 'received' ? 'Accept Request' : friendStatus === 'friends' ? 'Friends' : 'Add Friend'}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Your Video */}
            <div className="flex-1 relative rounded-3xl overflow-hidden bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <video 
                ref={localVideoRef}
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
                You
              </div>
            </div>
          </div>

          {/* Action Buttons (The OmeTV bottom bar) */}
          <div className="shrink-0 flex justify-center gap-6">
            {matchState === 'idle' ? (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startMatching}
                className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center gap-3 transition-all"
              >
                <Play className="w-6 h-6 fill-current" /> START
              </motion.button>
            ) : (
              <>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopMatching}
                  className="px-10 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center gap-3 transition-all"
                >
                  <StopCircle className="w-6 h-6" /> STOP
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={nextMatch}
                  className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-3 transition-all"
                >
                  NEXT <FastForward className="w-6 h-6 fill-current" />
                </motion.button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Settings & Chat */}
        <div className="w-full lg:w-96 flex flex-col h-full gap-6 shrink-0">
          
          {/* Preferences */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg shrink-0">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Match Preferences</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Country</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    disabled={matchState !== 'idle'}
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Language</label>
                <div className="relative">
                  <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select 
                    disabled={matchState !== 'idle'}
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg flex flex-col min-h-[300px]">
            <div className="p-4 border-b border-white/10 bg-black/20 rounded-t-2xl">
              <h4 className="font-bold text-sm text-white">Live Chat</h4>
            </div>
            
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {matchState !== 'connected' && messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <MessageSquare className="w-8 h-8 text-white/10 mb-2" />
                  <p className="text-xs text-gray-500">You must be matched with someone to chat.</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.senderId === 'me' ? 'items-end' : msg.senderId === 'system' ? 'items-center' : 'items-start'}`}>
                  {msg.senderId === 'system' ? (
                    <span className="text-[11px] font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full">{msg.text}</span>
                  ) : (
                    <div className={`px-4 py-2.5 max-w-[90%] rounded-2xl ${msg.senderId === 'me' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'}`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/20 border-t border-white/10 rounded-b-2xl shrink-0">
              <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-1 shadow-inner">
                <input 
                  type="text" 
                  disabled={matchState !== 'connected'}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder={matchState === 'connected' ? "Type a message..." : "Waiting..."}
                  className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-white placeholder-gray-500 disabled:opacity-50"
                />
                <button 
                  disabled={matchState !== 'connected' || !chatInput.trim()}
                  onClick={sendChatMessage}
                  className="p-2.5 bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 hover:bg-blue-500"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
