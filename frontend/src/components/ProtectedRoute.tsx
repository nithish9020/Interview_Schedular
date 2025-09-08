import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "INTERVIEWER" | "APPLICANT";
}) {
  const { token, loading } = useAuth();
  const storedRole = localStorage.getItem("role");

  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/" replace />;

  // if a role is required but doesn't match
  if (role && storedRole !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
