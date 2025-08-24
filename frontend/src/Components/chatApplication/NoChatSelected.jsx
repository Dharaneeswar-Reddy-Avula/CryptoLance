import { MessageSquare, Sparkles, Users } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-slate-900/20 backdrop-blur-sm relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-lg text-center space-y-8">
        {/* Enhanced Icon Display */}
        <div className="flex justify-center items-center gap-6 mb-8">
          <div className="relative group">
            {/* Main icon container */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-400/30 backdrop-blur-sm shadow-2xl">
              <MessageSquare className="w-12 h-12 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            {/* Floating sparkles */}
            <div className="absolute -top-2 -right-2 animate-bounce">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 animate-bounce animation-delay-1000">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            
            {/* Glow effect */}
            <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-purple-400/20 blur-lg animate-pulse"></div>
          </div>
        </div>

        {/* Enhanced Welcome Text */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Welcome to CrytoLance
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Select a conversation from the sidebar to start your
            <span className="text-cyan-400 font-semibold"> real-time chat experience</span>
          </p>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-cyan-400/20 backdrop-blur-sm">
            <div className="w-8 h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-sm text-slate-400">Real-time messaging</p>
          </div>
          
          <div className="p-4 rounded-xl bg-slate-800/40 border border-purple-400/20 backdrop-blur-sm">
            <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-sm text-slate-400">Online presence</p>
          </div>
          
          {/* <div className="p-4 rounded-xl bg-slate-800/40 border border-pink-400/20 backdrop-blur-sm">
            <div className="w-8 h-8 bg-pink-400/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <p className="text-sm text-slate-400">Modern design</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;