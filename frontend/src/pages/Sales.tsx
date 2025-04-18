import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination";
import { useGetItemsQuery } from "../api/itemsApi";
import { useGetCustomersQuery } from "../api/customersApi";
import { useGetSalesQuery, useCreateSaleMutation } from "../api/salesApi";
import toast from "react-hot-toast";

interface SaleForm {
  itemId: string;
  customerId: string;
  quantity: number;
  paymentType: string;
}

const Sales = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [isCashSale, setIsCashSale] = useState(false);
  const { data: items } = useGetItemsQuery({ page: 1, limit: 100 }); // Fetch all items for dropdown
  const { data: customers } = useGetCustomersQuery({ page: 1, limit: 100 }); // Fetch all customers for dropdown
  const { data, isLoading } = useGetSalesQuery({
    page,
    limit: pageSize,
    search,
    sort,
  });
  const [createSale] = useCreateSaleMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SaleForm>({
    defaultValues: { itemId: "", customerId: "", quantity: 1, paymentType: "" },
  });

  const onSubmit = async (data: SaleForm) => {
    try {
      await createSale({
        itemId: data.itemId,
        customerId: isCashSale ? undefined : data.customerId,
        quantity: Number(data.quantity),
        paymentType: data.paymentType,
      }).unwrap();
      reset();
    } catch {}
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
          Sales Management
        </h1>
        <div className="mb-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-4 text-text">Record Sale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text text-sm mb-1">Item</label>
                <select
                  {...register("itemId", { required: "Item is required" })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.itemId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Item</option>
                  {items?.items?.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors.itemId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.itemId.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Customer</label>
                <select
                  {...register("customerId", {
                    required: !isCashSale ? "Customer is required" : false,
                  })}
                  disabled={isCashSale}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 disabled:bg-gray-100 ${
                    errors.customerId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Customer</option>
                  {customers?.customers?.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
                {errors.customerId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.customerId.message}
                  </p>
                )}
                <label className="flex items-center mt-2 text-sm text-text">
                  <input
                    type="checkbox"
                    checked={isCashSale}
                    onChange={(e) => setIsCashSale(e.target.checked)}
                    className="mr-2"
                  />
                  Cash Sale
                </label>
              </div>
              <div>
                <label className="block text-text text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: "Quantity is required",
                    min: { value: 1, message: "Quantity must be at least 1" },
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
                <label className="block text-text text-sm mb-1">
                  Payment Type
                </label>
                <select
                  {...register("paymentType", {
                    required: "Payment type is required",
                  })}
                  className={`w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300 ${
                    errors.paymentType ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Payment Type</option>
                  <option value="cash">Cash</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
                {errors.paymentType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.paymentType.message}
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
              Record Sale
            </motion.button>
          </form>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-text">Sales</h2>
            <input
              type="text"
              placeholder="Search by item or customer..."
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
                        onClick={() => handleSort("itemId.name")}
                        className="hover:underline"
                      >
                        Item{" "}
                        {sort === "itemId.name"
                          ? "↑"
                          : sort === "-itemId.name"
                            ? "↓"
                            : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">
                      <button
                        onClick={() => handleSort("customerId.name")}
                        className="hover:underline"
                      >
                        Customer{" "}
                        {sort === "customerId.name"
                          ? "↑"
                          : sort === "-customerId.name"
                            ? "↓"
                            : ""}
                      </button>
                    </th>
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
                        onClick={() => handleSort("date")}
                        className="hover:underline"
                      >
                        Date{" "}
                        {sort === "date" ? "↑" : sort === "-date" ? "↓" : ""}
                      </button>
                    </th>
                    <th className="p-2 text-left">Payment Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.sales?.map((sale) => (
                    <tr key={sale._id} className="border-b">
                      <td className="p-2">{sale.itemId.name}</td>
                      <td className="p-2">{sale.customerId?.name || "Cash"}</td>
                      <td className="p-2">{sale.quantity}</td>
                      <td className="p-2">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="p-2">{sale.paymentType}</td>
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

export default Sales;
