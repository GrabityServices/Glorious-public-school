import { createContext, useContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const ADMIN_TOKEN_KEY = "gps_admin_token";
export const ADMIN_USER_KEY = "gps_admin_user";
export const ADMIN_EXPIRES_AT_KEY = "gps_admin_expires_at";

// Session duration: Exactly 1 hour (60 minutes)
export const SESSION_DURATION_MS = 60 * 60 * 1000; // 3,600,000 ms

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem(ADMIN_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [expiresAt, setExpiresAt] = useState(() => {
    try {
      const stored = localStorage.getItem(ADMIN_EXPIRES_AT_KEY);
      return stored ? Number(stored) : null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState("");
  const [isValidating, setIsValidating] = useState(true);

  const logout = useCallback((reason = "") => {
    setAdminUser(null);
    setToken(null);
    setExpiresAt(null);
    if (reason) {
      setAuthError(reason);
    } else {
      setAuthError("");
    }
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      localStorage.removeItem(ADMIN_EXPIRES_AT_KEY);
      localStorage.removeItem("gps_admin_auth");
    } catch (err) {
      console.error("Failed to clear admin session:", err);
    }
  }, []);

  // Validate existing token and 1-hour expiration on application mount
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const savedExpiry = localStorage.getItem(ADMIN_EXPIRES_AT_KEY);

      if (!savedToken) {
        if (isMounted) setIsValidating(false);
        return;
      }

      // Check if 1-hour session has already passed
      if (savedExpiry && Date.now() >= Number(savedExpiry)) {
        console.warn("[Auth] 1-hour session limit reached on load. Logging out.");
        if (isMounted) {
          logout("Your admin session has expired after 1 hour. Please sign in again.");
          setIsValidating(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAdminUser(data.admin);
            try {
              localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
            } catch (e) {}
          }
        } else if (res.status === 401 || res.status === 403) {
          console.warn("[Auth] Server rejected token (expired or invalid). Logging out.");
          if (isMounted) {
            logout("Your session has expired. Please sign in again.");
          }
        }
      } catch (err) {
        console.warn("[Auth] Could not verify token with server:", err.message);
      } finally {
        if (isMounted) setIsValidating(false);
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // Automatic logout timer: Exactly 1 hour from login
  useEffect(() => {
    if (!token || !expiresAt) return;

    const remainingMs = expiresAt - Date.now();

    if (remainingMs <= 0) {
      logout("Your admin session has expired after 1 hour. Please sign in again.");
      return;
    }

    const timer = setTimeout(() => {
      console.warn("[Auth] 1 hour elapsed. Automatically logging out administrator.");
      logout("Your admin session has expired after 1 hour. Please sign in again to continue.");
    }, remainingMs);

    return () => clearTimeout(timer);
  }, [token, expiresAt, logout]);

  const login = async (identifier, password) => {
    setAuthError("");
    const cleanId = (identifier || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanId || !cleanPass) {
      const msg = "Please enter both your email/username and password.";
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: cleanId, password: cleanPass }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        // Enforce exact 1 hour expiration (3600 seconds)
        const expiryTime = data.expiresAt || (Date.now() + SESSION_DURATION_MS);

        setToken(data.token);
        setAdminUser(data.admin);
        setExpiresAt(expiryTime);

        try {
          localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
          localStorage.setItem(ADMIN_EXPIRES_AT_KEY, String(expiryTime));
        } catch (e) {
          console.error("Failed to persist admin token:", e);
        }
        return { success: true, admin: data.admin };
      } else {
        const errMsg = data.error || "Invalid username/email or password.";
        setAuthError(errMsg);
        return {
          success: false,
          error: errMsg,
          failedAttempts: data.failedAttempts || 0,
          maxAttempts: data.maxAttempts || 4,
          remainingAttempts: data.remainingAttempts,
          warning: data.warning || null,
          isLocked: Boolean(data.isLocked),
          lockedUntil: data.lockedUntil || 0,
          remainingSeconds: data.remainingSeconds || 0,
          waitMinutes: data.waitMinutes || 0,
          code: data.code,
        };
      }
    } catch (err) {
      console.error("[Auth Login Error]:", err);
      const errMsg = "Server connection error. Please ensure the backend is running.";
      setAuthError(errMsg);
      return { success: false, error: errMsg };
    }
  };

  const checkLoginStatus = async () => {
    try {
      const res = await fetch("/api/auth/login-status");
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Auth] Could not fetch login status:", err);
    }
    return {
      isLocked: false,
      failedAttempts: 0,
      maxAttempts: 4,
      remainingAttempts: 4,
      lockedUntil: 0,
      remainingSeconds: 0,
      waitMinutes: 0,
      warning: null,
    };
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!token) {
      return { success: false, error: "You must be signed in to change your password." };
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || "Failed to change password." };
      }
    } catch (err) {
      return { success: false, error: "Network error while changing password." };
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) {
      return { success: false, error: "You must be signed in to update your profile." };
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAdminUser(data.admin);
        try {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
        } catch (e) {}
        return { success: true, admin: data.admin };
      } else {
        return { success: false, error: data.error || "Failed to update profile." };
      }
    } catch (err) {
      return { success: false, error: "Network error while updating profile." };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        adminUser,
        expiresAt,
        isAuthenticated: Boolean(adminUser && token),
        isValidating,
        authError,
        setAuthError,
        login,
        checkLoginStatus,
        logout,
        changePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { useAuth } from "./useAuth";
export default AuthProvider;
