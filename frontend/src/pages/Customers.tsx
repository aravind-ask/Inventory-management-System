import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination";
import {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "../api/customersApi";
import toast from "react-hot-toast";

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Customers = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const { data, isLoading } = useGetCustomersQuery({
    page,
    limit: pageSize,
    search,
    sort,
  });
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [editingCustomer, setEditingCustomer] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerForm>({
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  const onSubmit = async (data: CustomerForm) => {
    try {
      if (editingCustomer) {
        await updateCustomer({ _id: editingCustomer, ...data }).unwrap();
        setEditingCustomer(null);
      } else {
        await createCustomer(data).unwrap();
      }
      reset();
    } catch {}
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer._id);
    setValue("name", customer.name);
    setValue("email", customer.email);
    setValue("phone", customer.phone);
    setValue("address", customer.address);
  };

  const handleSort = (field: string) => {
    setSort(sort === field ? `-${field}` : field);
  };

  return (
    <div className="flex min-h-screen bg-neutral">
      <Sidebar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-8"
      >
        <h1 className="text-2xl font-semibold mb-6 text-text">
          Customer Management
        </h1>
        <div className="mb-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-4 text-text">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text text-sm mb-1">Name</label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.name ? "border-red-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Email</label>
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.email ? "border-red-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Phone</label>
                <input
                  {...register("phone", {
                    pattern: {
                      value: /^\+?[\d\s-]{7,}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Address</label>
                <input
                  {...register("address")}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600"
            >
              {editingCustomer ? "Update Customer" : "Add Customer"}
            </motion.button>
            {editingCustomer && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingCustomer(null);
                  reset();
                }}
                className="mt-4 ml-2 bg-gray-300 text-text p-2 rounded-md text-sm hover:bg-gray-400"
              >
                Cancel
              </motion.button>
            )}
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-text">Customers</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
            />
          </div>
          {isLoading ? (
            <p className="text-text">Loading...</p>
          ) : (
            <>
              <table className="w-full text-sm text-text">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">
                      <button
                        onClick={() => handleSort("name")}
                        className="hover:underline"
                      >
                        Name{" "}
                        {sort === "name" ? "↑" : sort === "-name" ? "↓" : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">
                      <button
                        onClick={() => handleSort("email")}
                        className="hover:underline"
                      >
                        Email{" "}
                        {sort === "email" ? "↑" : sort === "-email" ? "↓" : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Address</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.customers?.map((customer) => (
                    <tr key={customer._id} className="border-b">
                      <td className="p-2">{customer.name}</td>
                      <td className="p-2">{customer.email}</td>
                      <td className="p-2">{customer.phone}</td>
                      <td className="p-2">{customer.address}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-secondary hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer._id)}
                          className="text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data && (
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Customers;
