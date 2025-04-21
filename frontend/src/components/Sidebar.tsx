import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useLogoutMutation } from "../api/authApi";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [logout, { isLoading }] = useLogoutMutation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Inventory", path: "/inventory", icon: "📦" },
    { name: "Customers", path: "/customers", icon: "👥" },
    { name: "Sales", path: "/sales", icon: "💸" },
    { name: "Reports", path: "/reports", icon: "📊" },
  ];

  return (
    <motion.div
      initial={isMounted ? false : { x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className="w-64 bg-primary text-white h-screen p-6 fixed top-0 left-0"
    >
      <h1 className="text-xl font-semibold mb-8">Inventory Pro</h1>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center py-2 px-4 rounded-md mb-2 text-sm ${
                isActive ? "bg-secondary" : "hover:bg-blue-700"
              }`
            }
          >
            <span className="mr-2">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => logout()}
        className="w-full bg-red-500 text-white p-2 rounded-md text-sm hover:bg-red-600 mt-4"
        disabled={isLoading}
      >
        {isLoading ? "Signing Out..." : "Sign Out"}
      </motion.button>
    </motion.div>
  );
};

export default Sidebar;
