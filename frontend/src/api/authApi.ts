import { baseApi } from "./baseApi";
import { setCredentials, logout } from "../features/auth/authSlice";
import toast from "react-hot-toast";
import type { RootState } from "../store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          toast.success("Signed in successfully!");
        } catch (error) {
          console.error("Login failed:", error);
          toast.error("Invalid credentials. Please try again.");
        }
      },
    }),
    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
          toast.success("Registered and signed in successfully!");
        } catch (error) {
          console.error("Registration failed:", error);
          toast.error("Registration failed. Please try again.");
        }
      },
    }),
    refresh: builder.mutation<
      { accessToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({
        url: "/auth/refresh",
        method: "POST",
        body,
      }),
      async onQueryStarted(
        { refreshToken },
        { dispatch, queryFulfilled, getState }
      ) {
        try {
          const { data } = await queryFulfilled;
          const user = (getState() as RootState).auth.user;
          if (user) {
            dispatch(
              setCredentials({
                accessToken: data.accessToken,
                refreshToken,
                user,
              })
            );
            console.log("Token refreshed successfully");
          } else {
            dispatch(logout());
            toast.error("User data missing. Please sign in again.");
          }
        } catch (error) {
          console.error("Refresh token failed:", error);
          dispatch(logout());
          toast.error("Session expired. Please sign in again.");
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
          toast.success("Signed out successfully!");
        } catch (error) {
          console.error("Logout failed:", error);
          toast.error("Logout failed. Please try again.");
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;
