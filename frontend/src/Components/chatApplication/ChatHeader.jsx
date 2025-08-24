"use client"

import { X, Phone, Video, MoreVertical } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { setSelectedUser } from "../../store/ChatApplicationSlice/ChatAppSlice"

const ChatHeader = () => {
  const { selectedUser } = useSelector((state) => state.chatApp)
  const { onlineUsers } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const isOnline =
    Array.isArray(onlineUsers) && onlineUsers.includes((selectedUser._id || selectedUser.address || "").toLowerCase())

  return (
    <div className="p-3 border-b border-cyan-500/20 bg-slate-800/70 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-10 rounded-full border border-cyan-500/30 overflow-hidden">
              <img
                src={selectedUser.profile || "/avatar.png"}
                alt={selectedUser.fullname}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-400 rounded-full border-2 border-slate-800"></div>
            )}
          </div>

          <div>
            <h3 className="font-medium text-white">{selectedUser.fullname}</h3>
            <div className={`text-xs ${isOnline ? "text-emerald-400" : "text-slate-400"}`}>
              {isOnline ? "Online" : "Last seen recently"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors">
            <Phone className="size-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors">
            <Video className="size-4" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-cyan-400 transition-colors">
            <MoreVertical className="size-4" />
          </button>
          <button
            onClick={() => dispatch(setSelectedUser(null))}
            className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors ml-2"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
