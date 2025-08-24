// features/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { io } from "socket.io-client"

// module-level socket instance (keeps single connection)
let socket = null

const initialState = {
  token: null,
  user: null,
  userExists: false,
  isAuthenticated: false,
  loading: false,
  error: null,
  socket: null, // Add socket to state
  onlineUsers: [],
}

// --- Thunks ---

export const verifyWalletAuth = createAsyncThunk(
  "auth/verifyWalletAuth",
  async ({ address, signature, nonce }, { rejectWithValue }) => {
    try {
      const response = await fetch("https://cryptolance-qgzz.onrender.com/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature, nonce }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Verify request failed`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Verification failed")
      }

      // Normalize address to lowercase
      const normalizedAddress = address.toLowerCase()

      localStorage.setItem("authToken", data.token)
      localStorage.setItem("authAddress", normalizedAddress)

      return {
        token: data.token,
        user: { _id: normalizedAddress, ...data.user },
        userExists: !!data.userExists,
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  },
)

export const validateStoredToken = createAsyncThunk("auth/validateStoredToken", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("authToken")
    const address = localStorage.getItem("authAddress")

    if (!token || !address) {
      throw new Error("No stored authentication data")
    }

    console.log("Validating stored token for address:", address)

    // First check if the backend is accessible
    try {
      const healthResponse = await fetch(`https://cryptolance-qgzz.onrender.com/api/auth/health`)
      if (!healthResponse.ok) {
        console.warn("Backend health check failed, but preserving localStorage")
        throw new Error("Backend service unavailable")
      }
    } catch (healthError) {
      console.warn("Backend health check failed, but preserving localStorage:", healthError.message)
      throw new Error("Backend service unavailable")
    }

    // Use the proper token validation endpoint
    const response = await fetch(`https://cryptolance-qgzz.onrender.com/api/auth/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // Only clear localStorage if it's an authentication error (401)
      if (response.status === 401) {
        console.log("Token is invalid (401), clearing localStorage")
        localStorage.removeItem("authToken")
        localStorage.removeItem("authAddress")
        throw new Error("Token is invalid or expired")
      }
      // For other errors, don't clear localStorage immediately
      console.warn("Token validation failed with status:", response.status, "but preserving localStorage")
      throw new Error("Failed to validate token")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Token validation failed")
    }

    console.log("Token validation successful, fetching user profile")

    // Get user profile using the validated token
    const userResponse = await fetch(`https://cryptolance-qgzz.onrender.com/api/portfolio/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    let currentUser = null
    if (userResponse.ok) {
      const userData = await userResponse.json()
      if (userData.success && userData.data) {
        // Use portfolio data to create user object
        currentUser = {
          _id: userData.data.heroSection.walletAddress,
          name: userData.data.heroSection.name,
          profile: userData.data.heroSection.profile,
          email: userData.data.contactInfo?.email,
        }
      } else {
        // If portfolio data is not available, create a basic user object
        currentUser = { _id: address.toLowerCase() }
      }
    } else {
      // If portfolio profile doesn't exist, create a basic user object
      currentUser = { _id: address.toLowerCase() }
    }

    console.log("User profile retrieved successfully")

    return {
      token,
      user: currentUser,
      userExists: !!currentUser._id,
    }
  } catch (error) {
    console.error("Error in validateStoredToken:", error.message)

    // Only clear localStorage for authentication errors, not network errors
    if (error.message.includes("Token is invalid") || error.message.includes("No stored authentication data")) {
      console.log("Clearing localStorage due to authentication error")
      localStorage.removeItem("authToken")
      localStorage.removeItem("authAddress")
    } else {
      console.log("Preserving localStorage for non-authentication error:", error.message)
    }

    return rejectWithValue(error.message)
  }
})

export const connectSocket = createAsyncThunk(
  "auth/connectSocket",
  async (_, { getState, dispatch, rejectWithValue }) => {
    try {
      if (socket && socket.connected) {
        console.log("Socket already connected.")
        return socket.id
      }

      const { user, token } = getState().auth
      if (!user || !token) {
        return rejectWithValue("Cannot connect socket without authenticated user.")
      }

      const userId = String(user._id || "").toLowerCase()

      // Disconnect existing socket if any
      if (socket) {
        socket.disconnect()
        socket = null
      }

      // Use the local backend URL for socket connection
      socket = io("https://cryptolance-qgzz.onrender.com", {
        query: { userId },
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      })

      return new Promise((resolve, reject) => {
        socket.on("connect", () => {
          console.log("Socket connected with id:", socket.id)
          // Update the state with the socket
          dispatch(setSocket(socket))
          resolve(socket.id)
        })

        socket.on("getOnlineUsers", (users) => {
          console.log("Received online users:", users)
          dispatch(setOnlineUsers(Array.isArray(users) ? users : []))
        })

        socket.on("newMessage", (message) => {
          console.log("Received new message via socket:", message)
        })

        socket.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason)
          dispatch(clearSocket())
        })

        socket.on("connect_error", (err) => {
          console.error("Socket connect_error:", err.message || err)
          reject(err)
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!socket.connected) {
            reject(new Error("Socket connection timeout"))
          }
        }, 10000)
      })
    } catch (err) {
      return rejectWithValue(err.message || "Socket connection failed")
    }
  },
)

export const logoutAndDisconnect = createAsyncThunk("auth/logoutAndDisconnect", async (_, { dispatch }) => {
  try {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  } catch (e) {
    console.warn("Error disconnecting socket", e)
  } finally {
    localStorage.removeItem("authToken")
    localStorage.removeItem("authAddress")
    dispatch(logout())
  }
})

// --- Slice ---

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null
      state.user = null
      state.userExists = false
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      state.socket = null
      if (socket) {
        try {
          socket.disconnect()
        } catch (e) {
          /* ignore */
        }
      }
      socket = null
      state.onlineUsers = []
    },
    // set the socket instance (not just the id)
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    clearSocket: (state) => {
      state.socket = null
      socket = null
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload || []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyWalletAuth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyWalletAuth.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.userExists = action.payload.userExists
        state.isAuthenticated = true
      })
      .addCase(verifyWalletAuth.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload || "Verification failed"
      })

      .addCase(validateStoredToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(validateStoredToken.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user
        state.userExists = action.payload.userExists
        state.isAuthenticated = true
      })
      .addCase(validateStoredToken.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.error = action.payload || null
      })
  },
})

export const {
  logout,
  setSocket,
  clearSocket,
  setOnlineUsers,
} = authSlice.actions
export default authSlice.reducer
