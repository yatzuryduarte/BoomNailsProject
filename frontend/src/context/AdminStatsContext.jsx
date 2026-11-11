import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAdminAuth } from "./AdminAuthContext";

const AdminStatsContext = createContext(null);

const API_URL = "http://localhost:8080/api/admin/orders";

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

export function AdminStatsProvider({ children }) {
  const { credentials } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // CARGAR PEDIDOS
  // ======================================================

  useEffect(() => {
    if (!credentials) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Basic ${btoa(
              `${credentials.email}:${credentials.password}`
            )}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Credenciales incorrectas o acceso no autorizado."
          );
        }

        if (!response.ok) {
          throw new Error("No fue posible cargar los pedidos.");
        }

        const data = await response.json();

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
  }, [credentials]);

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
  // Este valor es opcional.
  // Incluye también rechazados/cancelados.
  // Útil si algún día quieres mostrar "valor histórico
  // de todos los pedidos".

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