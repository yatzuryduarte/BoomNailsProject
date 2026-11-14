import { formatDate } from "../../../../utils/formatters";

function InventoryMovements({
  filteredMovements,
  movements,
  loadingMovements,
  movementSearch,
  movementType,
  dispatch,
}) {
  return (
    <section className="bn-payments-panel">
      <div className="bn-panel-heading">
        <div>
          <h2>Historial de movimientos</h2>
          <p>Consulta las entradas y salidas registradas en el inventario.</p>
        </div>

        <span className="bn-count-pill">
          {filteredMovements.length} registros
        </span>
      </div>

      <div className="bn-movements-toolbar">
        <input
          type="search"
          placeholder="Buscar producto, usuario, motivo o referencia..."
          value={movementSearch}
          onChange={(event) =>
            dispatch({
              type: "SET_MOVEMENT_SEARCH",
              payload: event.target.value,
            })
          }
          aria-label="Buscar movimientos"
        />

        <select
          value={movementType}
          onChange={(event) =>
            dispatch({
              type: "SET_MOVEMENT_TYPE",
              payload: event.target.value,
            })
          }
          aria-label="Filtrar movimientos por tipo"
        >
          <option value="TODOS">Todos los movimientos</option>
          <option value="ENTRADA">Entradas</option>
          <option value="SALIDA">Salidas</option>
        </select>
      </div>

      {loadingMovements ? (
        <div className="bn-empty-state">
          <span className="bn-spinner" />
          <p>Cargando movimientos...</p>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="bn-empty-state">
          <span className="bn-empty-icon">⌕</span>

          <h3>No se encontraron movimientos</h3>

          <p>
            {movements.length === 0
              ? "Todavía no hay movimientos registrados."
              : "Prueba con otro término de búsqueda o filtro."}
          </p>
        </div>
      ) : (
        <div className="bn-table-wrap">
          <table className="bn-payments-table bn-movements-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Movimiento</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Referencia</th>
              </tr>
            </thead>

            <tbody>
              {filteredMovements.map((movement) => (
                <tr
                  key={
                    movement.movimientoId ??
                    `${movement.idPresentacion}-${movement.fechaMovimiento}`
                  }
                >
                  <td>
                    <div className="bn-movement-product">
                      <strong>{movement.producto}</strong>

                      <small>
                        ID: {movement.idPresentacion}
                      </small>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`bn-movement-type ${
                        movement.tipoMovimiento === "ENTRADA"
                          ? "is-entry"
                          : "is-exit"
                      }`}
                    >
                      {movement.tipoMovimiento}
                    </span>
                  </td>

                  <td>
                    <strong>{movement.cantidad}</strong>
                  </td>

                  <td>{movement.motivo || "—"}</td>

                  <td>{movement.usuario || "—"}</td>

                  <td>{formatDate(movement.fechaMovimiento)}</td>

                  <td>
                    {movement.documentoReferencia || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="bn-panel-footer">
        <span>
          El historial muestra los movimientos registrados en el sistema.
        </span>

        <span>BOOM NAILS · ADMIN</span>
      </div>
    </section>
  );
}

export default InventoryMovements;