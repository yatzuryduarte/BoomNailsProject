import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import "./AdminDashboardPage.css";
import AdminTopBar from "./components/ui/AdminTopBar";
import AdminSidebar from "./AdminSidebar";
import { useAdminStats } from "../../context/AdminStatsContext";
import { formatCurrency, formatWeekday } from "../../utils/formatters";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";


const statusLabels = {
  PAGO_EN_REVISION: "Pago en revisión",
  PEDIDO_CONFIRMADO: "Confirmado",
  EN_BODEGA: "En bodega",
  EMPACADO: "Empacado",
  DESPACHADO: "Despachado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
  RECHAZADO: "Rechazado",
};

function AdminDashboardPage() {
  const { token, isAuthenticated, logout } = useAdminAuth();

    const {
    orders,
    totalSales,
    totalOrders,
    totalCustomers,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    loading,
    error,
  } = useAdminStats();

  
  const [productsCount, setProductsCount] = useState(0);
  const [topProducts, setTopProducts] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);

  

  useEffect(() => {
  if (!isAuthenticated || !token) {
    setTopProducts([]);
    return;
  }

  const fetchTopProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/dashboard/top-selling-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No fue posible cargar los productos más vendidos.");
      }

      const data = await response.json();
      setTopProducts(data);
    } catch (err) {
      console.error("Error al consultar productos más vendidos:", err);
    }
  };

  fetchTopProducts();
}, [token, isAuthenticated]);
  

useEffect(() => {
  if (!isAuthenticated || !token) {
    setWeeklySales([]);
    return;
  }

  const fetchWeeklySales = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/api/admin/dashboard/weekly-sales",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No fue posible cargar las ventas semanales.");
      }

      const data = await response.json();
      setWeeklySales(data);
    } catch (err) {
      console.error("Error al consultar ventas semanales:", err);
    }
  };

  fetchWeeklySales();
}, [token, isAuthenticated]);


  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/productos");

      if (!response.ok) {
        throw new Error("No fue posible consultar los productos.");
      }

      const data = await response.json();
      setProductsCount(data.length);
    } catch (err) {
      console.error("Error al consultar productos:", err);
    }
  };

  fetchProducts();
}, []);




const chartData = useMemo(() => {
  const salesByDate = new Map(
    weeklySales.map((sale) => [
      sale.saleDate,
      Number(sale.totalSales),
    ])
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    return {
      date: dateKey,
      day: formatWeekday(date),
      sales: salesByDate.get(dateKey) || 0,
    };
  });
}, [weeklySales]);


  if (loading) {
    return <main className="bn-dashboard-page">Cargando Dashboard...</main>;
  }

  if (error) {
    return <main className="bn-dashboard-page">{error}</main>;
  }

  if (!isAuthenticated) {
    return (
      <main className="bn-dashboard-page">
        Debes iniciar sesión para consultar el Dashboard.
        <Link to="/admin/payments">Ir al inicio de sesión</Link>
      </main>
    );
  }

    return (
        <main className="bn-orders-layout">
    <AdminSidebar />

    <div className="bn-payments-content">
        <AdminTopBar
            section="Dashboard"
            onLogout={logout}
        />

        <section className="bn-dashboard-page">
      <header className="bn-dashboard-header">
        <p>BOOM NAILS · ADMINISTRACIÓN</p>
        <h1>Dashboard ♥</h1>
        <span>Resumen general de tu tienda.</span>
      </header>

      

<section className="bn-dashboard-stats bn-dashboard-stats--main">
  <article className="bn-stat-card bn-stat-card--sales">
    <div className="bn-stat-icon">
      <DollarSign size={23} />
    </div>
    <div className="bn-stat-info">
      <span>Ventas totales</span>
      <strong>{formatCurrency(totalSales)}</strong>
    </div>
  </article>

  <article className="bn-stat-card bn-stat-card--orders">
    <div className="bn-stat-icon">
      <ShoppingBag size={23} />
    </div>
    <div className="bn-stat-info">
      <span>Pedidos</span>
      <strong>{totalOrders}</strong>
    </div>
  </article>

  <article className="bn-stat-card bn-stat-card--customers">
    <div className="bn-stat-icon">
      <Users size={23} />
    </div>
    <div className="bn-stat-info">
      <span>Clientes</span>
      <strong>{totalCustomers}</strong>
    </div>
  </article>

  <article className="bn-stat-card bn-stat-card--products">
    <div className="bn-stat-icon">
      <Package size={23} />
    </div>
    <div className="bn-stat-info">
      <span>Productos</span>
      <strong>{productsCount}</strong>
    </div>
  </article>
</section>



      <div className="bn-dashboard-analytics">

  <section className="bn-dashboard-weekly-sales">
    <h2>Ventas por semana</h2>
    <p>Resumen de ventas de los últimos siete días.</p>

    
<div className="bn-dashboard-chart">
  <ResponsiveContainer width="100%" height={280}>
    <BarChart
      data={chartData}
      margin={{ top: 10, right: 10, left: 5, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" stroke="#e8eff8" />

      <XAxis
        dataKey="day"
        tick={{ fill: "#09265e", fontSize: 12 }}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tickFormatter={(value) =>
          `${Math.round(value / 1000)}k`
        }
        tick={{ fill: "#8295b5", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />

      <Tooltip
        formatter={(value) => [
        formatCurrency(value),
        "Ventas",
       ]}
      />

      <Bar
        dataKey="sales"
        fill="#08A7E5"
        radius={[6, 6, 0, 0]}
        maxBarSize={35}
      />
    </BarChart>
  </ResponsiveContainer>
</div>

  </section>

      <section className="bn-dashboard-top-products">
  <h2>Productos más vendidos</h2>
  <p>Ranking de productos según las unidades vendidas.</p>

  {topProducts.length === 0 ? (
    <p>Aún no hay ventas registradas.</p>
  ) : (
    <div className="bn-dashboard-top-products__list">
      {topProducts.map((product, index) => (
        <article key={product.productName}>
          <span className="bn-dashboard-top-products__position">
            {index + 1}
          </span>

          <div>
            <strong>{product.productName}</strong>
            <span>Producto más vendido</span>
          </div>

          <strong>{product.unitsSold} unidades</strong>
        </article>
      ))}
    </div>
  )}
</section>
</div>

      <section className="bn-dashboard-recent">
        <h2>Pedidos recientes</h2>

        {orders.length === 0 ? (
          <p>No hay pedidos registrados.</p>
        ) : (
          orders.slice(0, 5).map((order) => (
            <article key={order.orderId}>
              <div>
                <strong>{order.orderNumber}</strong>
                <span>{order.customerName}</span>
              </div>

              <strong>{formatCurrency(order.total)}</strong>

              <span>
                {statusLabels[order.status] || order.status}
              </span>

              <Link to={`/admin/orders/${order.orderId}`}>
                Ver detalle
              </Link>
            </article>
          ))
        )}
            </section>
    </section>
    </div>
  </main>
  );
}

export default AdminDashboardPage;
