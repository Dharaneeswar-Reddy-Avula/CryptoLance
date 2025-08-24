"use client"

import { useEffect, useRef } from "react"
import ChatHeader from "./ChatHeader"
import MessageInput from "./MessageInput"
import MessageSkeleton from "./skeletons/MessageSkeleton"
import { useSelector, useDispatch } from "react-redux"
import { getMessages } from "../../store/ChatApplicationSlice/ChatAppSlice"
import {formatMessageTime} from "./MessageTime"


const ChatContainer = () => {
  const { messages, isMessagesLoading, selectedUser } = useSelector((state) => state.chatApp)
  const { user: authUser } = useSelector((state) => state.auth)
  console.log("ChatContainer - authUser:", authUser)
  console.log("ChatContainer - messages:", messages)
  const dispatch = useDispatch()
  const messageEndRef = useRef(null)

  useEffect(() => {
    if (selectedUser) {
      dispatch(getMessages(selectedUser._id))
    }
  }, [selectedUser, dispatch])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

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
        {authUser &&
          messages.map((message, index) => {
            const isOwnMessage = authUser && message.senderId === authUser._id
            const isOptimistic = message.__optimistic

            return (
              <div
                key={message._id}
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
                      <img
                        src={
                          isOwnMessage ? authUser.profilePic || "/avatar.png" : selectedUser.profilePic || "/avatar.png"
                        }
                        alt="profile pic"
                        className="w-full h-full object-cover"
                      />
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
                        <img
                          src={message.image || "/placeholder.svg"}
                          alt="Attachment"
                          className="max-w-[200px] rounded-md mb-1"
                        />
                      )}
                      {message.text && <p className="text-sm leading-relaxed break-words">{message.text}</p>}

                      <div className={`text-xs mt-1 ${isOwnMessage ? "text-cyan-100" : "text-slate-400"}`}>
                        {formatMessageTime(message.createdAt)}
                        {isOptimistic && " ⏳"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      <MessageInput />
    </div>
  )
}

export default ChatContainer
