"use client"

import { useEffect, useRef, useState } from "react"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import { useSelector, useDispatch } from "react-redux"
import { getMessages } from "../../store/ChatApplicationSlice/ChatAppSlice"
import { formatMessageTime } from "./MessageTime"

const ChatContainer = () => {
  const { selectedChatMessages: messages, selectedChatData: selectedUser } = useSelector((state) => state.chat)
  const { user: authUser } = useSelector((state) => state.auth)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  
  console.log("ChatContainer - authUser:", authUser)
  console.log("ChatContainer - messages:", messages)
  console.log("ChatContainer - selectedUser:", selectedUser)
  
  const dispatch = useDispatch()
  const messageEndRef = useRef(null)

  useEffect(() => {
    if (selectedUser) {
      setIsMessagesLoading(true)
      dispatch(getMessages(selectedUser._id)).finally(() => setIsMessagesLoading(false))
    }
  }, [selectedUser, dispatch])

  useEffect(() => {
    if (messageEndRef.current && messages && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Helper function to render profile image or fallback
  const renderProfileImage = (user, isOwnMessage) => {
    if (isOwnMessage) {
      if (authUser?.profile) {
        return <img src={authUser.profile} alt="profile" className="w-full h-full object-cover" />
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center bg-cyan-600 text-white font-semibold text-sm">
            {authUser?.fullname?.charAt(0)?.toUpperCase() || authUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )
      }
    } else {
      if (selectedUser?.profile) {
        return <img src={selectedUser.profile} alt="profile" className="w-full h-full object-cover" />
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center bg-slate-600 text-white font-semibold text-sm">
            {selectedUser?.fullname?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )
      }
    }
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50 backdrop-blur-sm">
      <ChatHeader />

      <div
        className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent bg-slate-900/30"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(6, 182, 212, 0.04) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      >
        {authUser && messages && messages.length > 0 ? (
          messages.map((message, index) => {
            const isOwnMessage = authUser && message.senderId === authUser._id
            const isOptimistic = message.__optimistic

            return (
              <div
                key={message._id || index}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                } animate-fadeIn ${isOptimistic ? "opacity-70" : ""}`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                <div
                  className={`flex items-end gap-2 max-w-xs lg:max-w-md xl:max-w-lg ${
                    isOwnMessage ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="size-8 rounded-full border border-cyan-500/30 overflow-hidden">
                      {renderProfileImage(authUser, isOwnMessage)}
                    </div>
                  </div>

                  <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                    <div
                      className={`relative px-3 py-2 rounded-lg shadow-sm max-w-full ${
                        isOwnMessage
                          ? "bg-cyan-600 text-white rounded-br-sm"
                          : "bg-slate-700 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      {message.image && (
                        <div className="mb-2">
                          <img
                            src={message.image}
                            alt="Attachment"
                            className="max-w-[200px] rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.image, '_blank')}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              console.warn('Failed to load image:', message.image)
                            }}
                          />
                        </div>
                      )}
                      {message.text && <p className="text-sm leading-relaxed break-words">{message.text}</p>}

                      <div className={`text-xs mt-1 ${isOwnMessage ? "text-cyan-100" : "text-slate-400"}`}>
                        {formatMessageTime(message.createdAt)}
                        {isOptimistic && (
                          <span className="ml-1 inline-flex items-center">
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                            Sending...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start a conversation with {selectedUser?.fullname || "this user"}</p>
            </div>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer
