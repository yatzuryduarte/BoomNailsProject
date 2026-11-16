import { useMemo, useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./components/ui/AdminTopBar";

import ProductStats from "./components/products/ProductStats";
import ProductTable from "./components/products/ProductTable";
import ProductFormModal from "./components/products/ProductFormModal";

import { useAdminAuth } from "../../context/AdminAuthContext";
import { apiRequest } from "../../services/api";
import { useProductsData } from "./hooks/useProductsData";

import "./components/ui/AdminCommon.css";
import "./AdminProductsPage.css";

export default function AdminProductsPage() {
  const { logout } = useAdminAuth();

  const {
    products,
    loading,
    error,
    loadProducts,
  } = useProductsData();

  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [statusLoadingId, setStatusLoadingId] = useState(null);
  const [statusError, setStatusError] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const reference = product.reference?.toLowerCase() || "";

      return (
        name.includes(normalizedSearch) ||
        reference.includes(normalizedSearch)
      );
    });
  }, [products, searchTerm]);

  const handleEdit = (product) => {
    setStatusError("");
    setEditingProduct(product);
  };

  const handleToggleStatus = async (product) => {
    const action = product.active ? "desactivar" : "activar";

    const confirmed = window.confirm(
      `¿Seguro que deseas ${action} el producto "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setStatusLoadingId(product.id);
      setStatusError("");

      await apiRequest(
        `/admin/productos/${product.id}/status?active=${!product.active}`,
        {
          method: "PATCH",
        }
      );

      await loadProducts();
    } catch (err) {
      setStatusError(
        err.message ||
          `No fue posible ${action} el producto.`
      );
    } finally {
      setStatusLoadingId(null);
    }
  };

  const handleProductSaved = async () => {
    await loadProducts();
    setEditingProduct(null);
    setShowCreateModal(false);
  };

  return (
    <main className="bn-admin bn-orders-layout">
      <AdminSidebar />

      <div className="bn-payments-content">
        <AdminTopBar
          section="Productos"
          onLogout={logout}
        />

        <section className="bn-products-page">
          <header className="bn-products-header">
            <div>
              <span className="bn-products-eyebrow">
                Gestión del catálogo
              </span>

              <h1>Productos</h1>

              <p>
                Administra productos, presentaciones,
                precios y estado del catálogo.
              </p>
            </div>

            <button
              type="button"
              className="bn-btn bn-btn-primary"
              onClick={() => {
                setEditingProduct(null);
                setShowCreateModal(true);
              }}
            >
              + Nuevo producto
            </button>
          </header>

          {error && (
            <div className="bn-products-error">
              {error}

              <button
                type="button"
                className="bn-btn bn-btn-secondary"
                onClick={loadProducts}
              >
                Reintentar
              </button>
            </div>
          )}

          {statusError && (
            <div className="bn-products-error">
              {statusError}
            </div>
          )}

          <ProductStats products={products} />

          <section className="bn-products-card">
            <div className="bn-products-toolbar">
              <div>
                <h2>Catálogo</h2>

                <span>
                  {filteredProducts.length} productos
                </span>
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Buscar por nombre o referencia..."
                className="bn-input"
              />
            </div>

            <ProductTable
              products={filteredProducts}
              loading={loading}
              searchTerm={searchTerm}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              statusLoadingId={statusLoadingId}
            />
          </section>

          <ProductFormModal
            open={showCreateModal || Boolean(editingProduct)}
            product={editingProduct}
            onClose={() => {
              setShowCreateModal(false);
              setEditingProduct(null);
            }}
            onSaved={handleProductSaved}
          />
        </section>
      </div>
    </main>
  );
}