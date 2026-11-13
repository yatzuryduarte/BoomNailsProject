function ExitModal({
  showExitModal,
  dispatch,
  exitError,
  exitForm,
  inventory,
  handleRegisterExit,
  handleExitFieldChange,
  savingExit,
}) {
  if (!showExitModal) {
    return null;
  }

  const selectedItem = inventory.find(
    (item) => item.presentationId === Number(exitForm.presentationId)
  );

  return (
    <div className="bn-modal-overlay">
      <div className="bn-modal bn-purchase-modal">
        <div className="bn-modal-header">
          <div>
            <p className="bn-eyebrow">INVENTARIO</p>
            <h2>Registrar salida</h2>
            <p>Registra el retiro de productos del inventario.</p>
          </div>

          <button
            type="button"
            className="bn-modal-close"
            onClick={() =>
              dispatch({
                type: "CLOSE_EXIT_MODAL",
              })
            }
          >
            ×
          </button>
        </div>

        <form onSubmit={handleRegisterExit}>
          {exitError && (
            <div className="bn-error-banner" role="alert">
              {exitError}
            </div>
          )}

          <div className="bn-purchase-form-grid">
            <label>
              Producto / Presentación *
              <select
                name="presentationId"
                value={exitForm.presentationId}
                onChange={handleExitFieldChange}
                required
              >
                <option value="">Seleccionar presentación</option>

                {inventory
                  .filter(
                    (item) =>
                      item.productActive &&
                      item.presentationActive &&
                      item.stock > 0
                  )
                  .map((item) => (
                    <option
                      key={item.presentationId}
                      value={item.presentationId}
                    >
                      {item.productName} - {item.presentationName}
                      {item.size ? ` - ${item.size}` : ""}
                      {" | Stock: "}
                      {item.stock}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Cantidad a retirar *
              <input
                type="number"
                name="quantity"
                min="1"
                max={selectedItem?.stock || 1}
                step="1"
                value={exitForm.quantity}
                onChange={handleExitFieldChange}
                required
              />
            </label>

            <label>
              Motivo de salida *
              <select
                name="reason"
                value={exitForm.reason}
                onChange={handleExitFieldChange}
                required
              >
                <option value="">Seleccionar motivo</option>
                <option value="VENTA_MANUAL">Venta manual</option>
                <option value="PRODUCTO_DANADO">
                  Producto dañado
                </option>
                <option value="PERDIDA">Pérdida</option>
                <option value="USO_INTERNO">Uso interno</option>
                <option value="DEVOLUCION_A_PROVEEDOR">
                  Devolución a proveedor
                </option>
                <option value="OTRO">Otro</option>
              </select>
            </label>

            <label>
              Documento de referencia
              <input
                type="text"
                name="reference"
                value={exitForm.reference}
                onChange={handleExitFieldChange}
                placeholder="Ej. VENTA-001"
              />
            </label>
          </div>

          {exitForm.presentationId && (
            <div className="bn-purchase-total">
              <span>Stock disponible</span>

              <strong>
                {selectedItem?.stock ?? 0} unidades
              </strong>
            </div>
          )}

          <label>
            Observaciones
            <input
              type="text"
              name="notes"
              value={exitForm.notes}
              onChange={handleExitFieldChange}
              placeholder="Detalles adicionales de la salida"
            />
          </label>

          <div className="bn-modal-actions">
            <button
              type="button"
              className="bn-modal-cancel"
              onClick={() =>
                dispatch({
                  type: "CLOSE_EXIT_MODAL",
                })
              }
              disabled={savingExit}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bn-modal-submit"
              disabled={savingExit}
            >
              {savingExit ? "Registrando..." : "Registrar salida"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExitModal;