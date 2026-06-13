import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    // SC-24: No localStorage check needed — the httpOnly cookie is sent automatically.
    // If no valid cookie exists, the server returns 401 and we clear user state.
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    // SC-24: Server sets httpOnly cookie; we only store non-sensitive user info in state
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    // SC-24: Server sets httpOnly cookie; no token stored in client-side storage
    setUser(data.user);
    return data.user;
  };

  // SC-11/SC-24: Server-side logout clears the httpOnly cookie on the server
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
