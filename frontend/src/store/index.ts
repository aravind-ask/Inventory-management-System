import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "../api/authApi";
import { dashboardApi } from "../api/dashboardApi";
import { itemsApi } from "../api/itemsApi";
import { customersApi } from "../api/customersApi";
import { salesApi } from "../api/salesApi";
import { reportsApi } from "../api/reportsApi";
import authReducer from "../features/auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [itemsApi.reducerPath]: itemsApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [salesApi.reducerPath]: salesApi.reducer,
    [reportsApi.reducerPath]: reportsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      dashboardApi.middleware,
      itemsApi.middleware,
      customersApi.middleware,
      salesApi.middleware,
      reportsApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
