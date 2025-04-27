import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Pagination from "../components/Pagination";
import { useGetCustomersQuery } from "../api/customersApi";
import {
  useGetSalesReportQuery,
  useGetItemsReportQuery,
  useGetCustomerLedgerQuery,
  useExportReportMutation,
} from "../api/reportsApi";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export interface ReportFilter {
  startDate: string;
  endDate: string;
  customerId: string;
}

export interface Sale {
  _id: string;
  itemId: { _id: string; name: string; price: number };
  customerId?: { _id: string; name: string };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  date: string;
  paymentType: string;
}

export interface Item {
  _id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  totalValue: number;
  createdBy: { email: string };
}

export interface SalesSummary {
  totalRevenue: number;
  totalSales: number;
  averageSalePrice: number;
  topItems: { name: string; quantity: number; revenue: number }[];
  salesByDate: { date: string; total: number; revenue: number }[];
}

export interface ItemsSummary {
  totalInventoryValue: number;
  totalItems: number;
  averagePrice: number;
  lowStockItems: number;
  turnoverRate: { name: string; rate: number }[];
}

export interface LedgerSummary {
  totalSpent: number;
  totalTransactions: number;
  averageTransactionValue: number;
  paymentTypeBreakdown: { type: string; count: number; percentage: number }[];
}

export interface SalesReport {
  sales: Sale[];
  total: number;
  page: number;
  totalPages: number;
  summary: SalesSummary;
}

export interface ItemsReport {
  items: Item[];
  total: number;
  page: number;
  totalPages: number;
  summary: ItemsSummary;
}

export interface LedgerReport {
  ledger: Sale[];
  total: number;
  page: number;
  totalPages: number;
  summary: LedgerSummary;
}

