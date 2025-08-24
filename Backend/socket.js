// src/lib/socket.js
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://crypto-lance-gamma.vercel.app",
        "http://localhost:3001",
      ],
      credentials: true,
    },
  });

  const userSocketMap = {};

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const rawUserId = socket.handshake.query.userId;
    const userId = (rawUserId || "").toLowerCase();

    if (userId) {
      userSocketMap[userId] = socket.id;
      console.log(`User ${userId} connected. Socket ID: ${socket.id}`);

      // Emit online users to all connected clients
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    socket.on("disconnect", () => {
      console.log("A user disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected. Socket ID: ${socket.id}`);

        // Emit updated online users to all connected clients
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      }
    });

    // Handle typing events
    socket.on("typing", (data) => {
      const receiverSocketId = userSocketMap[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", {
          userId: data.userId,
          isTyping: data.isTyping,
        });
      }
    });

    // Handle stop typing events
    socket.on("stopTyping", (data) => {
      const receiverSocketId = userSocketMap[data.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStopTyping", {
          userId: data.userId,
          isTyping: false,
        });
      }
    });

    // Debug: Log connection events
    console.log("Current userSocketMap:", userSocketMap);
  });

  return io;
};

export const getRecieverSocketId = (userId) => {
  if (!io) return null;

  // Get all connected sockets
  const sockets = io.sockets.sockets;
  let targetSocketId = null;

  // Find the socket ID for the given user ID
  for (const [socketId, socket] of sockets) {
    if (socket.handshake.query.userId === userId) {
      targetSocketId = socketId;
      break;
    }
  }

  return targetSocketId;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

// Helper function to emit messages to specific users
export const emitToUser = (userId, event, data) => {
  if (!io) return false;

  const socketId = getRecieverSocketId(userId);
  if (socketId) {
    console.log(`Emitting ${event} to user ${userId} (socket: ${socketId})`);
    io.to(socketId).emit(event, data);
    return true;
  } else {
    console.log(`User ${userId} not found in socket map`);
  }
  return false;
};
