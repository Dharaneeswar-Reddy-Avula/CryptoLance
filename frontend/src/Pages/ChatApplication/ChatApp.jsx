import React, { useState, useEffect } from "react";
import ChatContainer from "../../Components/chatApplication/ChatContainer";
import Sidebar from "../../Components/chatApplication/Sidebar";
import NoChatSelected from "../../Components/chatApplication/NoChatSelected";
import { useSelector, useDispatch } from "react-redux";
import { connectSocket } from "../../store/authSlice/authSlice";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

import {
  subscribeToMessages,
  unsubscribeFromMessages,
} from "../../store/ChatApplicationSlice/ChatAppSlice";

const ChatApp = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { selectedUser } = useSelector((state) => state.chatApp);
  const { isAuthenticated, socket } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ensure socket is connected when chat app is open and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !socket) {
      console.log("🔌 Connecting socket...");
      dispatch(connectSocket());
    }
  }, [isAuthenticated, socket, dispatch]);

  // Subscribe to messages when socket is available
  useEffect(() => {
    if (socket && socket.connected) {
      console.log("📡 Socket connected, subscribing to messages...");
      dispatch(subscribeToMessages());

      return () => {
        console.log("📡 Unsubscribing from messages...");
        dispatch(unsubscribeFromMessages());
      };
    }
  }, [socket, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log("ChatApp - Socket status:", {
      isAuthenticated,
      hasSocket: !!socket,
      socketConnected: socket?.connected,
      selectedUser: selectedUser?._id,
    });
  }, [isAuthenticated, socket, selectedUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 text-white overflow-hidden">
      <Navbar/>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-[0] flex items-center justify-center min-h-screen p-4 my-20">
        <div className="w-full max-w-7xl h-[calc(100vh-2rem)] bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-cyan-400/20 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          {/* Neon border glow effect */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl blur-sm"></div> */}

          <div className="relative flex h-full">
            {isMobile ? (
              selectedUser ? (
                <ChatContainer />
              ) : (
                <Sidebar />
              )
            ) : (
              <>
                <Sidebar />
                {selectedUser ? <ChatContainer /> : <NoChatSelected />}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default ChatApp;
