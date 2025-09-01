import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? <>{children}</> : <Navigate to="/" replace />;
}