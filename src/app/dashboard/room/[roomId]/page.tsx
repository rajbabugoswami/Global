"use client";

import { useEffect, useRef, useState, use } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, MonitorUp, MessageSquare, Maximize, Minimize, Settings, Users, Link2, CheckCircle2, Send, PlayCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface RoomProps {
  params: Promise<{ roomId: string }>;
}

interface PeerConnectionMap {
  [socketId: string]: RTCPeerConnection;
}

interface StreamMap {
  [socketId: string]: MediaStream;
}

interface ChatMessage {
  senderId: string;
  text: string;
  time: string;
}

export default function GroupRoomPage(props: RoomProps) {
  const params = use(props.params);
  const roomId = params.roomId;
  
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Media State
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  
  // Peer State
  const peersRef = useRef<PeerConnectionMap>({});
  const [remoteStreams, setRemoteStreams] = useState<StreamMap>({});
  const [participantsCount, setParticipantsCount] = useState(1);
  
  // UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Wallet & Timer State
  const [walletLoading, setWalletLoading] = useState(true);
  const [availableMins, setAvailableMins] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showAdWall, setShowAdWall] = useState(false);
  const [adLoading, setAdLoading] = useState(false);

  useEffect(() => {
    fetch('/api/wallet')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAvailableMins(data.totalAvailableMins);
          if (data.totalAvailableMins <= 0) {
            setShowAdWall(true);
          } else {
            setTimerSeconds(data.totalAvailableMins * 60);
          }
        }
        setWalletLoading(false);
      });
  }, []);

  useEffect(() => {
    if (timerSeconds > 0 && !showAdWall && !walletLoading) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = '/dashboard';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerSeconds, showAdWall, walletLoading]);

  const handleWatchAd = async () => {
    setAdLoading(true);
    // Simulate watching an ad (e.g. 3 seconds)
    setTimeout(async () => {
      const res = await fetch('/api/ads/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adProvider: 'SimulatedAdNetwork', adToken: 'mock_token_123' })
      });
      const data = await res.json();
      if (res.ok) {
        setAvailableMins(data.newWalletBalance);
        setTimerSeconds(data.newWalletBalance * 60);
        setShowAdWall(false);
        alert("You earned 5 minutes! Returning to call.");
      }
      setAdLoading(false);
    }, 3000);
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        newSocket.emit("join-group-room", roomId);
      })
      .catch((err) => {
        console.error("Error accessing media devices.", err);
        // Fallback to join without media
        newSocket.emit("join-group-room", roomId);
      });

    // Handle new user joining the room
    newSocket.on("group-user-connected", async (newUserId: string) => {
      console.log("User connected to group:", newUserId);
      const pc = createPeerConnection(newUserId, newSocket, true);
      peersRef.current[newUserId] = pc;
    });

    // Handle incoming signals (offers, answers, ice)
    newSocket.on("group-signal", async (data: { from: string, signal: any }) => {
      const { from, signal } = data;
      
      let pc = peersRef.current[from];
      
      if (signal.type === "offer") {
        if (!pc) {
          pc = createPeerConnection(from, newSocket, false);
          peersRef.current[from] = pc;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit("group-signal", { to: from, signal: answer });
      } else if (signal.type === "answer") {
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
        }
      } else if (signal.candidate) {
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(signal));
        }
      }
    });

    // Handle user disconnecting
    newSocket.on("group-user-disconnected", (userId: string) => {
      console.log("User disconnected from group:", userId);
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
      setParticipantsCount(Object.keys(peersRef.current).length + 1);
    });

    // Chat
    newSocket.on("group-chat-message", (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
      if (!chatOpen) {
        // You could add an unread badge state here
      }
    });

    return () => {
      newSocket.emit("leave-group-room");
      newSocket.close();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, [roomId]);

  // Helper to create Peer Connection
  const createPeerConnection = (partnerId: string, socketInstance: Socket, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    
    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("group-signal", { to: partnerId, signal: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [partnerId]: event.streams[0]
      }));
      setParticipantsCount(Object.keys(peersRef.current).length + 1);
    };

    if (isInitiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socketInstance.emit("group-signal", { to: partnerId, signal: offer });
      });
    }

    return pc;
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micEnabled;
        setMicEnabled(!micEnabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraEnabled;
        setCameraEnabled(!cameraEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in all peer connections
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });
        
        // Display locally
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenTrack.onended = () => {
          stopScreenShare();
        };
        
        setScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      
      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
    }
    setScreenSharing(false);
  };

  const copyInviteLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !socket) return;
    socket.emit("group-chat-message", {
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setChatInput("");
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  // Dynamic grid calculation
  const totalVideos = Object.keys(remoteStreams).length + 1;
  let gridCols = 'grid-cols-1';
  if (totalVideos === 2) gridCols = 'grid-cols-1 md:grid-cols-2';
  else if (totalVideos === 3 || totalVideos === 4) gridCols = 'grid-cols-2';
  else if (totalVideos > 4 && totalVideos <= 6) gridCols = 'grid-cols-2 md:grid-cols-3';
  else if (totalVideos > 6) gridCols = 'grid-cols-3 md:grid-cols-4';

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      const elem = containerRef.current as any;
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
      setIsFullscreen(true);
    } else {
      const doc = document as any;
      if (doc.exitFullscreen) doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      else if (doc.msExitFullscreen) doc.msExitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (walletLoading) return <div className="h-screen flex items-center justify-center bg-[#050510] text-white">Loading...</div>;

  if (showAdWall) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050510] text-white p-6">
        <div className="max-w-md w-full bg-black/60 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] -z-10"></div>
          <Clock className="w-16 h-16 text-red-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Out of Calling Minutes!</h2>
          <p className="text-gray-400 mb-8">Your daily limit is reached. Watch a short advertisement to instantly get 5 more minutes, or upgrade your plan for unlimited calling.</p>
          
          <button 
            onClick={handleWatchAd}
            disabled={adLoading}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl mb-4 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <PlayCircle className="w-5 h-5" />
            {adLoading ? "Watching Ad..." : "Watch Ad & Get 5 Mins"}
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard/account'}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all"
          >
            Upgrade Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex h-[calc(100vh-80px)] bg-[#050510] text-white ${isFullscreen ? 'absolute inset-0 z-50 h-screen w-screen' : ''}`}>
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="h-16 bg-black/40 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h1 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">GlobalConnect Group Call</h1>
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {participantsCount} Participant{participantsCount !== 1 ? 's' : ''}
            </div>
            <div className="px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={copyInviteLink} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${linkCopied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}
            >
              {linkCopied ? <CheckCircle2 className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              {linkCopied ? 'Copied!' : 'Copy Invite Link'}
            </button>
            <button onClick={toggleFullscreen} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex items-center justify-center">
          <div className={`w-full max-w-7xl mx-auto grid gap-4 ${gridCols} auto-rows-fr items-center justify-center`} style={{ gridAutoRows: '1fr', height: '100%', maxHeight: '100%' }}>
            
            {/* Local Video */}
            <div className="relative rounded-2xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl group w-full h-full min-h-[200px]">
              <video 
                ref={localVideoRef}
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-sm font-bold flex items-center gap-2 border border-white/10">
                  You {!micEnabled && <MicOff className="w-3 h-3 text-red-400" />}
                </div>
              </div>
            </div>

            {/* Remote Videos */}
            {Object.entries(remoteStreams).map(([id, stream]) => (
              <div key={id} className="relative rounded-2xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl group w-full h-full min-h-[200px]">
                <video 
                  autoPlay 
                  playsInline 
                  ref={el => { if (el) el.srcObject = stream; }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-sm font-bold flex items-center gap-2 border border-white/10">
                    Participant ({id.substring(0, 4)})
                  </div>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Controls Bar */}
        <div className="h-20 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-4 px-6 z-10">
          <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all shadow-lg ${micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          
          <button onClick={toggleCamera} className={`p-4 rounded-2xl transition-all shadow-lg ${cameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
            {cameraEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          
          <button onClick={toggleScreenShare} className={`p-4 rounded-2xl transition-all shadow-lg ${screenSharing ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/50' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
            <MonitorUp className="w-6 h-6" />
          </button>

          <button onClick={() => setChatOpen(!chatOpen)} className={`p-4 rounded-2xl transition-all shadow-lg hidden md:block ${chatOpen ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/50' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
            <MessageSquare className="w-6 h-6" />
          </button>
          
          <button onClick={() => window.location.href = '/dashboard'} className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center gap-2 ml-4">
            <PhoneOff className="w-5 h-5" /> Leave
          </button>
        </div>
      </div>

      {/* Right Sidebar - Chat */}
      {chatOpen && (
        <div className="w-80 bg-[#0a0a1a] border-l border-white/10 flex flex-col z-20 shadow-2xl">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h3 className="font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" /> Group Chat
            </h3>
            <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No messages yet.<br/>Say hello to the group!</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.senderId === socket?.id;
                return (
                  <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-gray-400 mb-1 ml-1">User ({msg.senderId.substring(0, 4)})</span>}
                    <div className={`px-4 py-2.5 max-w-[85%] rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                      <p className="text-sm break-words">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">{msg.time}</span>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="bg-white/5 border border-white/10 rounded-xl flex items-center p-1">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Message group..."
                className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm text-white placeholder-gray-500"
              />
              <button 
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
