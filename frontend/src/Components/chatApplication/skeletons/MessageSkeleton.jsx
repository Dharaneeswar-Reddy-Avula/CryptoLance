const MessageSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Skeleton for incoming messages */}
      {[...Array(3)].map((_, i) => (
        <div key={`incoming-${i}`} className="flex justify-start animate-pulse">
          <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
            <div className="flex-shrink-0">
              <div className="size-8 rounded-full bg-slate-700"></div>
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-slate-700 rounded-lg rounded-bl-sm px-3 py-2 w-32 h-10"></div>
            </div>
          </div>
        </div>
      ))}

      {/* Skeleton for outgoing messages */}
      {[...Array(2)].map((_, i) => (
        <div key={`outgoing-${i}`} className="flex justify-end animate-pulse">
          <div className="flex items-end gap-2 max-w-xs lg:max-w-md flex-row-reverse">
            <div className="flex-shrink-0">
              <div className="size-8 rounded-full bg-slate-700"></div>
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-cyan-700/50 rounded-lg rounded-br-sm px-3 py-2 w-40 h-10"></div>
            </div>
          </div>
        </div>
      ))}

      {/* More incoming messages */}
      {[...Array(2)].map((_, i) => (
        <div key={`incoming2-${i}`} className="flex justify-start animate-pulse">
          <div className="flex items-end gap-2 max-w-xs lg:max-w-md">
            <div className="flex-shrink-0">
              <div className="size-8 rounded-full bg-slate-700"></div>
            </div>
            <div className="flex flex-col items-start">
              <div className="bg-slate-700 rounded-lg rounded-bl-sm px-3 py-2 w-28 h-10"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageSkeleton
