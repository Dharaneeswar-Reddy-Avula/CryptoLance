// features/chat/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axios from "axios";

// create axios instance WITHOUT a static Authorization header
const axiosInstance = axios.create({
  baseURL: "https://cryptolance-qgzz.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token dynamically before each request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// optional: handle 401 responses globally (auto-logout behavior)
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // token invalid/expired — cleanup and notify user
      localStorage.removeItem("authToken");
      toast.error("Session expired. Please reconnect your wallet.");
      // Optional: redirect to login/landing page
      // window.location.href = "/login"; // uncomment if desired
    }
    return Promise.reject(error);
  }
);

// Async thunks
export const getUsers = createAsyncThunk(
  "chat/getUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/messages/users");
      return res.data;
    } catch (err) {
      const message = err?.response?.data?.message ?? err.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (userId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      return res.data; // expected messages array
    } catch (err) {
      const message = err?.response?.data?.message ?? err.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, messageData }, thunkAPI) => {
    try {
      // selectedUser equivalent passed in via receiverId
      const res = await axiosInstance.post(
        `/messages/send/${receiverId}`,
        messageData
      );
      return res.data; // created message
    } catch (err) {
      const message = err?.response?.data?.message ?? err.message;
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thunk to subscribe to socket's "newMessage" event
export const subscribeToMessages = createAsyncThunk(
  "chat/subscribeToMessages",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const socket = state.auth?.socket; // assumes auth slice contains socket
    if (!socket) return thunkAPI.rejectWithValue("No socket available");

    const handler = (newMessage) => {
      console.log("Received new message via socket:", newMessage);
      const stateNow = thunkAPI.getState();
      const { selectedUser } = stateNow.chatApp;
      const authUser = stateNow.auth?.user;

      if (!authUser) {
        console.log("No auth user, skipping message");
        return;
      }

      // Always add the message if it involves the current user
      const me = String(authUser._id || "").toLowerCase();
      const sender = String(newMessage.senderId || "").toLowerCase();
      const receiver = String(
        newMessage.recieverId || newMessage.receiverId || ""
      ).toLowerCase();

      if (sender === me || receiver === me) {
        console.log("Adding message to conversation:", newMessage);
        thunkAPI.dispatch(appendMessage(newMessage));
      }
    };

    // Remove any existing handler
    if (socket._chatMessageHandler) {
      socket.off("newMessage", socket._chatMessageHandler);
    }

    socket.on("newMessage", handler);
    socket._chatMessageHandler = handler;
    thunkAPI.dispatch(setSubscribed(true));

    console.log("Subscribed to newMessage events");
    return true;
  }
);

// Thunk to unsubscribe from socket
export const unsubscribeFromMessages = createAsyncThunk(
  "chat/unsubscribeFromMessages",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    const socket = state.auth?.socket;
    if (!socket) return thunkAPI.rejectWithValue("No socket available");

    const handler = socket._chatMessageHandler;
    if (handler) {
      socket.off("newMessage", handler);
      delete socket._chatMessageHandler;
    } else {
      // fallback: remove all listeners for event
      socket.off("newMessage");
    }
    thunkAPI.dispatch(setSubscribed(false));
    console.log("Unsubscribed from newMessage events");
    return true;
  }
);

// initial state
const initialState = {
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  subscribed: false, // track subscription state
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
      // clear previous conversation messages when switching peers
      state.messages = [];
    },
    appendMessage(state, action) {
      // Check if message already exists to avoid duplicates
      const messageExists = state.messages.some(
        (msg) => msg._id === action.payload._id
      );
      if (!messageExists) {
        console.log("Appending new message to state:", action.payload);

        // Remove optimistic message if it exists (same text and sender)
        state.messages = state.messages.filter(
          (msg) =>
            !(
              msg.__optimistic &&
              msg.text === action.payload.text &&
              msg.senderId === action.payload.senderId &&
              msg.recieverId === action.payload.recieverId
            )
        );

        state.messages.push(action.payload);
      } else {
        console.log("Message already exists, skipping:", action.payload._id);
      }
    },
    clearMessages(state) {
      state.messages = [];
    },
    setUsers(state, action) {
      state.users = action.payload;
    },
    setSubscribed(state, action) {
      state.subscribed = action.payload;
    },
    // Add message immediately when sent (optimistic update)
    addMessageOptimistically(state, action) {
      state.messages.push(action.payload);
    },
    // Remove optimistic message
    removeOptimisticMessage(state, action) {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // getUsers
      .addCase(getUsers.pending, (state) => {
        state.isUsersLoading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.isUsersLoading = false;
        state.users = action.payload;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isUsersLoading = false;
        state.error = action.payload ?? action.error.message;
      })

      // getMessages
      .addCase(getMessages.pending, (state) => {
        state.isMessagesLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.isMessagesLoading = false;
        state.error = action.payload ?? action.error.message;
      })

      // sendMessage
      .addCase(sendMessage.fulfilled, (state, action) => {
        // Don't add the message here since it will come via socket
        // This prevents duplicate messages
        console.log("Message sent successfully:", action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message;
      })

      // subscribe/unsubscribe success flags are handled by reducers already
      .addCase(subscribeToMessages.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message;
      })
      .addCase(unsubscribeFromMessages.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message;
      });
  },
});

export const {
  setSelectedUser,
  appendMessage,
  clearMessages,
  setUsers,
  setSubscribed,
  addMessageOptimistically,
  removeOptimisticMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
