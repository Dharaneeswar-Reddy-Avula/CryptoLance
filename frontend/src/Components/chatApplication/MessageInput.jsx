"use client"

import { useRef, useState } from "react"
import { Send, Smile, Paperclip, X } from "lucide-react"
import toast from "react-hot-toast"
import { useSelector, useDispatch } from "react-redux"
import { sendMessage, addMessageOptimistically } from "../../store/ChatApplicationSlice/ChatAppSlice"

const MessageInput = () => {
  const [text, setText] = useState("")
  const [imagePreview, setImagePreview] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const dispatch = useDispatch()
  const { selectedChatData } = useSelector((state) => state.chat)
  const { user: authUser } = useSelector((state) => state.auth)

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    try {
      setIsUploading(true)
      
      // Create preview immediately
      const previewUrl = URL.createObjectURL(file)
      setImagePreview({ file, previewUrl, isUploading: true })

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", "Freelance_Website")
      formData.append("cloud_name", "dd33ovgv1")

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dd33ovgv1/image/upload",
        {
          method: "POST",
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      const data = await response.json()
      
      // Update preview with uploaded URL
      setImagePreview({ 
        file, 
        previewUrl: data.secure_url, 
        cloudinaryUrl: data.secure_url,
        isUploading: false 
      })
      
      toast.success("Image uploaded successfully!")
    } catch (error) {
      console.error("Image upload failed:", error)
      toast.error("Failed to upload image. Please try again.")
      setImagePreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    if (imagePreview?.previewUrl) {
      URL.revokeObjectURL(imagePreview.previewUrl)
    }
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() && !imagePreview) return
    if (isSending) return // Prevent multiple sends

    try {
      setIsSending(true)
      
      // Create optimistic message with unique ID
      const optimisticId = `temp_${Date.now()}_${Math.random()}`
      const optimisticMessage = {
        _id: optimisticId,
        text: text.trim(),
        image: imagePreview?.cloudinaryUrl || "",
        senderId: authUser._id,
        recieverId: selectedChatData._id,
        createdAt: new Date().toISOString(),
        __optimistic: true, // Mark as optimistic
      }

      // Add message immediately to UI (optimistic update)
      dispatch(addMessageOptimistically(optimisticMessage))

      // Clear form immediately
      setText("")
      removeImage()

      // Send message to backend
      await dispatch(
        sendMessage({
          receiverId: selectedChatData._id,
          messageData: {
            text: text.trim(),
            image: imagePreview?.cloudinaryUrl || "",
          },
        }),
      )
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="p-3 bg-slate-800/70 backdrop-blur-sm border-t border-cyan-500/20">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative group">
            <img
              src={imagePreview.previewUrl || "/placeholder.svg"}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-lg border border-cyan-500/30"
              onError={(e) => {
                e.target.src = "/placeholder.svg"
                console.warn('Failed to load image preview')
              }}
            />
            {imagePreview.isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 
              flex items-center justify-center text-white transition-colors text-xs"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="text-xs text-slate-400">
            {imagePreview.isUploading ? "Uploading..." : "Image ready"}
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2 items-center bg-slate-700/50 rounded-full px-3 py-2 border border-slate-600/50 focus-within:border-cyan-500/50 transition-colors">
          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Smile className="size-4" />
          </button>

          <input
            type="text"
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSending || isUploading}
          />

          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            disabled={isSending || isUploading} 
          />

          <button
            type="button"
            className="p-1 rounded-full hover:bg-slate-600/50 text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending || isUploading}
            title="Attach image"
          >
            <Paperclip className="size-4" />
          </button>
        </div>

        <button
          type="submit"
          className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 
                   disabled:cursor-not-allowed transition-colors text-white"
          disabled={(!text.trim() && !imagePreview) || isSending || isUploading}
        >
          {isSending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  )
}

export default MessageInput

