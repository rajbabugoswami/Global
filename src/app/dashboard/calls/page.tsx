"use client";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from "lucide-react";

export default function CallsPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const [inCall, setInCall] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Get Local Media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing media devices.", err));

    newSocket.on("call-made", async (data) => {
      // In a real app, prompt the user to accept the call first.
      console.log("Incoming call received");
      setInCall(true);
      await createPeerConnection(newSocket, data.socket);
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      
      const answer = await peerConnection.current?.createAnswer();
      await peerConnection.current?.setLocalDescription(answer);
      
      newSocket.emit("make-answer", {
        answer,
        to: data.socket
      });
    });

    newSocket.on("answer-made", async (data) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    newSocket.on("ice-candidate-received", async (candidate) => {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      newSocket.close();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const createPeerConnection = async (socketInstance: Socket, remoteSocketId?: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" }
      ]
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", {
          candidate: event.candidate,
          to: remoteSocketId
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.current = pc;
  };

  const callUser = async () => {
    if (!socket) return;
    setInCall(true);
    await createPeerConnection(socket);
    
    const offer = await peerConnection.current?.createOffer();
    await peerConnection.current?.setLocalDescription(offer);
    
    // In a real app we'd pass a specific user ID to call
    socket.emit("call-user", { offer });
  };

  const endCall = () => {
    setInCall(false);
    peerConnection.current?.close();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1120] text-white">
      <div className="h-16 border-b border-gray-800 px-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">Video Call Room</h2>
        {!inCall && (
          <button 
            onClick={callUser}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Phone className="w-5 h-5" /> Start Global Call
          </button>
        )}
      </div>

      <div className="flex-1 p-6 relative flex flex-col lg:flex-row gap-6 items-center justify-center">
        {/* Remote Video (Main) */}
        <div className="relative w-full lg:flex-1 h-[40vh] lg:h-full bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800">
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline
            className="w-full h-full object-cover"
          />
          {!inCall && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
              <p className="text-gray-400">Waiting for someone to join the call...</p>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium">
            Remote Peer
          </div>
        </div>

        {/* Local Video (PiP) */}
        <div className="relative w-48 h-72 lg:absolute lg:bottom-6 lg:right-6 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 z-10">
          <video 
            ref={localVideoRef}
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-medium">
            You
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="h-24 bg-gray-950/80 backdrop-blur-xl border-t border-gray-800 flex items-center justify-center gap-6">
        <button 
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${micEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={inCall ? endCall : callUser}
          className={`p-5 rounded-full transition-all shadow-lg ${inCall ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {inCall ? <PhoneOff className="w-8 h-8 text-white" /> : <Phone className="w-8 h-8 text-white" />}
        </button>

        <button 
          onClick={toggleCamera}
          className={`p-4 rounded-full transition-all ${cameraEnabled ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          {cameraEnabled ? <VideoIcon className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
