import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext"
import FullPageLoader from "@/pages/components/loadingScreen";

const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const hasToken = !!localStorage.getItem("token");

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    // Temporary guard: allow payment-success to load when we *do* have a token
    // but the AuthContext user object hasn't been populated yet (race with refresh/auth check).
    if (location.pathname === "/payment-success" && hasToken) {
      return <Outlet />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Render the child components if authenticated
}

export default ProtectedRoute;