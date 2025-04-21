import { motion } from "framer-motion";
import { useAppSelector } from "../store/hooks";
import { useGetDashboardDataQuery } from "../api/dashboardApi";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, error } = useGetDashboardDataQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-neutral justify-center items-center">
        <p className="text-text">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-neutral justify-center items-center">
        <p className="text-red-500">Error loading dashboard data</p>
      </div>
    );
  }

  const { totalSales, totalRevenue, inventoryStatus, recentCustomerLedger } =
    data || {};

  // Chart data for inventory status
  const chartData = {
    labels: ["Total Items", "Low Stock Items"],
    datasets: [
      {
        label: "Inventory Status",
        data: [
          inventoryStatus?.totalItems || 0,
          inventoryStatus?.lowStockItems || 0,
        ],
        backgroundColor: ["#4BC0C0", "#FF6384"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Inventory Overview" },
    },
  };

  return (
    <div className="flex min-h-screen bg-neutral">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 p-8"
      >
        <h1 className="text-2xl font-semibold mb-6 text-text">
          Welcome, {user?.email}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-2 text-text">Total Sales</h2>
            <p className="text-xl text-accent">{totalSales || 0} Sales</p>
            <p className="text-sm text-gray-600">
              Revenue: ${totalRevenue?.toFixed(2) || "0.00"}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-2 text-text">
              Inventory Status
            </h2>
            <p className="text-xl text-accent">
              {inventoryStatus?.totalItems || 0} Items
            </p>
            <p className="text-sm text-gray-600">
              Low Stock: {inventoryStatus?.lowStockItems || 0}
            </p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-medium mb-2 text-text">
              Customer Ledger
            </h2>
            <p className="text-sm text-gray-600">Recent Transactions:</p>
            <ul className="mt-2 space-y-1">
              {recentCustomerLedger?.length ? (
                recentCustomerLedger.map((sale: any) => (
                  <li key={sale._id} className="text-sm text-text">
                    {sale.itemId?.name || "N/A"} - {sale.quantity} units (
                    {sale.customerId?.name || "Cash"})
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">
                  No recent transactions
                </li>
              )}
            </ul>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <Bar data={chartData} options={chartOptions} />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
