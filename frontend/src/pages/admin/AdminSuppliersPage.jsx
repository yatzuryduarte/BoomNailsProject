import { useEffect, useMemo, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import "./AdminPaymentsPage.css";
import { apiRequest } from "../../services/api";

function AdminSuppliersPage() {
  const { logout } = useAdminAuth();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    identification: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });


  const loadSuppliers = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await apiRequest("/admin/suppliers/all");

    setSuppliers(data);
  } catch (err) {
    setError(
      err.message || "No se pudo conectar con el servidor."
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  loadSuppliers();
}, []);

  const filteredSuppliers = useMemo(() => {
  const term = searchTerm.trim().toLowerCase();

  return suppliers.filter((supplier) => {
    const matchesSearch = [
      supplier.id,
      supplier.name,
      supplier.identification,
      supplier.phone,
      supplier.email,
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(term)
      );

    const matchesStatus =
      statusFilter === "TODOS" ||
      supplier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [suppliers, searchTerm, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openEditForm = (supplier) => {
    setError("");
    setSuccess("");
    setEditingSupplier(supplier);

    setForm({
        name: supplier.name || "",
        identification: supplier.identification || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
    });

    setShowForm(true);
    };

  const resetForm = () => {
    setForm({
      name: "",
      identification: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre del proveedor es obligatorio.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const createdSupplier = await apiRequest(
  "/admin/suppliers",
  {
    method: "POST",
    body: JSON.stringify({
      name: form.name.trim(),
      identification: form.identification.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    }),
  }
);

      setSuppliers((previous) => [...previous, createdSupplier]);
      setSuccess("Proveedor registrado correctamente.");
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Ocurrió un error al guardar el proveedor.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingSupplier) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
        const updatedSupplier = await apiRequest(
  `/admin/suppliers/${editingSupplier.id}`,
  {
    method: "PUT",
    body: JSON.stringify({
      name: form.name,
      identification: form.identification || null,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      notes: form.notes || null,
    }),
  }
);

        setSuppliers((previous) =>
        previous.map((supplier) =>
            supplier.id === updatedSupplier.id
            ? updatedSupplier
            : supplier
        )
        );

        setSuccess("Proveedor actualizado correctamente.");
        setShowForm(false);
        setEditingSupplier(null);
        resetForm();

    } catch (error) {
        setError(error.message);
    } finally {
        setSaving(false);
    }
    };

    const handleToggleStatus = async (supplier) => {
        const newStatus =
            supplier.status === "ACTIVO" ? "INACTIVO" : "ACTIVO";

        setError("");
        setSuccess("");

        try {
            await apiRequest(
              `/admin/suppliers/${supplier.id}/status?status=${newStatus}`,
              {
                method: "PATCH",
              }
            );

            setSuppliers((previous) =>
            previous.map((item) =>
                item.id === supplier.id
                ? { ...item, status: newStatus }
                : item
            )
            );

            setSuccess(
            newStatus === "ACTIVO"
                ? "Proveedor activado correctamente."
                : "Proveedor inactivado correctamente."
            );

        } catch (error) {
            setError(error.message);
        }
        };

  return (
    <main className="bn-orders-layout">
      <AdminSidebar />

      <div className="bn-payments-content">
        <div className="bn-payments-topbar">
          <div>
            <strong>BOOM NAILS</strong>
            <small>Administración · Proveedores</small>
          </div>

          <button className="bn-logout" onClick={logout}>
            Salir
          </button>
        </div>

        <section className="bn-dashboard">
          <div className="bn-page-heading">
            <div>
              <p className="bn-eyebrow">CENTRO DE CONTROL</p>
              <h1>Gestión de proveedores.</h1>
              <p className="bn-muted">
                Administra los proveedores y consulta su información
                comercial.
              </p>
            </div>

            <button
              className="bn-refresh-button"
              onClick={loadSuppliers}
              disabled={loading}
            >
              ↻ <span>Actualizar</span>
            </button>
          </div>

          {error && (
            <div className="bn-error-banner" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="bn-success-banner" role="status">
              {success}
            </div>
          )}

          <div className="bn-stat-grid">
            <article className="bn-stat-card bn-stat-featured">

        <div className="bn-stat-top">
            <span>Proveedores activos</span>
            <span className="bn-stat-icon">▦</span>
        </div>

        <strong>
            {suppliers.filter(
                (supplier) => supplier.status === "ACTIVO"
            ).length}
        </strong>

        <small>
        De {suppliers.length} proveedores registrados
        </small>
            </article>
          </div>

          <section className="bn-payments-panel">
            <div className="bn-panel-heading">
              <div>
                <h2>Directorio de proveedores</h2>
                <p>Consulta y registra los proveedores de Boom Nails.</p>
              </div>

              <button
                className="bn-refresh-button bn-supplier-add-button"
                onClick={() => {
                    setEditingSupplier(null);
                    resetForm();
                    setError("");
                    setSuccess("");
                    setShowForm(true);
                    }}
              >
                + <span>Nuevo proveedor</span>
              </button>
            </div>

                <div className="bn-inventory-toolbar bn-supplier-toolbar">
                    <input
                        type="search"
                        placeholder="Buscar por nombre, ID, identificación o teléfono..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label="Buscar proveedores"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        aria-label="Filtrar proveedores por estado"
                    >
                        <option value="TODOS">Todos los proveedores</option>
                        <option value="ACTIVO">Solo activos</option>
                        <option value="INACTIVO">Solo inactivos</option>
                    </select>
                </div>

            {loading ? (
              <div className="bn-empty-state">
                <span className="bn-spinner" />
                <p>Cargando proveedores...</p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="bn-empty-state">
                <span className="bn-empty-icon">⌕</span>
                <h3>No se encontraron proveedores</h3>
                <p>
                  {suppliers.length === 0
                    ? "Todavía no hay proveedores registrados."
                    : "Prueba con otro nombre o identificación."}
                </p>
              </div>
            ) : (
              <div className="bn-table-wrap">
                <table className="bn-payments-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Proveedor</th>
                      <th>Identificación</th>
                      <th>Teléfono</th>
                      <th>Correo</th>
                      <th>Dirección</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id}>
                        <td>{supplier.id}</td>
                        <td><strong>{supplier.name}</strong></td>
                        <td>{supplier.identification || "—"}</td>
                        <td>{supplier.phone || "—"}</td>
                        <td>{supplier.email || "—"}</td>
                        <td>{supplier.address || "—"}</td>
                        <td>
                            <span
                                className={`bn-inventory-status ${
                                supplier.status === "ACTIVO"
                                    ? "is-available"
                                    : "is-unavailable"
                                }`}
                            >
                                {supplier.status === "ACTIVO" ? "Activo" : "Inactivo"}
                            </span>
                        </td>
                        <td>
                            <div className="bn-supplier-actions">

                                <button
                                type="button"
                                className="bn-supplier-edit-button"
                                onClick={() => openEditForm(supplier)}
                                >
                                <span>✎</span>
                                Editar
                                </button>

                                <button
                                type="button"
                                className={
                                    supplier.status === "ACTIVO"
                                    ? "bn-supplier-deactivate-button"
                                    : "bn-supplier-activate-button"
                                }
                                onClick={() => handleToggleStatus(supplier)}
                                >
                                {supplier.status === "ACTIVO" ? "Inactivar" : "Activar"}
                                </button>

                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bn-panel-footer">
              <span>
                Los proveedores se consultan directamente desde MySQL.
              </span>
              <span>BOOM NAILS · ADMIN</span>
            </div>
          </section>
        </section>
      </div>

      {showForm && (
        <div className="bn-supplier-modal-overlay">
          <section
            className="bn-supplier-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-modal-title"
          >
            <div className="bn-panel-heading">
              <div>
                <h2 id="supplier-modal-title">
                {editingSupplier ? "Editar proveedor" : "Nuevo proveedor"}
                </h2>
                <p>Completa los datos que tengas disponibles.</p>
              </div>

              <button
                type="button"
                className="bn-supplier-close"
                onClick={() => {
                setShowForm(false);
                setEditingSupplier(null);
                resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={editingSupplier ? handleUpdate : handleCreate}>
              <div className="bn-supplier-form-grid">
                <label>
                  Nombre del proveedor *
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nombre o razón social"
                    required
                  />
                </label>

                <label>
                  NIT o identificación
                  <input
                    name="identification"
                    value={form.identification}
                    onChange={handleChange}
                    placeholder="Número de identificación"
                  />
                </label>

                <label>
                  Teléfono
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Número de contacto"
                  />
                </label>

                <label>
                  Correo electrónico
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="correo@empresa.com"
                  />
                </label>

                <label className="bn-supplier-full">
                  Dirección
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Dirección del proveedor"
                  />
                </label>

                <label className="bn-supplier-full">
                  Observaciones
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Información adicional (opcional)"
                    rows="3"
                  />
                </label>
              </div>

              <p className="bn-supplier-required-note">
                * Campo obligatorio. Los demás datos son opcionales.
              </p>

              <div className="bn-supplier-form-actions">
                <button
                  type="button"
                  className="bn-refresh-button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bn-supplier-submit"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingSupplier
                        ? "Guardar cambios"
                        : "Guardar proveedor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminSuppliersPage;
