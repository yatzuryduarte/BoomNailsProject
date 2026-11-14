
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { apiRequest } from "../../services/api";
import "./AdminOrderDetailPage.css";
import { formatCurrency, formatDate } from "../../utils/formatters";

const API_URL = "http://localhost:8080/api/admin/orders";

const statusLabels = {
  PAGO_EN_REVISION: "Pago en revisión",
  PEDIDO_CONFIRMADO: "Confirmado",
  EN_BODEGA: "En bodega",
  EMPACADO: "Empacado",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const nextStatus = {
  PEDIDO_CONFIRMADO: "EN_BODEGA",
  EN_BODEGA: "EMPACADO",
  EMPACADO: "DESPACHADO",
  DESPACHADO: "ENTREGADO",
};

export default function AdminOrderDetailPage() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAdminAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const [updateSuccess, setUpdateSuccess] = useState("");

    const [carrier, setCarrier] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
  if (!isAuthenticated || !orderId) {
    setLoading(false);
    setError("Debes iniciar sesión para consultar este pedido.");
    return;
  }

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [orders, products] = await Promise.all([
        apiRequest("/admin/orders"),
        apiRequest(`/admin/orders/${orderId}/items`),
      ]);

      const selected = orders.find(
        (item) => String(item.orderId) === String(orderId)
      );

      if (!selected) {
        throw new Error("No encontramos el pedido solicitado.");
      }

      setOrder(selected);
      setItems(products);
    } catch (err) {
      setError(
        err.message || "Ocurrió un error al consultar el pedido."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchOrderDetails();
}, [isAuthenticated, orderId]);

  const handleStatusUpdate = async () => {
  const newStatus = nextStatus[order.status];

  if (!newStatus) return;

  if (newStatus === "DESPACHADO") {
    if (!carrier.trim() || !trackingNumber.trim()) {
    setUpdateSuccess("");
    setUpdateError("Debes ingresar la transportadora y el número de guía.");
    return;
    }
  }

  setUpdating(true);
  setUpdateError("");
  setUpdateSuccess("");

  try {
    await apiRequest(`/admin/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim(),
      }),
    });

    setOrder((previousOrder) => ({
      ...previousOrder,
      status: newStatus,
      carrier: carrier.trim() || previousOrder.carrier,
      trackingNumber:
        trackingNumber.trim() || previousOrder.trackingNumber,
      dispatchedAt:
        newStatus === "DESPACHADO"
          ? new Date().toISOString()
          : previousOrder.dispatchedAt,
    }));

    setUpdateSuccess("El estado del pedido se actualizó correctamente.");
  } catch (error) {
    setUpdateError(error.message);
  } finally {
    setUpdating(false);
  }
};

  const productsTotal = items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );

  if (loading) {
    return (
      <main className="bn-order-detail-page">
        <p>Cargando información del pedido...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bn-order-detail-page">
        <p className="bn-order-detail-error">{error}</p>
        <Link to="/admin/orders">← Volver a pedidos</Link>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="bn-order-detail-page">

      <header className="bn-order-detail-header">
        <Link to="/admin/orders" className="bn-order-back">
          ← Volver a pedidos
        </Link>

        <p className="bn-order-eyebrow">
          BOOM NAILS · ADMINISTRACIÓN
        </p>

        <h1>Detalle del pedido</h1>
        <p>Consulta toda la información de esta compra.</p>
      </header>

      <section className="bn-order-hero">
        <div>
          <span>NÚMERO DE PEDIDO</span>
          <h2>{order.orderNumber}</h2>
          <p>Registrado el {formatDate(order.createdAt)}</p>
        </div>

        <span
          className={`bn-order-status bn-order-status--${order.status.toLowerCase()}`}
        >
          {statusLabels[order.status] || order.status}
        </span>
      </section>

      <section className="bn-order-info-grid">

            <article className="bn-order-info-card">
            <h3>Información del cliente</h3>
            <p><strong>{order.customerName}</strong></p>
            <p>{order.customerEmail}</p>
            <p>{order.customerPhone || "Sin teléfono"}</p>
            </article>

            <article className="bn-order-info-card">
            <h3>Dirección de entrega</h3>
            <p>{order.shippingAddress}</p>
            <p>
                {[order.shippingCity, order.shippingDepartment]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{order.shippingCountry}</p>
            </article>

            <article className="bn-order-info-card">
            <h3>Información del envío</h3>
            <p>Transportadora: {order.carrier || "Pendiente"}</p>
            <p>Guía: {order.trackingNumber || "Pendiente"}</p>
            <p>Despacho: {formatDate(order.dispatchedAt)}</p>
            </article>

        </section>
        <section className="bn-order-status-panel">
    <div className="bn-order-section-heading">
        <div>
        <h2>Actualizar pedido</h2>
        <p>Gestiona el avance y despacho de este pedido.</p>
        </div>
    </div>

    {nextStatus[order.status] ? (
        <>
        {nextStatus[order.status] === "DESPACHADO" && (
            <div className="bn-shipping-fields">
            <label>
                Transportadora
                <input
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="Ej. Servientrega"
                />
            </label>

            <label>
                Número de guía
                <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ingresa el número de guía"
                />
            </label>
            </div>
        )}

        <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={updating}
        >
            {updating
            ? "Actualizando..."
            : `Avanzar a: ${statusLabels[nextStatus[order.status]]}`}
        </button>
        </>
    ) : (
        <p>Este pedido no tiene más cambios de estado disponibles.</p>
    )}

    {updateError && <p className="bn-order-error">{updateError}</p>}
    {updateSuccess && <p className="bn-order-success">{updateSuccess}</p>}
    </section>

      <section className="bn-order-products-panel">
        
        <div className="bn-order-section-heading">
          <div>
            <h2>Productos del pedido</h2>
            <p>{items.length} referencias registradas</p>
          </div>
        </div>

        <div className="bn-order-products-table-wrap">
          <table className="bn-order-products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Presentación</th>
                <th>Precio unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.detailId}>
                  <td>
                    <strong>{item.productName}</strong>
                    <small>Ref. {item.reference}</small>
                  </td>
                  <td>{item.presentation}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan="5">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bn-order-total">
          <span>Total de productos</span>
          <strong>{formatCurrency(productsTotal)}</strong>
        </div>
      </section>

      <section className="bn-order-summary">
        <h2>Resumen de la compra</h2>

        <div>
          <span>Subtotal registrado</span>
          <strong>{formatCurrency(order.total)}</strong>
        </div>

        <div className="bn-order-summary-final">
          <span>Total del pedido</span>
          <strong>{formatCurrency(order.total)}</strong>
        </div>
      </section>

      <footer className="bn-order-detail-footer">
        BOOM NAILS · ADMINISTRACIÓN
      </footer>

    </main>
  );
}
