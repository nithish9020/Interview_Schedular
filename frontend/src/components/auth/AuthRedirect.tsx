import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import { Navigate } from "react-router-dom";

export default function AuthRedirect() {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return token ? <Navigate to="/dashboard/analytics" replace /> : <LoginPage />;
}