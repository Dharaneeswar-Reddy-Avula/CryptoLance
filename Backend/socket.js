import { Server } from "socket.io"

let io = null

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://crypto-lance-gamma.vercel.app",
        "https://crypto-lance-seven.vercel.app",
        "https://cryptolance-qgzz.onrender.com"
      ],
      credentials: true,
      methods: ["GET", "POST"]
    },
    transports: ["websocket", "polling"]
  })

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id)
    
    const userId = socket.handshake.query.userId
    if (userId) {
      socket.userId = userId
      socket.join(userId) // Join user's personal room
      console.log(`👤 User ${userId} joined their room`)
    }

    // Handle user disconnection
    socket.on("disconnect", (reason) => {
      console.log("🔌 User disconnected:", socket.id, "Reason:", reason)
    })

    // Handle new message
    socket.on("newMessage", (message) => {
      console.log("📨 New message received:", message)
      // Broadcast to all connected clients
      io.emit("newMessage", message)
    })

    // Handle typing indicators
    socket.on("typing", (data) => {
      socket.broadcast.to(data.receiverId).emit("typing", {
        senderId: data.senderId,
        isTyping: data.isTyping
      })
    })

    // Handle stop typing
    socket.on("stopTyping", (data) => {
      socket.broadcast.to(data.receiverId).emit("stopTyping", {
        senderId: data.senderId
      })
    })
  })

  console.log("✅ Socket.IO server initialized")
  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call setupSocket first.")
  }
  return io
}

export const emitToUser = (userId, event, data) => {
  if (!io) {
    console.warn("Socket.IO not initialized")
    return false
  }
  
  try {
    io.to(userId).emit(event, data)
    console.log(`📡 Emitted ${event} to user ${userId}`)
    return true
  } catch (error) {
    console.error(`❌ Error emitting ${event} to user ${userId}:`, error)
    return false
  }
}

export const emitToAll = (event, data) => {
  if (!io) {
    console.warn("Socket.IO not initialized")
    return false
  }
  
  try {
    io.emit(event, data)
    console.log(`📡 Emitted ${event} to all users`)
    return true
  } catch (error) {
    console.error(`❌ Error emitting ${event} to all users:`, error)
    return false
  }
}
