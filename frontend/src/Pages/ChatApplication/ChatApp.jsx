"use client"

import { useState, useEffect } from "react"
import ChatContainer from "../../Components/chatApplication/ChatContainer";
import Sidebar from "../../Components/chatApplication/Sidebar";
import NoChatSelected from "../../Components/chatApplication/NoChatSelected";
import { useSelector, useDispatch } from "react-redux"
import { connectSocket } from "../../store/authSlice/authSlice"
import { subscribeToMessages, unsubscribeFromMessages } from "../../store/ChatApplicationSlice/ChatAppSlice"
import { getUsers } from "../../store/ChatApplicationSlice/ChatAppSlice"

const ChatApp = () => {
  const [isMobile, setIsMobile] = useState(false)
  const { selectedChatData, directMessagesContacts } = useSelector((state) => state.chat)
  const { isAuthenticated, socket } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Ensure socket is connected when chat app is open and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !socket) {
      console.log("🔌 Connecting socket...")
      dispatch(connectSocket())
    }
  }, [isAuthenticated, socket, dispatch])

  // Subscribe to messages when socket is available
  useEffect(() => {
    if (socket && socket.connected) {
      console.log("📡 Socket connected, subscribing to messages...")
      dispatch(subscribeToMessages())

      return () => {
        console.log("📡 Unsubscribing from messages...")
        dispatch(unsubscribeFromMessages())
      }
    }
  }, [socket, dispatch])

  // Load users for sidebar when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log("👥 Loading users for sidebar...")
      dispatch(getUsers())
    }
  }, [isAuthenticated, dispatch])

  // Debug logging
  useEffect(() => {
    console.log("ChatApp - Status:", {
      isAuthenticated,
      hasSocket: !!socket,
      socketConnected: socket?.connected,
      selectedUser: selectedChatData?._id,
      usersCount: directMessagesContacts?.length || 0,
    })
  }, [isAuthenticated, socket, selectedChatData, directMessagesContacts])

  return (
    <div className="h-[100vh] bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-cyan-500/4 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-400/4 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 flex items-center justify-center ">
        <div className="w-full h-[100vh] bg-slate-800/95 backdrop-blur-xl shadow-2xl shadow-cyan-500/5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/8 via-transparent to-cyan-400/8 rounded-xl blur-sm pointer-events-none"></div>

          <div className="relative flex h-full">
            {isMobile ? (
              selectedChatData ? (
                <ChatContainer />
              ) : (
                <Sidebar />
              )
            ) : (
              <>
                <Sidebar />
                {selectedChatData ? <ChatContainer /> : <NoChatSelected />}
              </>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default ChatApp
