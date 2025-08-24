import { MessageSquare, Users, Zap } from "lucide-react"

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 bg-slate-900/30 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-cyan-500/8 rounded-full blur-2xl animate-pulse"></div>
        <div
          className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-cyan-400/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30 backdrop-blur-sm">
              <MessageSquare className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-white">Welcome to CryptoLance Chat</h2>
          <p className="text-slate-400 leading-relaxed">Select a conversation from your contacts to start messaging</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-lg bg-slate-800/50 border border-cyan-500/20">
            <MessageSquare className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Real-time chat</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/50 border border-emerald-500/20">
            <Users className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <p className="text-xs text-slate-400">Online status</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoChatSelected
