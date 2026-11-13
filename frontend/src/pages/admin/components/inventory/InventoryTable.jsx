import { formatCurrency } from "../../../../utils/formatters";

function InventoryTable({
  filteredInventory,
  inventory,
  loading,
  searchTerm,
  dispatch,
  imageBaseUrl,
}) {
  return (
    <section className="bn-payments-panel">
      <div className="bn-panel-heading">
        <div>
          <h2>Existencias de productos</h2>

          <p>
            Consulta el stock individual de cada presentación.
          </p>
        </div>

        <span className="bn-count-pill">
          {filteredInventory.length} registros
        </span>
      </div>

      <div className="bn-inventory-toolbar">
        <input
          type="search"
          placeholder="Buscar por ID, referencia, producto o categoría..."
          value={searchTerm}
          onChange={(event) =>
            dispatch({
              type: "SET_SEARCH_TERM",
              payload: event.target.value,
            })
          }
          aria-label="Buscar en el inventario"
        />
      </div>

      {loading ? (
        <div className="bn-empty-state">
          <span className="bn-spinner" />
          <p>Cargando inventario...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="bn-empty-state">
          <span className="bn-empty-icon">⌕</span>

          <h3>No se encontraron productos</h3>

          <p>
            {inventory.length === 0
              ? "No hay presentaciones registradas."
              : "Prueba con otro nombre, referencia o identificador."}
          </p>
        </div>
      ) : (
        <div className="bn-table-wrap">
          <table className="bn-payments-table bn-inventory-table bn-movements-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>ID</th>
                <th>Categoría</th>
                <th>Presentación</th>
                <th>Precio detal</th>
                <th>Precio mayorista</th>
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.map((item) => {
                const inactive =
                  !item.productActive ||
                  !item.presentationActive;

                const status = inactive
                  ? "Inactivo"
                  : item.stock === 0
                  ? "Agotado"
                  : item.stock <= item.minimumStock
                  ? "Stock bajo"
                  : "Disponible";

                const imageUrl = item.imageUrl
                  ? `${imageBaseUrl}${item.imageUrl}`
                  : null;

                return (
                  <tr key={item.presentationId}>
                    <td>
                      <div className="bn-inventory-product">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.productName}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="bn-inventory-image-placeholder">
                            ✦
                          </div>
                        )}

                        <div>
                          <strong>{item.productName}</strong>
                          <small>{item.reference}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <small>
                        Producto: {item.productId}
                        <br />
                        Presentación: {item.presentationId}
                      </small>
                    </td>

                    <td>
                      {item.categoryName || "Sin categoría"}
                    </td>

                    <td>
                      {item.presentationName}
                    </td>

                    <td>
                      {formatCurrency(item.retailPrice)}
                    </td>

                    <td>
                      {formatCurrency(item.wholesalePrice)}
                    </td>

                    <td>
                      <strong>{item.stock}</strong>
                      <small>
                        Mínimo: {item.minimumStock}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`bn-inventory-status ${
                          status === "Disponible"
                            ? "is-available"
                            : status === "Stock bajo"
                            ? "is-low"
                            : status === "Agotado"
                            ? "is-empty"
                            : "is-inactive"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bn-panel-footer">
        <span>
          El inventario se consulta directamente desde la base de datos.
        </span>

        <span>BOOM NAILS · ADMIN</span>
      </div>
    </section>
  );
}

export default InventoryTable;