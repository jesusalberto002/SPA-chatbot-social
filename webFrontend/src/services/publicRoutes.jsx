import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext"

import FullPageLoader from "@/pages/components/loadingScreen";

const PublicRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageLoader />;
  }

  if (user) {
    return <Navigate to="/home" replace />; // Redirect to home if user is authenticated
  }

  return <Outlet />; // Render the child components if not authenticated
}

export default PublicRoute;