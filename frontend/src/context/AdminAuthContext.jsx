import { createContext, useContext, useState } from "react";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {

  const [credentials, setCredentials] = useState(() => {
    const savedCredentials = sessionStorage.getItem("boom_admin_auth");

    return savedCredentials ? JSON.parse(savedCredentials) : null;
  });

  const login = (auth) => {
    sessionStorage.setItem("boom_admin_auth", JSON.stringify(auth));
    setCredentials(auth);
  };

  const logout = () => {
    sessionStorage.removeItem("boom_admin_auth");
    setCredentials(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ credentials, login, logout }}
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