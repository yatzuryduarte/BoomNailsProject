
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminOrdersPage.css";
import AdminTopBar from "./components/ui/AdminTopBar";
import AdminSidebar from "./AdminSidebar";
import { useAdminStats } from "../../context/AdminStatsContext";
import { apiRequest } from "../../services/api";

const API_URL = "http://localhost:8080/api/admin/orders";

const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const statusLabels = {
  PAGO_EN_REVISION: "Pago en revisión",
  RECHAZADO: "Rechazado",
  PEDIDO_CONFIRMADO: "Confirmado",
  EN_BODEGA: "En bodega",
  EMPACADO: "Empacado",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export default function AdminOrdersPage() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const {
  orders,
  totalSales,
  totalOrders,
  pendingOrders,
  processingOrders,
  loading,
  error,
} = useAdminStats();

  
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.orderNumber?.toLowerCase().includes(normalizedSearch) ||
        order.customerName?.toLowerCase().includes(normalizedSearch) ||
        order.customerEmail?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "TODOS" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const selectedOrder = orders.find(
    (order) => order.orderId === selectedOrderId
  );

  useEffect(() => {
  if (!selectedOrderId) {
    setOrderItems([]);
    return;
  }

  const fetchOrderItems = async () => {
    try {
      setItemsLoading(true);
      setItemsError("");

      const data = await apiRequest(
        `/admin/orders/${selectedOrderId}/items`
      );

      setOrderItems(data);
    } catch (err) {
      setItemsError(err.message);
      setOrderItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  fetchOrderItems();
}, [selectedOrderId]);



  return (
    <main className="bn-orders-layout">
    {/* BARRA LATERAL */}
    <AdminSidebar />

    {/* CONTENIDO PRINCIPAL */}
    <div className="bn-orders-main">
      <AdminTopBar
        section="Pedidos"
        onLogout={logout}
      />

    <section className="bn-orders-page">
        <header className="bn-orders-heading">
          <div>
            <p className="bn-orders-eyebrow">
              BOOM NAILS · ADMINISTRACIÓN
            </p>
            <h1>Pedidos <span>♥</span></h1>
            <p>Gestiona y revisa todos los pedidos de tu tienda.</p>
          </div>

          <div className="bn-orders-heading__actions">
            <span className="bn-orders-live">
              <span /> Datos de pedidos
            </span>
          </div>
        </header>

        {error && (
          <div className="bn-orders-error" role="alert">
            {error}
          </div>
        )}

        {/* INDICADORES */}
        <section className="bn-orders-stats">
          <article className="bn-orders-stat bn-orders-stat--blue">
            <div className="bn-orders-stat__top">
              <span>Ventas registradas</span>
              <span className="bn-orders-stat__icon">$</span>
            </div>
            <strong>{formatCurrency(totalSales)}</strong>
            <small>Valor total de los pedidos</small>
          </article>

          <article className="bn-orders-stat bn-orders-stat--pink">
            <div className="bn-orders-stat__top">
              <span>Total de pedidos</span>
              <span className="bn-orders-stat__icon">▤</span>
            </div>
            <strong>{totalOrders}</strong>
            <small>Pedidos registrados</small>
          </article>

          <article className="bn-orders-stat bn-orders-stat--yellow">
            <div className="bn-orders-stat__top">
              <span>Pagos pendientes</span>
              <span className="bn-orders-stat__icon">◷</span>
            </div>
            <strong>{pendingOrders}</strong>
            <small>Esperando revisión</small>
          </article>

          <article className="bn-orders-stat bn-orders-stat--purple">
            <div className="bn-orders-stat__top">
              <span>En proceso</span>
              <span className="bn-orders-stat__icon">♧</span>
            </div>
            <strong>{processingOrders}</strong>
            <small>En bodega, empacados o despachados</small>
          </article>
        </section>

        {/* TABLA Y DETALLE */}
        <section className="bn-orders-workspace">
          <div className="bn-orders-list">
            <div className="bn-orders-list__heading">
              <div>
                <h2>Lista de pedidos</h2>
                <p>Consulta y selecciona un pedido para ver sus datos.</p>
              </div>

              <span className="bn-orders-records">
                {filteredOrders.length} registros
              </span>
            </div>

            <div className="bn-orders-filters">
              <label className="bn-orders-search">
                <span>⌕</span>
                <input
                  type="search"
                  placeholder="Buscar por cliente o número de pedido..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filtrar por estado"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PAGO_EN_REVISION">Pago en revisión</option>
                <option value="PEDIDO_CONFIRMADO">Confirmados</option>
                <option value="EN_BODEGA">En bodega</option>
                <option value="EMPACADO">Empacados</option>
                <option value="DESPACHADO">Despachados</option>
                <option value="ENTREGADO">Entregados</option>
                <option value="CANCELADO">Cancelados</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
            </div>

            <div className="bn-orders-table-wrap">
              <table className="bn-orders-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="bn-orders-table__empty">
                        Cargando pedidos...
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="bn-orders-table__empty">
                        No se encontraron pedidos.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.orderId}
                        className={
                          selectedOrderId === order.orderId
                            ? "bn-orders-table__row--selected"
                            : ""
                        }
                      >
                        <td>
                          <strong>{order.orderNumber}</strong>
                          <small>ID: {order.orderId}</small>
                        </td>

                        <td>
                          <strong>{order.customerName}</strong>
                          <small>{order.customerEmail}</small>
                        </td>

                        <td>{formatDate(order.createdAt)}</td>

                        <td>
                          <strong>{formatCurrency(order.total)}</strong>
                        </td>

                        <td>
                          <span
                            className={`bn-orders-status bn-orders-status--${order.status.toLowerCase()}`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="bn-orders-view"
                            type="button"
                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                            >
                            Ver detalle
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bn-orders-list__footer">
              <span>
                {totalOrders} pedidos válidos de {orders.length} registrados
              </span>
              <span>BOOM NAILS · ADMIN</span>
            </div>
          </div>

          
          
        </section>
      </section>
    </div>
    </main>
  );
}
