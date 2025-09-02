import type { UserRole } from "@/lib/types";
import React, { createContext, useContext, useState, useEffect } from "react";

type AuthContextType = {
  user: any;
  token: string;
  login: (user: any, token: string, role: UserRole) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (user: any, token: string, role: UserRole) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {  
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};