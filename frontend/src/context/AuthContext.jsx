import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Load saved data on startup
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bb_user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("bb_token") || null);

  // Sync to localStorage whenever values change
  useEffect(() => {
    if (token) localStorage.setItem("bb_token", token);
    else localStorage.removeItem("bb_token");

    if (user) localStorage.setItem("bb_user", JSON.stringify(user));
    else localStorage.removeItem("bb_user");
  }, [token, user]);

  // ✅ Updated function name and argument order
  const login = (userPayload, tkn) => {
    setUser(userPayload);
    setToken(tkn);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bb_user");
    localStorage.removeItem("bb_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
