import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const ADMIN_STORAGE_KEY = "gps_admin_auth";

// Default admin credentials
export const DEFAULT_ADMIN = {
  email: "admin@glorious.edu",
  username: "admin",
  password: "admin123",
  name: "Dr. R. K. Sharma",
  role: "Super Administrator",
  avatar: "/images/guide1.png",
};

export function AuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState("");

  const login = (identifier, password) => {
    setAuthError("");
    const cleanId = (identifier || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const isMatch =
      (cleanId === DEFAULT_ADMIN.email.toLowerCase() ||
        cleanId === DEFAULT_ADMIN.username.toLowerCase()) &&
      cleanPass === DEFAULT_ADMIN.password;

    if (isMatch) {
      const userSession = {
        name: DEFAULT_ADMIN.name,
        email: DEFAULT_ADMIN.email,
        role: DEFAULT_ADMIN.role,
        avatar: DEFAULT_ADMIN.avatar,
        loginTime: new Date().toISOString(),
      };
      setAdminUser(userSession);
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(userSession));
      } catch (err) {
        console.error("Failed to save admin session:", err);
      }
      return { success: true };
    } else {
      const errorMsg = "Invalid admin username/email or password.";
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setAdminUser(null);
    setAuthError("");
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear admin session:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: !!adminUser,
        authError,
        setAuthError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
