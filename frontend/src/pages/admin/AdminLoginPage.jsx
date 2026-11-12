import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAdminAuth } from "../../context/AdminAuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function AdminLoginPage() {
  const navigate = useNavigate();

  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Correo o contraseña incorrectos."
        );
      }

      if (data.rol !== "ADMIN") {
        throw new Error(
          "Este usuario no tiene permisos de administrador."
        );
      }

      login(data);

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message || "No fue posible iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bn-admin">
      <div className="bn-login-card">

        <div className="bn-brand">
          <span className="bn-brand-mark">B</span>

          <span>
            BOOM <strong>NAILS</strong>
          </span>
        </div>

        <div className="bn-login-icon">✦</div>

        <p className="bn-eyebrow">
          PORTAL ADMINISTRATIVO
        </p>

        <h1>Bienvenida de nuevo</h1>

        <p className="bn-muted">
          Ingresa para gestionar los pagos y pedidos
          de tu tienda.
        </p>

        <form
          onSubmit={handleLogin}
          className="bn-login-form"
        >
          <label htmlFor="admin-email">
            Correo electrónico
          </label>

          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            placeholder="admin@boomnails.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <label htmlFor="admin-password">
            Contraseña
          </label>

          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {error && (
            <p className="bn-error">
              {error}
            </p>
          )}

          <button
            className="bn-primary-button"
            disabled={loading}
          >
            {loading
              ? "Verificando acceso..."
              : "Ingresar al panel"}

            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="bn-login-footer">
          <span className="bn-lock">▣</span>
          Acceso exclusivo para administradores
        </p>

      </div>
    </main>
  );
}

export default AdminLoginPage;