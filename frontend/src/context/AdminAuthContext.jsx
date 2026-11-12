import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext(null);

const TOKEN_KEY = "boom_admin_token";
const USER_KEY = "boom_admin_user";

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem(USER_KEY);

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (authData) => {
    sessionStorage.setItem(TOKEN_KEY, authData.token);

    const userData = {
      correo: authData.correo,
      rol: authData.rol,
    };

    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify(userData)
    );

    setToken(authData.token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token);

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error(
      "useAdminAuth debe utilizarse dentro de AdminAuthProvider."
    );
  }

  return context;
}