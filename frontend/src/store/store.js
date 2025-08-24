import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice/authSlice";
import portfolioReducer from "./portfolioSlice/portfolioSlice";
import gigReducer from "./gigSlice/gigSlice";
import { saveState, loadState } from "./localStorageUtils";
import chatReducer from "./ChatApplicationSlice/ChatAppSlice";
// Load persisted state from localStorage
const preloadedState = loadState();
const serializableCheck = {
  ignoredActions: ["auth/connectSocket/fulfilled", "auth/connectSocket/pending"],
  ignoredPaths: ["auth.socket"],
}
const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    gig: gigReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck,
    }),
  devTools: process.env.NODE_ENV !== "production",
  preloadedState,
});

// Save Redux state to localStorage on changes
store.subscribe(() => {
  saveState({
    auth: store.getState().auth,
  });
});

export default store;
