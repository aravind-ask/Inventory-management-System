import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination";
import {
  useGetItemsQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "../api/itemsApi";
import toast from "react-hot-toast";

interface ItemForm {
  name: string;
  description: string;
  quantity: number;
  price: number;
}

const Inventory = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const { data, isLoading } = useGetItemsQuery({
    page,
    limit: pageSize,
    search,
    sort,
  });
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ItemForm>({
    defaultValues: { name: "", description: "", quantity: 0, price: 0 },
  });

  const onSubmit = async (data: ItemForm) => {
    try {
      if (editingItem) {
        await updateItem({ _id: editingItem, ...data }).unwrap();
        setEditingItem(null);
      } else {
        await createItem(data).unwrap();
      }
      reset();
    } catch {}
  };

  const handleEdit = (item: any) => {
    setEditingItem(item._id);
    setValue("name", item.name);
    setValue("description", item.description);
    setValue("quantity", item.quantity);
    setValue("price", item.price);
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
          Inventory Management
        </h1>
        <div className="mb-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-4 text-text">
              {editingItem ? "Edit Item" : "Add Item"}
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
                <label className="block text-text text-sm mb-1">
                  Description
                </label>
                <input
                  {...register("description")}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: { value: 0, message: "Quantity cannot be negative" },
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.quantity ? "border-red-500" : ""
                  }`}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.price ? "border-red-500" : ""
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600"
            >
              {editingItem ? "Update Item" : "Add Item"}
            </motion.button>
            {editingItem && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEditingItem(null);
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
            <h2 className="text-lg font-medium text-text">Items</h2>
            <input
              type="text"
              placeholder="Search by name..."
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
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-left">
                      <button
                        onClick={() => handleSort("quantity")}
                        className="hover:underline"
                      >
                        Quantity{" "}
                        {sort === "quantity"
                          ? "↑"
                          : sort === "-quantity"
                            ? "↓"
                            : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">
                      <button
                        onClick={() => handleSort("price")}
                        className="hover:underline"
                      >
                        Price{" "}
                        {sort === "price" ? "↑" : sort === "-price" ? "↓" : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items?.map((item) => (
                    <tr key={item._id} className="border-b">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">${item.price.toFixed(2)}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-secondary hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item._id)}
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

export default Inventory;
