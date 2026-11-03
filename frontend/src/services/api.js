
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message || `Error en la solicitud: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
