import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import toast from "react-hot-toast";
import {
  SalesReport,
  ItemsReport,
  LedgerReport,
} from "../pages/Reports";

interface ReportQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = createApi({
  reducerPath: "reportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Reports"],
  endpoints: (builder) => ({
    getSalesReport: builder.query<SalesReport, ReportQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sort = "",
        startDate,
        endDate,
      }) => ({
        url: "/reports/sales",
        params: { page, limit, search, sort, startDate, endDate },
      }),
      providesTags: ["Reports"],
    }),
    getItemsReport: builder.query<ItemsReport, ReportQuery>({
      query: ({
        page = 1,
        limit = 10,
        search = "",
        sort = "",
        startDate,
        endDate,
      }) => ({
        url: "/reports/items",
        params: { page, limit, search, sort, startDate, endDate },
      }),
      providesTags: ["Reports"],
    }),
    getCustomerLedger: builder.query<
      LedgerReport,
      {
        customerId: string;
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
      }
    >({
      query: ({
        customerId,
        page = 1,
        limit = 10,
        search = "",
        sort = "",
      }) => ({
        url: `/reports/ledger/${customerId}`,
        params: { page, limit, search, sort },
      }),
      providesTags: ["Reports"],
    }),
    exportReport: builder.mutation<
      Blob,
      {
        type: "sales" | "items" | "ledger";
        format: "excel" | "pdf";
        customerId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ type, format, customerId, startDate, endDate }) => ({
        url: "/reports/export",
        method: "GET",
        params: { type, format, customerId, startDate, endDate },
        responseHandler: async (response) => await response.blob(),
        cache: "no-cache",
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Report exported successfully");
        } catch {
          toast.error("Failed to export report");
        }
      },
    }),
  }),
});

export const {
  useGetSalesReportQuery,
  useGetItemsReportQuery,
  useGetCustomerLedgerQuery,
  useExportReportMutation,
} = reportsApi;
