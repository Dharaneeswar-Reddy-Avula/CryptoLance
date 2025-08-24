import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import AdminRoutes from "./routes/AdminRoutes.js";

// Import your existing routes

import BidRoutes from "./routes/BidRoutes.js";
import UserRoutes from "./routes/UserRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import HFTtokenRoutes from "./routes/HFTtokenRoutes.js";
import TreasuryRoutes from "./routes/TreasuryRoutes.js";
import EscrowRoutes from "./routes/EscrowRoutes.js";
import ProposalManagerRoutes from "./routes/ProposalManagerRoutes.js";
import PortfolioRoutes from "./routes/PortfolioRoutes.js";
import gigRoutes from "./routes/GigRoutes.js";
import messageRoutes from "./routes/chatRoutes.js";
import ActiveFreelancersRoutes from "./routes/ActiveFreelancersRoutes.js";
import CrossPortfolioRoutes from "./routes/CrossPortfolioRoutes.js";
import ProposalRoutes from "./routes/ProposalRoutes.js";

// Import the WebSocket configuration
import { initSocket } from "./socket.js";

// Load environment variables
dotenv.config();
const PORT = process.env.PORT || 3002;

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware to parse JSON and enable CORS
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://crypto-lance-gamma.vercel.app",
      "https://crypto-lance-seven.vercel.app",
    ],
    credentials: true, // if you want to allow cookies/auth headers
  })
);
// app.use(cors());
// All your existing routes
app.use("/api/proposals", ProposalRoutes);
app.use("/api/bids", BidRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/hftToken", HFTtokenRoutes);
app.use("/api/treasury", TreasuryRoutes);
app.use("/api/escrow", EscrowRoutes);
app.use("/api/proposalManager", ProposalManagerRoutes);
app.use("/api/portfolio", PortfolioRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/activeFreelancers", ActiveFreelancersRoutes);
app.use("/api/cross-portfolio", CrossPortfolioRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Message field is required" });
    }

    console.log("Proxying message to Flask API:", userMessage);

    const flaskApiUrl = "http://127.0.0.1:5000/chat";

    const flaskResponse = await fetch(flaskApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    }).catch((err) => {
      throw new Error(`Fetch failed: ${err.message}`);
    });

    console.log("Flask API response status:", flaskResponse.status);

    if (!flaskResponse.ok) {
      const errorData = await flaskResponse.json().catch(() => ({}));
      console.error("Flask API error response:", errorData);
      return res.status(flaskResponse.status).json(errorData);
    }

    const responseData = await flaskResponse.json();
    res.json(responseData);
  } catch (error) {
    console.error("Detailed error proxying to Flask API:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  });

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
