import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAdminAuth } from "./AdminAuthContext";
import { apiRequest } from "../services/api";

const AdminStatsContext = createContext(null);

// ======================================================
// ESTADOS QUE REPRESENTAN UNA VENTA REAL
// ======================================================

export const VALID_SALE_STATUSES = [
  "PEDIDO_CONFIRMADO",
  "EN_BODEGA",
  "EMPACADO",
  "DESPACHADO",
  "ENTREGADO",
];

// ======================================================
// PROVIDER
// ======================================================

export function AdminStatsProvider({ children }) {
  const { token, isAuthenticated } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // CARGAR PEDIDOS
  // ======================================================

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiRequest("/admin/orders");

        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);

        setError(
          err.message ||
            "Ocurrió un error al cargar las estadísticas."
        );

        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, token]);

  // ======================================================
  // PEDIDOS QUE CUENTAN COMO VENTAS
  // ======================================================

  const validOrders = useMemo(() => {
    return orders.filter((order) =>
      VALID_SALE_STATUSES.includes(order.status)
    );
  }, [orders]);

  // ======================================================
  // VENTAS TOTALES
  // ======================================================

  const totalSales = useMemo(() => {
    return validOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
  }, [validOrders]);

  // ======================================================
  // TOTAL DE PEDIDOS VÁLIDOS
  // ======================================================

  const totalOrders = useMemo(() => {
    return validOrders.length;
  }, [validOrders]);

  // ======================================================
  // PAGOS PENDIENTES
  // ======================================================

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "PAGO_EN_REVISION"
    ).length;
  }, [orders]);

  // ======================================================
  // PEDIDOS EN PROCESO
  // ======================================================

  const processingOrders = useMemo(() => {
    return orders.filter((order) =>
      [
        "EN_BODEGA",
        "EMPACADO",
        "DESPACHADO",
      ].includes(order.status)
    ).length;
  }, [orders]);

  // ======================================================
  // PEDIDOS CONFIRMADOS
  // ======================================================

  const confirmedOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "PEDIDO_CONFIRMADO"
    ).length;
  }, [orders]);

  // ======================================================
  // PEDIDOS ENTREGADOS
  // ======================================================

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "ENTREGADO"
    ).length;
  }, [orders]);

  // ======================================================
  // CLIENTES CON VENTAS VÁLIDAS
  // ======================================================

  const totalCustomers = useMemo(() => {
    return new Set(
      validOrders
        .map((order) =>
          order.customerEmail?.trim().toLowerCase()
        )
        .filter(Boolean)
    ).size;
  }, [validOrders]);

  // ======================================================
  // VALOR TOTAL DE PEDIDOS REGISTRADOS
  // ======================================================

  const totalRegisteredOrderValue = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );
  }, [orders]);

  // ======================================================
  // CONTEXTO
  // ======================================================

  const value = useMemo(
    () => ({
      orders,
      validOrders,

      totalSales,
      totalOrders,

      pendingOrders,
      processingOrders,
      confirmedOrders,
      deliveredOrders,

      totalCustomers,

      totalRegisteredOrderValue,

      loading,
      error,

      validSaleStatuses: VALID_SALE_STATUSES,
    }),
    [
      orders,
      validOrders,
      totalSales,
      totalOrders,
      pendingOrders,
      processingOrders,
      confirmedOrders,
      deliveredOrders,
      totalCustomers,
      totalRegisteredOrderValue,
      loading,
      error,
    ]
  );

  return (
    <AdminStatsContext.Provider value={value}>
      {children}
    </AdminStatsContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useAdminStats() {
  const context = useContext(AdminStatsContext);

  if (!context) {
    throw new Error(
      "useAdminStats debe utilizarse dentro de AdminStatsProvider."
    );
  }

  return context;
}