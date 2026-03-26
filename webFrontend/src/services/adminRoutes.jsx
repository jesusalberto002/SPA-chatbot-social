import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext"

const AdminRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or similar
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />; // Render the child components if authenticated
}

export default AdminRoute;