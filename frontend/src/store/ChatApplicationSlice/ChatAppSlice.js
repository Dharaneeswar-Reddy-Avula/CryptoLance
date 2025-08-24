// features/chat/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import toast from "react-hot-toast"
import axios from "axios"

// create axios instance WITHOUT a static Authorization header
const axiosInstance = axios.create({
  baseURL: "https://cryptolance-qgzz.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// attach token dynamically before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// optional: handle 401 responses globally (auto-logout behavior)
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      // token invalid/expired — cleanup and notify user
      localStorage.removeItem("authToken")
      toast.error("Session expired. Please reconnect your wallet.")
      // Optional: redirect to login/landing page
      // window.location.href = "/login"; // uncomment if desired
    }
    return Promise.reject(error)
  },
)

// Async thunks
export const getUsers = createAsyncThunk("chat/getUsers", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/messages/users")
    return res.data
  } catch (err) {
    const message = err?.response?.data?.message ?? err.message
    toast.error(message)
    return thunkAPI.rejectWithValue(message)
  }
})

export const getMessages = createAsyncThunk("chat/getMessages", async (userId, thunkAPI) => {
  try {
    const res = await axiosInstance.get(`/messages/${userId}`)
    return res.data // expected messages array
  } catch (err) {
    const message = err?.response?.data?.message ?? err.message
    toast.error(message)
    return thunkAPI.rejectWithValue(message)
  }
})

export const sendMessage = createAsyncThunk("chat/sendMessage", async ({ receiverId, messageData }, thunkAPI) => {
  try {
    // selectedUser equivalent passed in via receiverId
    const res = await axiosInstance.post(`/messages/send/${receiverId}`, messageData)
    return res.data // created message
  } catch (err) {
    const message = err?.response?.data?.message ?? err.message
    toast.error(message)
    return thunkAPI.rejectWithValue(message)
  }
})

// Thunk to subscribe to socket's "newMessage" event
export const subscribeToMessages = createAsyncThunk("chat/subscribeToMessages", async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  const socket = state.auth?.socket // assumes auth slice contains socket
  if (!socket) return thunkAPI.rejectWithValue("No socket available")

  const handler = (newMessage) => {
    console.log("Received new message via socket:", newMessage)
    const stateNow = thunkAPI.getState()
    const { selectedChatData } = stateNow.chat
    const authUser = stateNow.auth?.user

    if (!authUser) {
      console.log("No auth user, skipping message")
      return
    }

    // Always add the message if it involves the current user
    const me = String(authUser._id || "").toLowerCase()
    const sender = String(newMessage.senderId || "").toLowerCase()
    const receiver = String(newMessage.recieverId || newMessage.receiverId || "").toLowerCase()

    if (sender === me || receiver === me) {
      console.log("Adding message to conversation:", newMessage)
      thunkAPI.dispatch(appendMessage(newMessage))
    }
  }

  // Remove any existing handler
  if (socket._chatMessageHandler) {
    socket.off("newMessage", socket._chatMessageHandler)
  }

  socket.on("newMessage", handler)
  socket._chatMessageHandler = handler
  console.log("Subscribed to newMessage events")
  return true
})

// Thunk to unsubscribe from socket
export const unsubscribeFromMessages = createAsyncThunk("chat/unsubscribeFromMessages", async (_, thunkAPI) => {
  const state = thunkAPI.getState()
  const socket = state.auth?.socket
  if (!socket) return thunkAPI.rejectWithValue("No socket available")

  const handler = socket._chatMessageHandler
  if (handler) {
    socket.off("newMessage", handler)
    delete socket._chatMessageHandler
  } else {
    // fallback: remove all listeners for event
    socket.off("newMessage")
  }
  console.log("Unsubscribed from newMessage events")
  return true
})

// initial state
const initialState = {
  userInfo: null,
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
}

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser(state, action) {
      state.selectedChatData = action.payload
      // clear previous conversation messages when switching peers
      state.selectedChatMessages = []
    },
    appendMessage(state, action) {
      // Check if message already exists to avoid duplicates
      const messageExists = state.selectedChatMessages.some((msg) => msg._id === action.payload._id)
      if (!messageExists) {
        console.log("Appending new message to state:", action.payload)

        // Remove optimistic message if it exists (same text and sender)
        state.selectedChatMessages = state.selectedChatMessages.filter(
          (msg) =>
            !(
              msg.__optimistic &&
              msg.text === action.payload.text &&
              msg.senderId === action.payload.senderId &&
              msg.recieverId === action.payload.recieverId
            ),
        )

        state.selectedChatMessages.push(action.payload)
      } else {
        console.log("Message already exists, skipping:", action.payload._id)
      }
    },
    clearMessages(state) {
      state.selectedChatMessages = []
    },
    setUsers(state, action) {
      state.directMessagesContacts = action.payload
    },
    // Add message immediately when sent (optimistic update)
    addMessageOptimistically(state, action) {
      // Check if this optimistic message already exists
      const exists = state.selectedChatMessages.some(
        (msg) => 
          msg.__optimistic && 
          msg.text === action.payload.text && 
          msg.senderId === action.payload.senderId &&
          msg.recieverId === action.payload.recieverId
      )
      
      if (!exists) {
        state.selectedChatMessages.push(action.payload)
      }
    },
    // Remove optimistic message
    removeOptimisticMessage(state, action) {
      state.selectedChatMessages = state.selectedChatMessages.filter((msg) => msg._id !== action.payload)
    },
    // Set messages for a specific chat
    setChatMessages(state, action) {
      state.selectedChatMessages = action.payload
    },
    // Update optimistic message with real message
    updateOptimisticMessage(state, action) {
      const { optimisticId, realMessage } = action.payload
      
      // Find and replace the optimistic message
      const index = state.selectedChatMessages.findIndex(msg => msg._id === optimisticId)
      if (index !== -1) {
        state.selectedChatMessages[index] = realMessage
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.fulfilled, (state, action) => {
        state.directMessagesContacts = action.payload
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.selectedChatMessages = action.payload
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Find and update the optimistic message instead of adding a new one
        const optimisticIndex = state.selectedChatMessages.findIndex(
          msg => msg.__optimistic && 
                 msg.text === action.payload.text && 
                 msg.senderId === action.payload.senderId &&
                 msg.recieverId === action.payload.recieverId
        )
        
        if (optimisticIndex !== -1) {
          // Replace optimistic message with real message
          state.selectedChatMessages[optimisticIndex] = action.payload
        } else {
          // If no optimistic message found, just add the real message
          const messageExists = state.selectedChatMessages.some((msg) => msg._id === action.payload._id)
          if (!messageExists) {
            state.selectedChatMessages.push(action.payload)
          }
        }
      })
  }
})

export const {
  setSelectedUser,
  appendMessage,
  clearMessages,
  setUsers,
  addMessageOptimistically,
  removeOptimisticMessage,
  setChatMessages,
  updateOptimisticMessage,
} = chatSlice.actions
export default chatSlice.reducer
