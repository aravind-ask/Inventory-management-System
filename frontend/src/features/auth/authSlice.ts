import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthResponse } from "../../types/auth";

interface AuthState {
  user: AuthResponse["user"] | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken: string;
        user: AuthResponse["user"];
      }>
    ) => {
      console.log("Setting auth credentials:", {
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        user: action.payload.user,
      });
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken || null;
      try {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          })
        );
        console.log(
          "Saved auth to localStorage:",
          localStorage.getItem("auth")
        );
      } catch (error) {
        console.error("Error saving auth to localStorage:", error);
      }
    },
    loadAuthFromStorage: (state) => {
      try {
        const storedAuth = localStorage.getItem("auth");
        console.log("Loading auth from localStorage:", storedAuth);
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          state.user = parsedAuth.user || null;
          state.accessToken = parsedAuth.accessToken || null;
          state.refreshToken = parsedAuth.refreshToken || null;
          console.log("Loaded auth state:", {
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
          });
        }
      } catch (error) {
        console.error("Error loading auth from localStorage:", error);
      }
    },
    logout: (state) => {
      console.log("Logging out. Resetting auth state.");
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      try {
        localStorage.removeItem("auth");
        console.log("Cleared auth from localStorage");
      } catch (error) {
        console.error("Error clearing auth from localStorage:", error);
      }
    },
  },
});

export const { setCredentials, loadAuthFromStorage, logout } =
  authSlice.actions;
export default authSlice.reducer;
