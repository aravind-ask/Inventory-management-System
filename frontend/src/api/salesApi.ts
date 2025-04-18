import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import toast from "react-hot-toast";

interface Sale {
  _id: string;
  itemId: { name: string };
  customerId: { name: string } | null;
  quantity: number;
  date: string;
  paymentType: string;
}

interface SalesQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

interface SalesResponse {
  sales: Sale[];
  total: number;
  page: number;
  totalPages: number;
}

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Sales"],
  endpoints: (builder) => ({
    getSales: builder.query<SalesResponse, SalesQuery>({
      query: ({ page = 1, limit = 10, search = "", sort = "" }) => ({
        url: "/sales",
        params: { page, limit, search, sort },
      }),
      providesTags: ["Sales"],
    }),
    createSale: builder.mutation<
      Sale,
      {
        itemId: string;
        customerId?: string;
        quantity: number;
        paymentType: string;
      }
    >({
      query: (sale) => ({
        url: "/sales",
        method: "POST",
        body: sale,
      }),
      invalidatesTags: ["Sales", "Items", "Reports"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Sale recorded successfully");
        } catch {
          toast.error("Failed to record sale");
        }
      },
    }),
  }),
});

export const { useGetSalesQuery, useCreateSaleMutation } = salesApi;
