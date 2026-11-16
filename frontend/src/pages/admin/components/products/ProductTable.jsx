import { formatCurrency } from "../../../../utils/formatters";

export default function ProductTable({
  products,
  loading,
  searchTerm,
  onEdit,
  onToggleStatus,
  statusLoadingId,
}) {
  if (loading) {
    return (
      <div className="bn-products-message">
        Cargando productos...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bn-products-message">
        {searchTerm
          ? "No se encontraron productos con esa búsqueda."
          : "No hay productos registrados."}
      </div>
    );
  }

  return (
    <div className="bn-products-table-wrapper">
      <table className="bn-products-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Referencia</th>
            <th>Categoría</th>
            <th>Presentaciones</th>
            <th>Precio desde</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const presentations = product.presentations || [];

            const lowestPrice = presentations.reduce(
              (lowest, presentation) => {
                if (presentation.retailPrice == null) {
                  return lowest;
                }

                return lowest === null ||
                  presentation.retailPrice < lowest
                  ? presentation.retailPrice
                  : lowest;
              },
              null
            );

            const totalStock = presentations.reduce(
              (total, presentation) =>
                total + (presentation.stock || 0),
              0
            );

            return (
              <tr key={product.id}>
                <td>
                  <div className="bn-product-name-cell">
                    <strong>{product.name}</strong>

                    {product.description && (
                      <span>{product.description}</span>
                    )}
                  </div>
                </td>

                <td>{product.reference}</td>

                <td>
                  {product.categoryId || "—"}
                </td>

                <td>
                  <div className="bn-product-presentations">
                    {presentations.map((presentation) => (
                      <span
                        key={presentation.id}
                        className="bn-product-presentation"
                      >
                        {presentation.size ||
                          presentation.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td>
                  {lowestPrice !== null
                    ? formatCurrency(lowestPrice)
                    : "—"}
                </td>

                <td>{totalStock}</td>

                <td>
                    <span
                        className={`bn-product-status ${
                            product.active
                            ? "is-active"
                            : "is-inactive"
                        }`}
                    >
                        <span className="bn-product-status-dot" />
                        {product.active ? "Activo" : "Inactivo"}
                    </span>
                </td>

                <td>
                    <div className="bn-product-actions">
                        <button
                        type="button"
                        className="bn-btn bn-btn-secondary"
                        onClick={() => onEdit(product)}
                        >
                        Editar
                        </button>

                        <button
                        type="button"
                        className={`bn-btn ${
                            product.active
                            ? "bn-btn-danger"
                            : "bn-btn-success"
                        }`}
                        onClick={() => onToggleStatus(product)}
                        disabled={statusLoadingId === product.id}
                        >
                        {statusLoadingId === product.id
                            ? "Guardando..."
                            : product.active
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                    </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}