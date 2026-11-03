
import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminAccessDenied from "./AdminAccessDenied";
import "./AdminPaymentsPage.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const money = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

function AdminInventoryPage() {
  const { credentials, logout } = useAdminAuth();

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Historial de movimientos de inventario
    const [movements, setMovements] = useState([]);
    const [loadingMovements, setLoadingMovements] = useState(false);
    const [movementError, setMovementError] = useState("");
    const [movementType, setMovementType] = useState("TODOS");
    const [movementSearch, setMovementSearch] = useState("");

  // Registro de compras y entradas de inventario
    const [suppliers, setSuppliers] = useState([]);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [savingPurchase, setSavingPurchase] = useState(false);
    const [purchaseMessage, setPurchaseMessage] = useState("");
    const [purchaseError, setPurchaseError] = useState("");

    const [purchaseForm, setPurchaseForm] = useState({
    supplierId: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().slice(0, 16),
    notes: "",
    lines: [
        {
        presentationId: "",
        quantity: 1,
        unitCost: "",
        notes: "",
        },
    ],
    });

    // Registro de salidas de inventario
    const [showExitModal, setShowExitModal] = useState(false);
    const [savingExit, setSavingExit] = useState(false);
    const [exitMessage, setExitMessage] = useState("");
    const [exitError, setExitError] = useState("");

    const [exitForm, setExitForm] = useState({
    presentationId: "",
    quantity: 1,
    reason: "",
    reference: "",
    notes: "",
    });

  const loadInventory = async () => {
    if (!credentials) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/admin/inventory`, {
        headers: {
          Authorization: `Basic ${btoa(
            `${credentials.email}:${credentials.password}`
          )}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Tu sesión no está autorizada. Ingresa nuevamente.");
      }

      if (!response.ok) {
        throw new Error("No fue posible consultar el inventario.");
      }

      const data = await response.json();
      setInventory(data);
    } catch (err) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    if (!credentials) return;

    try {
        const response = await fetch(`${API_URL}/admin/suppliers`, {
        headers: {
            Authorization: `Basic ${btoa(
            `${credentials.email}:${credentials.password}`
            )}`,
        },
        });

        if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Tu sesión no está autorizada.");
        }

        if (!response.ok) {
        throw new Error("No fue posible consultar los proveedores.");
        }

        const data = await response.json();
        setSuppliers(data);
    } catch (err) {
        setPurchaseError(err.message || "Error al cargar proveedores.");
    }
    };

    const loadMovements = async () => {
        if (!credentials) return;

        setLoadingMovements(true);
        setMovementError("");

        try {
            const response = await fetch(
            `${API_URL}/admin/inventory/movements`,
            {
                headers: {
                Authorization: `Basic ${btoa(
                    `${credentials.email}:${credentials.password}`
                )}`,
                },
            }
            );

            if (response.status === 401 || response.status === 403) {
            logout();
            throw new Error("Tu sesión no está autorizada.");
            }

            if (!response.ok) {
            throw new Error("No fue posible consultar el historial.");
            }

            const data = await response.json();
            setMovements(data);
        } catch (err) {
            setMovementError(
            err.message || "Error al cargar los movimientos."
            );
        } finally {
            setLoadingMovements(false);
        }
        };

    useEffect(() => {
    if (credentials) {
        loadInventory();
        loadSuppliers();
        loadMovements();
    }
    // La carga inicial se realiza al entrar al módulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  const filteredInventory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return inventory;

    return inventory.filter((item) =>
      [
        item.productId,
        item.presentationId,
        item.reference,
        item.productName,
        item.categoryName,
        item.presentationName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [inventory, searchTerm]);

  const filteredMovements = useMemo(() => {
    const term = movementSearch.trim().toLowerCase();

        return movements.filter((movement) => {
            const matchesType =
            movementType === "TODOS" ||
            movement.tipoMovimiento === movementType;

            const matchesSearch =
            !term ||
            [
                movement.producto,
                movement.presentacion,
                movement.motivo,
                movement.usuario,
                movement.documentoReferencia,
            ]
                .filter(Boolean)
                .some((value) =>
                String(value).toLowerCase().includes(term)
                );

            return matchesType && matchesSearch;
        });
        }, [movements, movementType, movementSearch]);

    const totalPresentations = inventory.length;

    const lowStock = inventory.filter(
        (item) => item.stock > 0 && item.stock <= item.minimumStock
    ).length;

    const outOfStock = inventory.filter(
        (item) => item.stock === 0
    ).length;

    const activePresentations = inventory.filter(
        (item) => item.productActive && item.presentationActive
    ).length;

    const imageBaseUrl = API_URL.replace(/\/api\/?$/, "");

    const handlePurchaseFieldChange = (event) => {
    const { name, value } = event.target;

        setPurchaseForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePurchaseLineChange = (index, field, value) => {
    setPurchaseForm((prev) => ({
        ...prev,
        lines: prev.lines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
        ),
    }));
    };

    const addPurchaseLine = () => {
    setPurchaseForm((prev) => ({
        ...prev,
        lines: [
        ...prev.lines,
        {
            presentationId: "",
            quantity: 1,
            unitCost: "",
            notes: "",
        },
        ],
    }));
    };

    const removePurchaseLine = (index) => {
    setPurchaseForm((prev) => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index),
    }));
    };

    const handleExitFieldChange = (event) => {
  const { name, value } = event.target;

  setExitForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

    const resetExitForm = () => {
    setExitForm({
        presentationId: "",
        quantity: 1,
        reason: "",
        reference: "",
        notes: "",
    });

    setExitError("");
    setExitMessage("");
    };

    const handleRegisterPurchase = async (event) => {
        event.preventDefault();

        setPurchaseError("");
        setPurchaseMessage("");

        if (!purchaseForm.supplierId) {
            setPurchaseError("Selecciona un proveedor.");
            return;
        }

        if (purchaseForm.lines.length === 0) {
            setPurchaseError("Agrega al menos un producto.");
            return;
        }

        const invalidLine = purchaseForm.lines.some(
            (line) =>
            !line.presentationId ||
            Number(line.quantity) <= 0 ||
            line.unitCost === "" ||
            Number(line.unitCost) < 0
        );

        if (invalidLine) {
            setPurchaseError(
            "Verifica que cada producto tenga presentación, cantidad y costo válidos."
            );
            return;
        }

        setSavingPurchase(true);

        try {
            const response = await fetch(`${API_URL}/admin/inventory/purchases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${btoa(
                `${credentials.email}:${credentials.password}`
                )}`,
            },
            body: JSON.stringify({
                supplierId: Number(purchaseForm.supplierId),
                invoiceNumber: purchaseForm.invoiceNumber,
                purchaseDate: `${purchaseForm.purchaseDate}:00`,
                notes: purchaseForm.notes,
                lines: purchaseForm.lines.map((line) => ({
                presentationId: Number(line.presentationId),
                quantity: Number(line.quantity),
                unitCost: Number(line.unitCost),
                notes: line.notes,
                })),
            }),
            });

            const data = await response.json();

            if (response.status === 401 || response.status === 403) {
            logout();
            throw new Error("Tu sesión no está autorizada. Ingresa nuevamente.");
            }

            if (!response.ok) {
            throw new Error(data.message || data.error || "No se pudo registrar la compra.");
            }

            setPurchaseMessage(
            `Compra registrada correctamente. Número de compra: ${data.idCompra}`
            );

            setShowPurchaseModal(false);

            setPurchaseForm({
            supplierId: "",
            invoiceNumber: "",
            purchaseDate: new Date().toISOString().slice(0, 16),
            notes: "",
            lines: [
                {
                presentationId: "",
                quantity: 1,
                unitCost: "",
                notes: "",
                },
            ],
            });

            await loadInventory();
        } catch (err) {
            setPurchaseError(err.message || "Error al registrar la compra.");
        } finally {
            setSavingPurchase(false);
        }
        };

        const handleRegisterExit = async (event) => {
            event.preventDefault();

            setExitError("");
            setExitMessage("");

            if (!exitForm.presentationId) {
                setExitError("Selecciona una presentación.");
                return;
            }

            if (
                !Number.isInteger(Number(exitForm.quantity)) ||
                Number(exitForm.quantity) <= 0
            ) {
                setExitError("La cantidad debe ser un número entero mayor que cero.");
                return;
            }

            if (!exitForm.reason) {
                setExitError("Selecciona el motivo de la salida.");
                return;
            }

            const selectedItem = inventory.find(
                (item) =>
                item.presentationId === Number(exitForm.presentationId)
            );

            if (!selectedItem) {
                setExitError("No se encontró la presentación seleccionada.");
                return;
            }

            if (Number(exitForm.quantity) > selectedItem.stock) {
                setExitError(
                `Stock insuficiente. Disponibles: ${selectedItem.stock} unidades.`
                );
                return;
            }

            setSavingExit(true);

            try {
                const response = await fetch(`${API_URL}/admin/inventory/exits`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${btoa(
                    `${credentials.email}:${credentials.password}`
                    )}`,
                },
                body: JSON.stringify({
                    presentationId: Number(exitForm.presentationId),
                    quantity: Number(exitForm.quantity),
                    reason: exitForm.reason,
                    reference: exitForm.reference,
                    notes: exitForm.notes,
                }),
                });

                const data = await response.json();

                if (response.status === 401 || response.status === 403) {
                logout();
                throw new Error("Tu sesión no está autorizada.");
                }

                if (!response.ok) {
                throw new Error(
                    data.message || data.error || "No se pudo registrar la salida."
                );
                }

                setExitMessage(
                `Salida registrada correctamente. Movimiento: ${data.idMovimiento}`
                );

                setShowExitModal(false);
                resetExitForm();

                await loadInventory();
            } catch (err) {
                setExitError(err.message || "Error al registrar la salida.");
            } finally {
                setSavingExit(false);
            }
            };

  if (!credentials) {
    return <AdminAccessDenied />;
  }

  return (
    <main className="bn-orders-layout">
      <AdminSidebar />

      <div className="bn-payments-content">
        <div className="bn-payments-topbar">
          <div>
            <strong>BOOM NAILS</strong>
            <small>Administración · Inventario</small>
          </div>

          <button className="bn-logout" onClick={logout}>
            Salir
          </button>
        </div>

        <section className="bn-dashboard">
          <div className="bn-page-heading">
            <div>
              <p className="bn-eyebrow">CENTRO DE CONTROL</p>
              <h1>Gestión de inventario.</h1>
              <p className="bn-muted">
                Consulta las existencias y controla el inventario
                de todas las presentaciones de Boom Nails.
              </p>
            </div>

            <div className="bn-inventory-actions">
                <button
                    className="bn-refresh-button"
                    onClick={() => {
                        setPurchaseError("");
                        setPurchaseMessage("");
                        setShowPurchaseModal(true);
                    }}
                    >
                    + Registrar entrada
                    </button>

                    <button
                    className="bn-refresh-button"
                    onClick={() => {
                        resetExitForm();
                        setShowExitModal(true);
                    }}
                    >
                    − Registrar salida
                </button>

                <button
                    className="bn-refresh-button"
                    onClick={loadInventory}
                    disabled={loading}
                >
                    ↻ <span>Actualizar</span>
                </button>
            </div>
          </div>

          {error && (
            <div className="bn-error-banner" role="alert">
              {error}
            </div>
          )}

          <div className="bn-stat-grid">
            <article className="bn-stat-card bn-stat-featured">
              <div className="bn-stat-top">
                <span>Presentaciones registradas</span>
                <span className="bn-stat-icon">▦</span>
              </div>
              <strong>{totalPresentations}</strong>
              <small>Variantes de productos</small>
            </article>

            <article className="bn-stat-card">
              <div className="bn-stat-top">
                <span>Stock bajo</span>
                <span className="bn-stat-icon">!</span>
              </div>
              <strong>{lowStock}</strong>
              <small>Presentaciones por reponer</small>
            </article>

            <article className="bn-stat-card">
              <div className="bn-stat-top">
                <span>Sin existencias</span>
                <span className="bn-stat-icon">×</span>
              </div>
              <strong>{outOfStock}</strong>
              <small>Presentaciones agotadas</small>
            </article>

            <article className="bn-stat-card">
              <div className="bn-stat-top">
                <span>Presentaciones activas</span>
                <span className="bn-stat-icon">✓</span>
              </div>
              <strong>{activePresentations}</strong>
              <small>Productos y presentaciones activos</small>
            </article>
          </div>

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
                onChange={(event) => setSearchTerm(event.target.value)}
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
                <table className="bn-payments-table bn-inventory-table">
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
                        !item.productActive || !item.presentationActive;

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
                                    event.currentTarget.style.display = "none";
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

                          <td>{item.categoryName || "Sin categoría"}</td>

                          <td>
                            {item.presentationName}
                            {item.size && <small>{item.size}</small>}
                          </td>

                          <td>{money(item.retailPrice)}</td>

                          <td>{money(item.wholesalePrice)}</td>

                          <td>
                            <strong>{item.stock}</strong>
                            <small>Mínimo: {item.minimumStock}</small>
                          </td>

                          <td>
                            <span className={`bn-inventory-status ${
                              status === "Disponible"
                                ? "is-available"
                                : status === "Stock bajo"
                                  ? "is-low"
                                  : status === "Agotado"
                                    ? "is-empty"
                                    : "is-inactive"
                            }`}>
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

                  {/* HISTORIAL DE MOVIMIENTOS */}
            <section className="bn-payments-panel">
            <div className="bn-panel-heading">
                <div>
                <h2>Historial de movimientos</h2>
                <p>
                    Consulta todas las entradas y salidas del inventario.
                </p>
                </div>

                <span className="bn-count-pill">
                {filteredMovements.length} movimientos
                </span>
            </div>

            <div className="bn-inventory-toolbar">
                <input
                type="search"
                placeholder="Buscar producto, presentación o motivo..."
                value={movementSearch}
                onChange={(event) =>
                    setMovementSearch(event.target.value)
                }
                aria-label="Buscar movimientos"
                />

                <select
                value={movementType}
                onChange={(event) =>
                    setMovementType(event.target.value)
                }
                aria-label="Filtrar por tipo de movimiento"
                >
                <option value="TODOS">Todos los movimientos</option>
                <option value="ENTRADA">Entradas</option>
                <option value="SALIDA">Salidas</option>
                </select>

                <button
                type="button"
                className="bn-refresh-button"
                onClick={loadMovements}
                disabled={loadingMovements}
                >
                {loadingMovements ? "Cargando..." : "↻ Actualizar"}
                </button>
            </div>

            {movementError && (
                <div className="bn-error-banner" role="alert">
                {movementError}
                </div>
            )}

            {loadingMovements ? (
                <div className="bn-empty-state">
                <span className="bn-spinner" />
                <p>Cargando movimientos...</p>
                </div>
            ) : filteredMovements.length === 0 ? (
                <div className="bn-empty-state">
                <span className="bn-empty-icon">⌕</span>
                <h3>No hay movimientos</h3>
                <p>
                    No se encontraron registros con los filtros seleccionados.
                </p>
                </div>
            ) : (
                <div className="bn-table-wrap">
                <table className="bn-payments-table bn-inventory-table">
                    <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Producto</th>
                        <th>Presentación</th>
                        <th>Cantidad</th>
                        <th>Stock anterior</th>
                        <th>Stock final</th>
                        <th>Motivo</th>
                        <th>Costo unitario</th>
                        <th>Responsable</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredMovements.map((movement) => (
                        <tr key={movement.idMovimiento}>
                        <td>
                            {new Date(
                            movement.fechaMovimiento
                            ).toLocaleString("es-CO")}
                        </td>

                        <td>
                            <span
                            className={`bn-inventory-status ${
                                movement.tipoMovimiento === "ENTRADA"
                                ? "is-available"
                                : "is-low"
                            }`}
                            >
                            {movement.tipoMovimiento}
                            </span>
                        </td>

                        <td>
                            <strong>{movement.producto}</strong>
                            <small>ID: {movement.idPresentacion}</small>
                        </td>

                        <td>{movement.presentacion}</td>

                        <td>
                            <strong>{movement.cantidad}</strong>
                        </td>

                        <td>{movement.stockAnterior}</td>

                        <td>{movement.stockResultante}</td>

                        <td>{movement.motivo}</td>

                        <td>{money(movement.costoUnitario)}</td>

                        <td>{movement.usuario}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}

            <div className="bn-panel-footer">
                <span>
                Historial de movimientos registrado en la base de datos.
                </span>
                <span>BOOM NAILS · ADMIN</span>
            </div>
            </section>

        </section>
        {showPurchaseModal && (
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
                    onClick={() => setShowPurchaseModal(false)}
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
                            <option
                            key={supplier.id}
                            value={supplier.id}
                            >
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
                                {" | Stock: "}{item.stock}
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
                        {money(
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
                        onClick={() => setShowPurchaseModal(false)}
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
            )}


            {showExitModal && (
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
                    onClick={() => setShowExitModal(false)}
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
                                {" | Stock: "}{item.stock}
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
                        max={
                            inventory.find(
                            (item) =>
                                item.presentationId ===
                                Number(exitForm.presentationId)
                            )?.stock || 1
                        }
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
                        <option value="PRODUCTO_DANADO">Producto dañado</option>
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
                        {inventory.find(
                            (item) =>
                            item.presentationId ===
                            Number(exitForm.presentationId)
                        )?.stock ?? 0} unidades
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
                        onClick={() => setShowExitModal(false)}
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
            )}



      </div>
    </main>
  );
}

export default AdminInventoryPage;
