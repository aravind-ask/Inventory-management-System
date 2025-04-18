import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getDashboardData: builder.query<any, void>({
      query: () => "/dashboard",
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
