import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(undefined);

const API_BASE = "http://localhost:8000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- helpers ----
  const getToken = () => localStorage.getItem("token");

  const setAuth = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", user.roles?.[0] ?? "");
    setUser(user);
    setRole(user.roles?.[0] ?? null);
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    setRole(null);
  };

  // ---- init auth on refresh ----
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      // optimistic UI
      setUser(JSON.parse(storedUser));
      setRole(localStorage.getItem("role"));

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setAuth(token, data.user);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ---- LOGIN ----
  const signIn = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append("username", email); // OAuth2 requirement
      formData.append("password", password);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
      setAuth(data.access_token, data.user);

      return { error: null };
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  // ---- SIGNUP ----
  const signUp = async (username, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const err = await res.json();

        if (Array.isArray(err.detail)) {
          const message = err.detail.map((e) => e.msg).join(", ");
          throw new Error(message);
        }

        throw new Error(err.detail || "Signup failed");
      }

      const data = await res.json();
      setAuth(data.access_token, data.user);

      return { error: null };
    } catch (error) {
      return { error: { message: error.message } };
    }
  };

  // ---- LOGOUT ----
  const signOut = () => {
    clearAuth();
  };

  const session = user ? { user } : null;

  return (
    <AuthContext.Provider
      value={{ user, role, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
