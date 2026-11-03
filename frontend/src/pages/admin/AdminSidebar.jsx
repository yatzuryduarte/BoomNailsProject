
import { Link, useLocation } from "react-router-dom";
import "./AdminOrdersPage.css";

function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/admin", icon: "▦", exact: true },
    { label: "Pedidos", path: "/admin/orders", icon: "▤" },
    { label: "Productos", path: "/admin/products", icon: "◈" },
    { label: "Categorías", path: "/admin/categories", icon: "▣" },
    { label: "Inventario", path: "/admin/inventory", icon: "▤" },
    { label: "Proveedores", path: "/admin/suppliers", icon: "▣" },
    { label: "Clientes", path: "/admin/customers", icon: "♙" },
    { label: "Ventas manuales", path: "/admin/manual-sales", icon: "▧" },
    { label: "Pagos", path: "/admin/payments", icon: "▧" },
    { label: "Usuarios", path: "/admin/users", icon: "♙" },
    { label: "Configuración", path: "/admin/settings", icon: "⚙" },
  ];

  return (
    <aside className="bn-orders-sidebar">
      <Link to="/admin" className="bn-orders-brand">
        <span className="bn-orders-brand__logo">BOOM</span>
        <small>NAILS</small>
      </Link>

      <p className="bn-orders-sidebar__label">
        MENÚ PRINCIPAL
      </p>

      <nav className="bn-orders-nav">
        {menuItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bn-orders-nav__item ${
                active ? "bn-orders-nav__item--active" : ""
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="bn-orders-sidebar__footer">
        <span className="bn-orders-online-dot" />
        <div>
          <strong>Administración</strong>
          <small>Sesión activa</small>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
