import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Initialize the Next.js app
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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

    // Chat events
    socket.on("send-message", (data) => {
      io.emit("receive-message", data);
    });

    // WebRTC Signaling events
    socket.on("call-user", (data) => {
      // In a real app, you would target a specific user ID.
      // Here we broadcast to everyone else for demo purposes.
      socket.broadcast.emit("call-made", {
        offer: data.offer,
        socket: socket.id
      });
    });

    socket.on("make-answer", (data) => {
      socket.to(data.to).emit("answer-made", {
        socket: socket.id,
        answer: data.answer
      });
    });

    socket.on("ice-candidate", (data) => {
      socket.broadcast.emit("ice-candidate-received", data.candidate);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
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
