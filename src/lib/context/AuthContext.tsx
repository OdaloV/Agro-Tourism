// src/lib/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "visitor" | "farmer" | "admin" | null;

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  verificationStatus?: string;
  farmName?: string;
  twoFactorEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole, userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage on mount with proper error handling
    const storedRole = localStorage.getItem("userRole") as UserRole;
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUser = localStorage.getItem("userData");

    if (storedAuth === "true" && storedRole) {
      setRole(storedRole);
      setIsAuthenticated(true);
      
      if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate that parsedUser is a valid object
          if (parsedUser && typeof parsedUser === 'object' && parsedUser.id) {
            setUser(parsedUser);
          } else {
            // Invalid user data, clear storage
            console.error('Invalid user data structure');
            clearAuthStorage();
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          clearAuthStorage();
        }
      } else {
        // No valid user data, clear auth state
        clearAuthStorage();
      }
    }
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("auth_token");
    setRole(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  const login = (userRole: UserRole, userData: User) => {
    // Ensure userData is valid before storing
    if (!userData || !userData.id) {
      console.error('Invalid user data provided to login');
      return;
    }
    
    setUser(userData);
    setRole(userRole);
    setIsAuthenticated(true);
    localStorage.setItem("userRole", userRole || "");
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("auth_token");
    router.push("/auth");
  };

  const updateUser = (userData: User) => {
    if (!userData || !userData.id) {
      console.error('Invalid user data provided to updateUser');
      return;
    }
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, login, logout, updateUser }}
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