const Reports = () => {
  const [salesPage, setSalesPage] = useState(1);
  const [itemsPage, setItemsPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [salesSearch, setSalesSearch] = useState("");
  const [itemsSearch, setItemsSearch] = useState("");
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [salesSort, setSalesSort] = useState("");
  const [itemsSort, setItemsSort] = useState("");
  const [ledgerSort, setLedgerSort] = useState("");
  const { data: customers } = useGetCustomersQuery({ page: 1, limit: 100 });
  const { register, watch } = useForm<ReportFilter>();
  const [exportReport, { isLoading: exportLoading }] =
    useExportReportMutation();
  const customerId = watch("customerId");
  const { data: salesReport, isLoading: salesLoading } = useGetSalesReportQuery(
    {
      page: salesPage,
      limit: pageSize,
      search: salesSearch,
      sort: salesSort,
      startDate: watch("startDate"),
      endDate: watch("endDate"),
    }
  );
  const { data: itemsReport, isLoading: itemsLoading } = useGetItemsReportQuery(
    {
      page: itemsPage,
      limit: pageSize,
      search: itemsSearch,
      sort: itemsSort,
      startDate: watch("startDate"),
      endDate: watch("endDate"),
    }
  );
  const { data: ledger, isLoading: ledgerLoading } = useGetCustomerLedgerQuery(
    {
      customerId,
      page: ledgerPage,
      limit: pageSize,
      search: ledgerSearch,
      sort: ledgerSort,
    },
    { skip: !customerId }
  );

  const handlePrint = (type: "sales" | "items" | "ledger") => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const content =
      type === "sales"
        ? generateSalesPrintContent(salesReport)
        : type === "items"
          ? generateItemsPrintContent(itemsReport)
          : generateLedgerPrintContent(ledger);

    printWindow.document.write(`
      <html>
        <head>
          <title>${type.charAt(0).toUpperCase() + type.slice(1)} Report</title>
          <style>
            body { font-family: Inter, sans-serif; margin: 20px; }
            h1, h2 { color: #1E3A8A; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #E5E7EB; padding: 8px; text-align: left; }
            th { background-color: #F3F4F6; }
            .summary { margin-top: 20px; }
            .summary p { margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const generateSalesPrintContent = (report: SalesReport | undefined) => {
    return `
      <h1>Sales Report</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Customer</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Price</th>
            <th>Date</th>
            <th>Payment Type</th>
          </tr>
        </thead>
        <tbody>
          ${
            report?.sales
              ?.map(
                (sale) => `
            <tr>
              <td>${sale.itemId.name}</td>
              <td>${sale.customerId?.name || "Cash"}</td>
              <td>${sale.quantity}</td>
              <td>$${sale.unitPrice.toFixed(2)}</td>
              <td>$${sale.totalPrice.toFixed(2)}</td>
              <td>${new Date(sale.date).toLocaleDateString()}</td>
              <td>${sale.paymentType}</td>
            </tr>
          `
              )
              .join("") || "<tr><td colspan='7'>No data</td></tr>"
          }
        </tbody>
      </table>
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Revenue: $${report?.summary.totalRevenue.toFixed(2)}</p>
        <p>Total Sales: ${report?.summary.totalSales}</p>
        <p>Average Sale Price: $${report?.summary.averageSalePrice.toFixed(2)}</p>
        <p>Top Items:</p>
        <ul>
          ${report?.summary.topItems
            .map(
              (item) =>
                `<li>${item.name}: ${item.quantity} units, $${item.revenue.toFixed(2)}</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  const generateItemsPrintContent = (report: ItemsReport | undefined) => {
    return `
      <h1>Items Report</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total Value</th>
            <th>Created By</th>
          </tr>
        </thead>
        <tbody>
          ${
            report?.items
              ?.map(
                (item) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td>$${item.totalValue.toFixed(2)}</td>
              <td>${item.createdBy.email}</td>
            </tr>
          `
              )
              .join("") || "<tr><td colspan='6'>No data</td></tr>"
          }
        </tbody>
      </table>
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Inventory Value: $${report?.summary.totalInventoryValue.toFixed(2)}</p>
        <p>Total Items: ${report?.summary.totalItems}</p>
        <p>Average Price: $${report?.summary.averagePrice.toFixed(2)}</p>
        <p>Low Stock Items: ${report?.summary.lowStockItems}</p>
        <p>Top Turnover Rates:</p>
        <ul>
          ${report?.summary.turnoverRate
            .map((item) => `<li>${item.name}: ${item.rate.toFixed(2)}</li>`)
            .join("")}
        </ul>
      </div>
    `;
  };

  const generateLedgerPrintContent = (report: LedgerReport | undefined) => {
    return `
      <h1>Customer Ledger</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Price</th>
            <th>Date</th>
            <th>Payment Type</th>
          </tr>
        </thead>
        <tbody>
          ${
            report?.ledger
              ?.map(
                (sale) => `
            <tr>
              <td>${sale.itemId.name}</td>
              <td>${sale.quantity}</td>
              <td>$${sale.unitPrice.toFixed(2)}</td>
              <td>$${sale.totalPrice.toFixed(2)}</td>
              <td>${new Date(sale.date).toLocaleDateString()}</td>
              <td>${sale.paymentType}</td>
            </tr>
          `
              )
              .join("") || "<tr><td colspan='6'>No data</td></tr>"
          }
        </tbody>
      </table>
      <div class="summary">
        <h2>Summary</h2>
        <p>Total Spent: $${report?.summary.totalSpent.toFixed(2)}</p>
        <p>Total Transactions: ${report?.summary.totalTransactions}</p>
        <p>Average Transaction Value: $${report?.summary.averageTransactionValue.toFixed(2)}</p>
        <p>Payment Type Breakdown:</p>
        <ul>
          ${report?.summary.paymentTypeBreakdown
            .map(
              (pt) =>
                `<li>${pt.type}: ${pt.count} (${pt.percentage.toFixed(2)}%)</li>`
            )
            .join("")}
        </ul>
      </div>
    `;
  };

  const handleExport = async (
    type: "sales" | "items" | "ledger",
    format: "excel" | "pdf"
  ) => {
    try {
      const blob = await exportReport({
        type,
        format,
        customerId: type === "ledger" ? customerId : undefined,
        startDate: watch("startDate"),
        endDate: watch("endDate"),
      }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report.${format === "excel" ? "xlsx" : "pdf"}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {}
  };

  const handleSort = (type: "sales" | "items" | "ledger", field: string) => {
    const setter =
      type === "sales"
        ? setSalesSort
        : type === "items"
          ? setItemsSort
          : setLedgerSort;
    const currentSort =
      type === "sales" ? salesSort : type === "items" ? itemsSort : ledgerSort;
    setter(currentSort === field ? `-${field}` : field);
  };

  // Chart data
  const salesChartData = {
    labels:
      salesReport?.summary.salesByDate.map(
        (d: SalesSummary["salesByDate"][number]) => d.date
      ) || [],
    datasets: [
      {
        label: "Revenue",
        data:
          salesReport?.summary.salesByDate.map(
            (d: SalesSummary["salesByDate"][number]) => d.revenue
          ) || [],
        borderColor: "#4BC0C0",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const itemsChartData = {
    labels: itemsReport?.items.map((item: Item) => item.name) || [],
    datasets: [
      {
        label: "Total Value",
        data: itemsReport?.items.map((item: Item) => item.totalValue) || [],
        backgroundColor: "#FF6384",
      },
    ],
  };

  const ledgerChartData = {
    labels:
      ledger?.summary.paymentTypeBreakdown.map(
        (pt: LedgerSummary["paymentTypeBreakdown"][number]) => pt.type
      ) || [],
    datasets: [
      {
        data:
          ledger?.summary.paymentTypeBreakdown.map(
            (pt: LedgerSummary["paymentTypeBreakdown"][number]) => pt.percentage
          ) || [],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Report Analysis" },
    },
  };

  return (
    <div className="flex min-h-screen bg-neutral">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-4 sm:p-8"
      >
        <h1 className="text-2xl font-semibold mb-6 text-text">Reports</h1>
        <div className="mb-8">
          <form className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-medium mb-4 text-text">
              Filter Reports
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-text text-sm mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">End Date</label>
                <input
                  type="date"
                  {...register("endDate")}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
              </div>
              <div>
                <label className="block text-text text-sm mb-1">
                  Customer (for Ledger)
                </label>
                <select
                  {...register("customerId")}
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                >
                  <option value="">Select Customer</option>
                  {customers?.customers?.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-text">Sales Report</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search by item or customer..."
                  value={salesSearch}
                  onChange={(e) => {
                    setSalesSearch(e.target.value);
                    setSalesPage(1);
                  }}
                  className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrint("sales")}
                    className="bg-gray-300 text-text p-2 rounded-md text-sm hover:bg-gray-400 mr-2"
                  >
                    Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport("sales", "pdf")}
                    className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600 mr-2"
                    disabled={exportLoading}
                  >
                    Export PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport("sales", "excel")}
                    className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600"
                    disabled={exportLoading}
                  >
                    Export Excel
                  </motion.button>
                </div>
              </div>
            </div>
            {salesLoading ? (
              <p className="text-text">Loading...</p>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-medium text-text">Summary</h3>
                  <p>
                    Total Revenue: $
                    {salesReport?.summary.totalRevenue.toFixed(2)}
                  </p>
                  <p>Total Sales: {salesReport?.summary.totalSales}</p>
                  <p>
                    Average Sale Price: $
                    {salesReport?.summary.averageSalePrice.toFixed(2)}
                  </p>
                  <p>Top Items:</p>
                  <ul className="list-disc pl-5">
                    {salesReport?.summary.topItems.map((item) => (
                      <li key={item.name}>
                        {item.name}: {item.quantity} units, $
                        {item.revenue.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <Line
                    data={salesChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: { display: true, text: "Sales Trends" },
                      },
                    }}
                  />
                </div>
                <table className="w-full text-sm text-text">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "itemId.name")}
                          className="hover:underline"
                        >
                          Item{" "}
                          {salesSort === "itemId.name"
                            ? "↑"
                            : salesSort === "-itemId.name"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "customerId.name")}
                          className="hover:underline"
                        >
                          Customer{" "}
                          {salesSort === "customerId.name"
                            ? "↑"
                            : salesSort === "-customerId.name"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "quantity")}
                          className="hover:underline"
                        >
                          Quantity{" "}
                          {salesSort === "quantity"
                            ? "↑"
                            : salesSort === "-quantity"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "unitPrice")}
                          className="hover:underline"
                        >
                          Unit Price{" "}
                          {salesSort === "unitPrice"
                            ? "↑"
                            : salesSort === "-unitPrice"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "totalPrice")}
                          className="hover:underline"
                        >
                          Total Price{" "}
                          {salesSort === "totalPrice"
                            ? "↑"
                            : salesSort === "-totalPrice"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("sales", "date")}
                          className="hover:underline"
                        >
                          Date{" "}
                          {salesSort === "date"
                            ? "↑"
                            : salesSort === "-date"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">Payment Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesReport?.sales?.map((sale) => (
                      <tr key={sale._id} className="border-b">
                        <td className="p-2">{sale.itemId.name}</td>
                        <td className="p-2">
                          {sale.customerId?.name || "Cash"}
                        </td>
                        <td className="p-2">{sale.quantity}</td>
                        <td className="p-2">${sale.unitPrice.toFixed(2)}</td>
                        <td className="p-2">${sale.totalPrice.toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">{sale.paymentType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {salesReport && (
                  <Pagination
                    currentPage={salesReport.page}
                    totalPages={salesReport.totalPages}
                    onPageChange={setSalesPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-text">Items Report</h2>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={itemsSearch}
                  onChange={(e) => {
                    setItemsSearch(e.target.value);
                    setItemsPage(1);
                  }}
                  className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                />
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrint("items")}
                    className="bg-gray-300 text-text p-2 rounded-md text-sm hover:bg-gray-400 mr-2"
                  >
                    Print
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport("items", "pdf")}
                    className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600 mr-2"
                    disabled={exportLoading}
                  >
                    Export PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport("items", "excel")}
                    className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600"
                    disabled={exportLoading}
                  >
                    Export Excel
                  </motion.button>
                </div>
              </div>
            </div>
            {itemsLoading ? (
              <p className="text-text">Loading...</p>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-medium text-text">Summary</h3>
                  <p>
                    Total Inventory Value: $
                    {itemsReport?.summary.totalInventoryValue.toFixed(2)}
                  </p>
                  <p>Total Items: {itemsReport?.summary.totalItems}</p>
                  <p>
                    Average Price: $
                    {itemsReport?.summary.averagePrice.toFixed(2)}
                  </p>
                  <p>Low Stock Items: {itemsReport?.summary.lowStockItems}</p>
                  <p>Top Turnover Rates:</p>
                  <ul className="list-disc pl-5">
                    {itemsReport?.summary.turnoverRate.map((item) => (
                      <li key={item.name}>
                        {item.name}: {item.rate.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <Bar
                    data={itemsChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: "Inventory Value by Item",
                        },
                      },
                    }}
                  />
                </div>
                <table className="w-full text-sm text-text">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("items", "name")}
                          className="hover:underline"
                        >
                          Name{" "}
                          {itemsSort === "name"
                            ? "↑"
                            : itemsSort === "-name"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("items", "quantity")}
                          className="hover:underline"
                        >
                          Quantity{" "}
                          {itemsSort === "quantity"
                            ? "↑"
                            : itemsSort === "-quantity"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("items", "price")}
                          className="hover:underline"
                        >
                          Price{" "}
                          {itemsSort === "price"
                            ? "↑"
                            : itemsSort === "-price"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("items", "totalValue")}
                          className="hover:underline"
                        >
                          Total Value{" "}
                          {itemsSort === "totalValue"
                            ? "↑"
                            : itemsSort === "-totalValue"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsReport?.items?.map((item) => (
                      <tr key={item._id} className="border-b">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">${item.price.toFixed(2)}</td>
                        <td className="p-2">${item.totalValue.toFixed(2)}</td>
                        <td className="p-2">{item.createdBy.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {itemsReport && (
                  <Pagination
                    currentPage={itemsReport.page}
                    totalPages={itemsReport.totalPages}
                    onPageChange={setItemsPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            )}
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-text">Customer Ledger</h2>
              {customerId && (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search by item..."
                    value={ledgerSearch}
                    onChange={(e) => {
                      setLedgerSearch(e.target.value);
                      setLedgerPage(1);
                    }}
                    className="p-2 border rounded-md text-sm focus:ring-2 focus:ring-secondary border-gray-300"
                  />
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePrint("ledger")}
                      className="bg-gray-300 text-text p-2 rounded-md text-sm hover:bg-gray-400 mr-2"
                    >
                      Print
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("ledger", "pdf")}
                      className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600 mr-2"
                      disabled={exportLoading}
                    >
                      Export PDF
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleExport("ledger", "excel")}
                      className="bg-accent text-white p-2 rounded-md text-sm hover:bg-green-600"
                      disabled={exportLoading}
                    >
                      Export Excel
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
            {ledgerLoading ? (
              <p className="text-text">Loading...</p>
            ) : customerId ? (
              <>
                <div className="mb-4">
                  <h3 className="text-md font-medium text-text">Summary</h3>
                  <p>Total Spent: ${ledger?.summary?.totalSpent?.toFixed(2)}</p>
                  <p>Total Transactions: {ledger?.summary.totalTransactions}</p>
                  <p>
                    Average Transaction Value: $
                    {ledger?.summary?.averageTransactionValue?.toFixed(2)}
                  </p>
                  <p>Payment Type Breakdown:</p>
                  <ul className="list-disc pl-5">
                    {ledger?.summary.paymentTypeBreakdown.map((pt) => (
                      <li key={pt.type}>
                        {pt.type}: {pt.count} ({pt.percentage.toFixed(2)}%)
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <Pie
                    data={ledgerChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: "Payment Type Breakdown",
                        },
                      },
                    }}
                  />
                </div>
                <table className="w-full text-sm text-text">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("ledger", "itemId.name")}
                          className="hover:underline"
                        >
                          Item{" "}
                          {ledgerSort === "itemId.name"
                            ? "↑"
                            : ledgerSort === "-itemId.name"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("ledger", "quantity")}
                          className="hover:underline"
                        >
                          Quantity{" "}
                          {ledgerSort === "quantity"
                            ? "↑"
                            : ledgerSort === "-quantity"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("ledger", "unitPrice")}
                          className="hover:underline"
                        >
                          Unit Price{" "}
                          {ledgerSort === "unitPrice"
                            ? "↑"
                            : ledgerSort === "-unitPrice"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("ledger", "totalPrice")}
                          className="hover:underline"
                        >
                          Total Price{" "}
                          {ledgerSort === "totalPrice"
                            ? "↑"
                            : ledgerSort === "-totalPrice"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">
                        <button
                          onClick={() => handleSort("ledger", "date")}
                          className="hover:underline"
                        >
                          Date{" "}
                          {ledgerSort === "date"
                            ? "↑"
                            : ledgerSort === "-date"
                              ? "↓"
                              : ""}
                        </button>
                      </th>
                      <th className="p-2 text-left">Payment Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger?.ledger?.map((sale) => (
                      <tr key={sale._id} className="border-b">
                        <td className="p-2">{sale.itemId.name}</td>
                        <td className="p-2">{sale.quantity}</td>
                        <td className="p-2">${sale.unitPrice.toFixed(2)}</td>
                        <td className="p-2">${sale.totalPrice.toFixed(2)}</td>
                        <td className="p-2">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">{sale.paymentType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ledger && (
                  <Pagination
                    currentPage={ledger.page}
                    totalPages={ledger.totalPages}
                    onPageChange={setLedgerPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                  />
                )}
              </>
            ) : (
              <p className="text-text">
                Select a customer to view their ledger.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Reports;
