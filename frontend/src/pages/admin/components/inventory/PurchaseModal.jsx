import { formatCurrency } from "../../../../utils/formatters";

function PurchaseModal({
  showPurchaseModal,
  dispatch,
  purchaseError,
  purchaseForm,
  suppliers,
  inventory,
  handleRegisterPurchase,
  handlePurchaseFieldChange,
  addPurchaseLine,
  removePurchaseLine,
  handlePurchaseLineChange,
  savingPurchase,
}) {
  if (!showPurchaseModal) {
    return null;
  }

  return (
    <div className="bn-modal-overlay">
      <div className="bn-modal bn-purchase-modal">
        <div className="bn-modal-header">
          <div>
            <p className="bn-eyebrow">INVENTARIO</p>
            <h2>Registrar entrada</h2>
            <p>Registra una compra y actualiza las existencias.</p>
          </div>

          <button
            type="button"
            className="bn-modal-close"
            onClick={() =>
              dispatch({
                type: "CLOSE_PURCHASE_MODAL",
              })
            }
          >
            ×
          </button>
        </div>

        <form onSubmit={handleRegisterPurchase}>
          {purchaseError && (
            <div className="bn-error-banner" role="alert">
              {purchaseError}
            </div>
          )}

          <div className="bn-purchase-form-grid">
            <label>
              Proveedor *
              <select
                name="supplierId"
                value={purchaseForm.supplierId}
                onChange={handlePurchaseFieldChange}
                required
              >
                <option value="">Seleccionar proveedor</option>

                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Número de factura
              <input
                type="text"
                name="invoiceNumber"
                value={purchaseForm.invoiceNumber}
                onChange={handlePurchaseFieldChange}
                placeholder="Ej. FAC-001"
              />
            </label>

            <label>
              Fecha de compra *
              <input
                type="datetime-local"
                name="purchaseDate"
                value={purchaseForm.purchaseDate}
                onChange={handlePurchaseFieldChange}
                required
              />
            </label>

            <label>
              Observaciones
              <input
                type="text"
                name="notes"
                value={purchaseForm.notes}
                onChange={handlePurchaseFieldChange}
                placeholder="Observaciones de la compra"
              />
            </label>
          </div>

          <div className="bn-purchase-lines-heading">
            <div>
              <h3>Productos de la compra</h3>
              <p>Agrega las presentaciones y cantidades recibidas.</p>
            </div>

            <button
              type="button"
              className="bn-add-line-button"
              onClick={addPurchaseLine}
            >
              + Agregar producto
            </button>
          </div>

          {purchaseForm.lines.map((line, index) => (
            <div className="bn-purchase-line" key={index}>
              <div className="bn-purchase-line-title">
                <strong>Producto {index + 1}</strong>

                {purchaseForm.lines.length > 1 && (
                  <button
                    type="button"
                    className="bn-remove-line-button"
                    onClick={() => removePurchaseLine(index)}
                  >
                    Eliminar
                  </button>
                )}
              </div>

              <label>
                Presentación *
                <select
                  value={line.presentationId}
                  onChange={(event) =>
                    handlePurchaseLineChange(
                      index,
                      "presentationId",
                      event.target.value
                    )
                  }
                  required
                >
                  <option value="">Seleccionar presentación</option>

                  {inventory
                    .filter(
                      (item) =>
                        item.productActive && item.presentationActive
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

              <div className="bn-purchase-line-fields">
                <label>
                  Cantidad *
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(event) =>
                      handlePurchaseLineChange(
                        index,
                        "quantity",
                        event.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Costo unitario *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={line.unitCost}
                    onChange={(event) =>
                      handlePurchaseLineChange(
                        index,
                        "unitCost",
                        event.target.value
                      )
                    }
                    placeholder="Ej. 3900"
                    required
                  />
                </label>

                <label>
                  Observaciones
                  <input
                    type="text"
                    value={line.notes}
                    onChange={(event) =>
                      handlePurchaseLineChange(
                        index,
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Opcional"
                  />
                </label>
              </div>
            </div>
          ))}

          <div className="bn-purchase-total">
            <span>Total estimado de la compra</span>

            <strong>
              {formatCurrency(
                purchaseForm.lines.reduce(
                  (total, line) =>
                    total +
                    Number(line.quantity || 0) *
                      Number(line.unitCost || 0),
                  0
                )
              )}
            </strong>
          </div>

          <div className="bn-modal-actions">
            <button
              type="button"
              className="bn-modal-cancel"
              onClick={() =>
                dispatch({
                  type: "CLOSE_PURCHASE_MODAL",
                })
              }
              disabled={savingPurchase}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bn-modal-submit"
              disabled={savingPurchase}
            >
              {savingPurchase ? "Registrando..." : "Registrar compra"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PurchaseModal;