import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useRefreshMutation } from "../api/authApi";
import toast from "react-hot-toast";

const ProtectedRoute = ({ isAuthRoute = false }: { isAuthRoute?: boolean }) => {
  const { accessToken, refreshToken } = useAppSelector((state) => state.auth);
  const [refresh, { isLoading: isRefreshing }] = useRefreshMutation();
  const location = useLocation();

  if (!isAuthRoute && !accessToken && refreshToken && !isRefreshing) {
    console.log("No access token. Attempting refresh with:", refreshToken);
    refresh({ refreshToken })
      .unwrap()
      .catch((error) => {
        console.error("Refresh failed:", error);
        toast.error("Session expired. Please sign in again.");
      });
  }

  if (isRefreshing) {
    console.log("Refreshing token. Showing loading state.");
    return (
      <div className="min-h-screen flex items-center justify-center text-primary">
        <svg
          className="animate-spin h-8 w-8 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (isAuthRoute && accessToken) {
    console.log(
      "Authenticated user tried to access auth route. Redirecting to /dashboard"
    );
    return <Navigate to="/dashboard" replace state={{ from: location }} />;
  }

  if (!isAuthRoute && !accessToken) {
    console.log("No access token. Redirecting to /login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log("Rendering route:", location.pathname);
  return <Outlet />;
};

export default ProtectedRoute;
