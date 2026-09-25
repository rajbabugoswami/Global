import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Matchmaking State
// A user waiting looks like: { socketId: string, type: 'video'|'audio', country: string, language: string, lastMatched: string[] }
let waitingQueue = [];
let activeMatches = new Map(); // Maps socketId -> partnerSocketId

// Group Rooms State
let socketToRoom = new Map(); // socket.id -> roomId

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // 1. Join Random Matchmaking Queue
    socket.on("join-random-queue", (preferences) => {
      // Preferences: { type: 'video', country: 'All', language: 'All' }
      
      // Clean up existing if any
      waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
      
      // If already matched, end that match first
      if (activeMatches.has(socket.id)) {
        const partner = activeMatches.get(socket.id);
        activeMatches.delete(socket.id);
        activeMatches.delete(partner);
        io.to(partner).emit("partner-disconnected");
      }

      // Check for a match
      const partnerIndex = waitingQueue.findIndex(u => {
        // Basic matching logic: 
        // same type (video/audio)
        if (u.type !== preferences.type) return false;
        
        if (preferences.country !== 'Worldwide' || u.country !== 'Worldwide') {
          if (preferences.country !== u.country) return false;
        }
        
        if (preferences.language !== 'Any Language' || u.language !== 'Any Language') {
          if (preferences.language !== u.language) return false;
        }
        
        return true;
      });

      if (partnerIndex !== -1) {
        // Found a match
        const partner = waitingQueue.splice(partnerIndex, 1)[0];
        
        activeMatches.set(socket.id, partner.socketId);
        activeMatches.set(partner.socketId, socket.id);

        console.log(`Matched ${socket.id} with ${partner.socketId}`);
        
        // Notify both sides. Tell partner to initiate call (caller = true)
        io.to(socket.id).emit("match-found", { partnerId: partner.socketId, caller: true });
        io.to(partner.socketId).emit("match-found", { partnerId: socket.id, caller: false });
      } else {
        // No match, add to queue
        waitingQueue.push({ 
          socketId: socket.id, 
          ...preferences 
        });
      }
    });

    // 2. Next / Leave Match
    socket.on("leave-match", () => {
      if (activeMatches.has(socket.id)) {
        const partner = activeMatches.get(socket.id);
        activeMatches.delete(socket.id);
        activeMatches.delete(partner);
        io.to(partner).emit("partner-disconnected");
      }
      waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    });

    // 3. WebRTC Signaling (Directly to partner)
    socket.on("call-user", (data) => {
      if (activeMatches.get(socket.id) === data.to) {
        io.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id
        });
      }
    });

    socket.on("make-answer", (data) => {
      if (activeMatches.get(socket.id) === data.to) {
        io.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer
        });
      }
    });

    socket.on("ice-candidate", (data) => {
      if (activeMatches.get(socket.id) === data.to) {
        io.to(data.to).emit("ice-candidate-received", data.candidate);
      }
    });

    // 4. Text Chat during Match
    socket.on("send-match-message", (data) => {
      const partner = activeMatches.get(socket.id);
      if (partner) {
        io.to(partner).emit("receive-match-message", {
          text: data.text,
          time: data.time,
          senderId: 'partner'
        });
      }
    });

    // 5. Monkey App Features (Add Time, Add Friend)
    socket.on("add-time", () => {
      const partner = activeMatches.get(socket.id);
      if (partner) {
        io.to(partner).emit("partner-added-time");
      }
    });

    socket.on("add-friend", () => {
      const partner = activeMatches.get(socket.id);
      if (partner) {
        io.to(partner).emit("friend-request-received");
      }
    });

    socket.on("accept-friend", () => {
      const partner = activeMatches.get(socket.id);
      if (partner) {
        io.to(partner).emit("friend-request-accepted");
      }
    });

    // Handle standard chat events (Global Room fallback)
    socket.on("send-message", (data) => {
      io.emit("receive-message", data);
    });

    // ==========================================
    // GROUP CALLING LOGIC (WebRTC Mesh)
    // ==========================================
    socket.on("join-group-room", (roomId) => {
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);
      
      // Notify others in the room that a new user connected
      socket.to(roomId).emit("group-user-connected", socket.id);
    });

    socket.on("group-signal", (data) => {
      // data: { to: string, signal: any }
      io.to(data.to).emit("group-signal", {
        from: socket.id,
        signal: data.signal
      });
    });

    socket.on("group-chat-message", (data) => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        io.to(roomId).emit("group-chat-message", {
          senderId: socket.id,
          text: data.text,
          time: data.time
        });
      }
    });

    socket.on("leave-group-room", () => {
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        socket.leave(roomId);
        socketToRoom.delete(socket.id);
        socket.to(roomId).emit("group-user-disconnected", socket.id);
      }
    });

    // ==========================================
    // DISCONNECT
    // ==========================================
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
      
      if (activeMatches.has(socket.id)) {
        const partner = activeMatches.get(socket.id);
        activeMatches.delete(socket.id);
        activeMatches.delete(partner);
        io.to(partner).emit("partner-disconnected");
      }

      // Group calling disconnect cleanup
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        socketToRoom.delete(socket.id);
        socket.to(roomId).emit("group-user-disconnected", socket.id);
      }
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
