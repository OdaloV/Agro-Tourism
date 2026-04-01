"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "visitor" | "farmer" | "admin" | null;

interface AuthContextType {
  user: any | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount
    const storedRole = localStorage.getItem("userRole") as UserRole;
    const storedAuth = localStorage.getItem("isAuthenticated");

    if (storedAuth === "true" && storedRole) {
      setRole(storedRole);
      setIsAuthenticated(true);
      // You could fetch user data here
    }
  }, []);

  const login = (userRole: UserRole, userData: any) => {
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem("userRole", userRole || "");
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
