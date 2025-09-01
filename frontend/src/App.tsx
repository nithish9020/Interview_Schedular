// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { AuthProvider } from "@/context/AuthContext";
import AuthRedirect from "@/components/AuthRedirect";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<AuthRedirect />} />
          <Route
            path='/dashboard'
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
