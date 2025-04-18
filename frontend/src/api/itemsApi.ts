import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import toast from "react-hot-toast";

interface Item {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  createdBy: { email: string };
}

interface ItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  totalPages: number;
}

export const itemsApi = createApi({
  reducerPath: "itemsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Items"],
  endpoints: (builder) => ({
    getItems: builder.query<ItemsResponse, ItemsQuery>({
      query: ({ page = 1, limit = 10, search = "", sort = "" }) => ({
        url: "/items",
        params: { page, limit, search, sort },
      }),
      providesTags: ["Items"],
    }),
    createItem: builder.mutation<Item, Omit<Item, "_id" | "createdBy">>({
      query: (item) => ({
        url: "/items",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Items"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Item added successfully");
        } catch {
          toast.error("Failed to add item");
        }
      },
    }),
    updateItem: builder.mutation<Item, Partial<Item> & { _id: string }>({
      query: ({ _id, ...item }) => ({
        url: `/items/${_id}`,
        method: "PATCH",
        body: item,
      }),
      invalidatesTags: ["Items"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Item updated successfully");
        } catch {
          toast.error("Failed to update item");
        }
      },
    }),
    deleteItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/items/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Items"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Item deleted successfully");
        } catch {
          toast.error("Failed to delete item");
        }
      },
    }),
  }),
});

export const {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = itemsApi;
