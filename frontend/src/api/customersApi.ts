import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import toast from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

interface CustomersResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export const customersApi = createApi({
  reducerPath: "customersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customers"],
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomersResponse, CustomersQuery>({
      query: ({ page = 1, limit = 10, search = "", sort = "" }) => ({
        url: "/customers",
        params: { page, limit, search, sort },
      }),
      providesTags: ["Customers"],
    }),
    createCustomer: builder.mutation<Customer, Omit<Customer, "_id">>({
      query: (customer) => ({
        url: "/customers",
        method: "POST",
        body: customer,
      }),
      invalidatesTags: ["Customers"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Customer added successfully");
        } catch {
          toast.error("Failed to add customer");
        }
      },
    }),
    updateCustomer: builder.mutation<
      Customer,
      Partial<Customer> & { _id: string }
    >({
      query: ({ _id, ...customer }) => ({
        url: `/customers/${_id}`,
        method: "PATCH",
        body: customer,
      }),
      invalidatesTags: ["Customers"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Customer updated successfully");
        } catch {
          toast.error("Failed to update customer");
        }
      },
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          await queryFulfilled;
          toast.success("Customer deleted successfully");
        } catch {
          toast.error("Failed to delete customer");
        }
      },
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
