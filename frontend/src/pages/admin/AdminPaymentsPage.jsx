import { useEffect, useState } from "react";
import "./components/ui/AdminCommon.css";
import "./AdminPaymentsPage.css";
import AdminTopBar from "./components/ui/AdminTopBar";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { apiRequest } from "../../services/api";
import { formatCurrency, formatDateOnly } from "../../utils/formatters";


function AdminPaymentsPage() {
  const { logout } = useAdminAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openingReceipt, setOpeningReceipt] = useState(null);

  const [reviewingPayment, setReviewingPayment] = useState(null);

const reviewPayment = async (payment, action, reason = "") => {
  const actionLabel =
    action === "approve" ? "aprobar" : "rechazar";

  if (
    !window.confirm(
      `¿Confirmas que deseas ${actionLabel} el pago ${payment.orderNumber}?`
    )
  ) {
    return;
  }

  if (action === "reject" && !reason.trim()) {
    setError("Debes indicar el motivo del rechazo.");
    return;
  }

  setReviewingPayment(payment.paymentId);
  setError("");
  setSuccess("");

  try {
    const data = await apiRequest(
      `/admin/payments/${payment.paymentId}/${action}`,
      {
        method: "POST",
        ...(action === "reject"
          ? {
              body: JSON.stringify({
                reason: reason.trim(),
              }),
            }
          : {}),
      }
    );

    await loadPayments();

    setSuccess(data?.message || "Operación completada.");
  } catch (err) {
    setSuccess("");
    setError(
      err.message || "Error al revisar el pago."
    );
  } finally {
    setReviewingPayment(null);
  }
};

  const loadPayments = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await apiRequest(
      "/admin/payments/pending"
    );

    setPayments(data);
  } catch (err) {
    setPayments([]);
    setError(
      err.message ||
        "No se pudo conectar con el servidor."
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadPayments();
}, []);

  const openReceipt = async (payment) => {
  if (!payment.receiptPath) return;

  const preview = window.open("", "_blank");

  setOpeningReceipt(payment.paymentId);
  setError("");

  try {
    const token = sessionStorage.getItem(
      "boom_admin_token"
    );

    if (!token) {
      preview?.close();

      setError(
        "Tu sesión ha expirado. Inicia sesión nuevamente."
      );

      window.location.href = "/admin/login";
      return;
    }

    const baseUrl = (
      import.meta.env.VITE_API_URL || ""
    ).replace(/\/api\/?$/, "");

    const response = await fetch(
      `${baseUrl}${payment.receiptPath}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      preview?.close();

      sessionStorage.removeItem("boom_admin_token");
      sessionStorage.removeItem("boom_admin_user");

      window.location.href = "/admin/login";
      return;
    }

    if (response.status === 403) {
      throw new Error(
        "No tienes permisos para visualizar este comprobante."
      );
    }

    if (!response.ok) {
      throw new Error(
        "No fue posible abrir el comprobante."
      );
    }

    const blob = await response.blob();
    const fileUrl = URL.createObjectURL(blob);

    if (preview) {
      preview.location.href = fileUrl;
    } else {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.click();
    }

    setTimeout(
      () => URL.revokeObjectURL(fileUrl),
      60000
    );
  } catch (err) {
    preview?.close();

    setError(
      err.message ||
        "Error al abrir el comprobante."
    );
  } finally {
    setOpeningReceipt(null);
  }
};
  const totalPending = payments.reduce(
  (sum, payment) =>
    sum + Number(payment.amount || 0),
  0
);

return (
  <main className="bn-orders-layout">
    <AdminSidebar />

    <div className="bn-payments-content">
      <AdminTopBar
        section="Gestión de pagos"
        onLogout={logout}
      />

      <section className="bn-dashboard">
        <div className="bn-page-heading">
          <div>
            <p className="bn-eyebrow">CENTRO DE CONTROL</p>

            <h1>
              Revisión de pagos<span>.</span>
            </h1>

            <p className="bn-muted">
              Verifica los comprobantes y controla las
              transferencias de tus clientes.
            </p>
          </div>

          <button
            className="bn-refresh-button"
            onClick={() => loadPayments()}
            disabled={loading}
          >
            ↻ <span>Actualizar</span>
          </button>
        </div>

        {error && (
          <div className="bn-error-banner">
            {error}
          </div>
        )}

        {success && (
          <div
            className="bn-success-banner"
            role="status"
          >
            <span>✓</span>
            {success}
          </div>
        )}

        <div className="bn-stat-grid">
          <article className="bn-stat-card bn-stat-featured">
            <div className="bn-stat-top">
              <span>Pagos por revisar</span>
              <span className="bn-stat-icon">◷</span>
            </div>

            <strong>{payments.length}</strong>

            <small>
              Transferencias pendientes
            </small>
          </article>

          <article className="bn-stat-card">
            <div className="bn-stat-top">
              <span>Importe pendiente</span>
              <span className="bn-stat-icon">＄</span>
            </div>

            <strong className="bn-stat-money">
              {formatCurrency(totalPending)}
            </strong>

            <small>
              Valor de los pagos listados
            </small>
          </article>

          <article className="bn-stat-card">
            <div className="bn-stat-top">
              <span>Método de pago</span>
              <span className="bn-stat-icon">↗</span>
            </div>

            <strong>Transferencia</strong>

            <small>
              Validación manual del comprobante
            </small>
          </article>
        </div>

        <section className="bn-payments-panel">
          <div className="bn-panel-heading">
            <div>
              <h2>Pagos pendientes</h2>

              <p>
                Revisa cada comprobante antes de
                confirmar el pedido.
              </p>
            </div>

            <span className="bn-count-pill">
              {payments.length} registros
            </span>
          </div>

          {loading ? (
            <div className="bn-empty-state">
              <span className="bn-spinner" />

              <p>
                Cargando información de pagos...
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bn-empty-state">
              <span className="bn-empty-icon">
                ✓
              </span>

              <h3>Todo al día</h3>

              <p>
                No hay pagos pendientes de revisión.
              </p>
            </div>
          ) : (
            <div className="bn-table-wrap">
              <table className="bn-payments-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha de envío</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Comprobante</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.paymentId}>
                      <td>
                        <strong className="bn-order-number">
                          {payment.orderNumber}
                        </strong>

                        <small className="bn-subtext">
                          Pago #{payment.paymentId}
                        </small>
                      </td>

                      <td>
                        <strong>
                          {payment.customerName}
                        </strong>

                        <small className="bn-subtext">
                          {payment.customerEmail}
                        </small>
                      </td>

                      <td>
                        {formatDateOnly(payment.receiptUploadedAt)}
                      </td>

                      <td>
                        <strong className="bn-amount">
                          {formatCurrency(payment.amount)}
                        </strong>
                      </td>

                      <td>
                        <span className="bn-status">
                          <span />
                          Pendiente
                        </span>
                      </td>

                      <td>
                        <button
                          className="bn-receipt-button"
                          onClick={() =>
                            openReceipt(payment)
                          }
                          disabled={
                            openingReceipt ===
                            payment.paymentId
                          }
                        >
                          {openingReceipt ===
                          payment.paymentId
                            ? "Abriendo..."
                            : "Ver comprobante ↗"}
                        </button>
                      </td>

                      <td>
                        <div className="bn-review-actions">
                          <button
                            className="bn-approve-button"
                            disabled={
                              reviewingPayment ===
                              payment.paymentId
                            }
                            onClick={() =>
                              reviewPayment(
                                payment,
                                "approve"
                              )
                            }
                          >
                            {reviewingPayment ===
                            payment.paymentId
                              ? "Procesando..."
                              : "Aprobar"}
                          </button>

                          <button
                            className="bn-reject-button"
                            disabled={
                              reviewingPayment ===
                              payment.paymentId
                            }
                            onClick={() => {
                              const reason =
                                window.prompt(
                                  "Indica el motivo del rechazo del comprobante:"
                                );

                              if (reason !== null) {
                                reviewPayment(
                                  payment,
                                  "reject",
                                  reason
                                );
                              }
                            }}
                          >
                            Rechazar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bn-panel-footer">
            <span>
              Los pagos solo se consideran aprobados tras
              su validación.
            </span>

            <span>BOOM NAILS · ADMIN</span>
          </div>
        </section>
      </section>
    </div>
  </main>
);
}

export default AdminPaymentsPage;
