const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "boom_admin_token";

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const hadToken = Boolean(token);

  const headers = {
    ...options.headers,
  };

  if (
    !(options.body instanceof FormData) &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("boom_admin_user");

    // Solo redirigir al login si realmente existía
    // una sesión administrativa.
    if (hadToken) {
      window.location.href = "/admin/login";
    }

    throw new Error(
      hadToken
        ? "Sesión expirada. Inicia sesión nuevamente."
        : "No autorizado."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "No tienes permisos para realizar esta operación."
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Error en la solicitud: ${response.status}`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}