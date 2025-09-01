import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  if (!user || !token) {
    return <div>No user data. Please login.</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div>Email: {user.email}</div>
      <div>JWT Token: {token}</div>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}