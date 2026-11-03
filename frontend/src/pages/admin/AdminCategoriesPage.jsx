
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import AdminSidebar from "./AdminSidebar";
import AdminAccessDenied from "./AdminAccessDenied";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function AdminCategoriesPage() {
  const { credentials, logout } = useAdminAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

const [formData, setFormData] = useState({
  name: "",
  description: "",
  parentId: "",
  image: null,
});

const [imagePreview, setImagePreview] = useState("");
const [saving, setSaving] = useState(false);
const [deletingId, setDeletingId] = useState(null);
const openCreateForm = () => {
  setEditingCategory(null);

  setFormData({
    name: "",
    description: "",
    parentId: "",
    image: null,
  });

  setImagePreview("");
  setError("");
  setShowForm(true);
};

const openEditForm = (category) => {
  setEditingCategory(category);

  setFormData({
    name: category.name || "",
    description: category.description || "",
    parentId: category.parentId
      ? String(category.parentId)
      : "",
    image: null,
  });

  setImagePreview(
    category.imageUrl
      ? `http://localhost:8080${category.imageUrl}`
      : ""
  );

  setError("");
  setShowForm(true);
};

const handleFormChange = (event) => {
  const { name, value } = event.target;

  setFormData((previous) => ({
    ...previous,
    [name]: value,
  }));
};

const handleImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setError("Solo se permiten imágenes JPG, PNG o WEBP.");
    event.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("La imagen no puede superar los 5 MB.");
    event.target.value = "";
    return;
  }

  setFormData((previous) => ({
    ...previous,
    image: file,
  }));

  setImagePreview(URL.createObjectURL(file));
  setError("");
};

const handleSaveCategory = async (event) => {
  event.preventDefault();

  if (!formData.name.trim()) {
    setError("El nombre de la categoría es obligatorio.");
    return;
  }

  try {
    setSaving(true);
    setError("");

    const data = new FormData();

    data.append("name", formData.name.trim());
    data.append("description", formData.description.trim());

    if (formData.parentId) {
      data.append("parentId", formData.parentId);
    }

    if (formData.image) {
      data.append("image", formData.image);
    }

    const url = editingCategory
      ? `${API_URL}/admin/categories/${editingCategory.id}`
      : `${API_URL}/admin/categories`;

    const response = await fetch(url, {
      method: editingCategory ? "PUT" : "POST",
      headers: {
        Authorization: `Basic ${btoa(
          `${credentials.email}:${credentials.password}`
        )}`,
      },
      body: data,
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(
        `Error ${response.status}: ${
          details || "No fue posible guardar la categoría."
        }`
      );
    }

    setShowForm(false);
    setEditingCategory(null);
    setImagePreview("");

    await loadCategories();
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          headers: {
            Authorization: `Basic ${btoa(
              `${credentials.email}:${credentials.password}`
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("No fue posible cargar las categorías.");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateCategoryStatus = async (category) => {
  const nextStatus = !category.active;
  const action = nextStatus ? "activar" : "desactivar";

  if (
    !window.confirm(
      `¿Confirmas que deseas ${action} la categoría "${category.name}"?`
    )
  ) {
    return;
  }

  try {
    setError("");

    const response = await fetch(
      `${API_URL}/admin/categories/${category.id}/status?active=${nextStatus}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Basic ${btoa(
            `${credentials.email}:${credentials.password}`
          )}`,
        },
      }
    );

    if (!response.ok) {
  const errorDetails = await response.text();

  throw new Error(
    `Error ${response.status}: ${errorDetails || "No fue posible actualizar el estado."}`
  );
}

    await loadCategories();
  } catch (err) {
    setError(err.message);
  }
};

    const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
        `¿Estás segura de eliminar la categoría "${category.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
        setDeletingId(category.id);
        setError("");

        const response = await fetch(
        `${API_URL}/admin/categories/${category.id}`,
        {
            method: "DELETE",
            headers: {
            Authorization: `Basic ${btoa(
                `${credentials.email}:${credentials.password}`
            )}`,
            },
        }
        );

        if (!response.ok) {
        const details = await response.text();

        throw new Error(
            details ||
            "No fue posible eliminar la categoría. Verifica si tiene productos o subcategorías."
        );
        }

        await loadCategories();

    } catch (err) {
        setError(err.message);
    } finally {
        setDeletingId(null);
    }
    };

  useEffect(() => {
    if (credentials) {
      loadCategories();
    }
  }, []);

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
            <small>Administración · Categorías</small>
          </div>

          <button
            className="bn-logout"
            onClick={logout}
          >
            Salir
          </button>
        </div>

        <section className="bn-dashboard">
          <div className="bn-page-heading">
            <div>
              <p className="bn-eyebrow">CENTRO DE CONTROL</p>
              <h1>Gestión de categorías.</h1>
              <p className="bn-muted">
                Organiza las categorías y subcategorías de Boom Nails.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
            <button
                className="bn-refresh-button"
                onClick={loadCategories}
                disabled={loading}
            >
                ↻ Actualizar
            </button>

            <button
                className="bn-category-save-button"
                onClick={openCreateForm}
            >
                + Nueva categoría
            </button>
            </div>
            </div>

          {error && (
            <div className="bn-error-banner">{error}</div>
          )}


        {showForm && (
        <div className="bn-category-form-card">
            <div className="bn-page-heading">
            <div>
                <p className="bn-eyebrow">BOOM NAILS</p>
                <h2>
                {editingCategory ? "Editar categoría" : "Nueva categoría"}
                </h2>
                <p className="bn-muted">
                Completa la información de la categoría.
                </p>
            </div>

            
            </div>

            <form onSubmit={handleSaveCategory}>
            <div className="bn-category-form-grid">
                <div className="bn-category-fields">
                <label>Nombre de la categoría *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ej. Acrylgel"
                    required
                />

                <label>Descripción</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Describe esta categoría..."
                    rows="4"
                />

                <label>Categoría principal</label>
                <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleFormChange}
                >
                    <option value="">Sin categoría principal</option>

                    {categories
                    .filter(
                        (category) =>
                        !category.parentId &&
                        category.id !== editingCategory?.id
                    )
                    .map((category) => (
                        <option key={category.id} value={category.id}>
                        {category.name}
                        </option>
                    ))}
                </select>
                </div>

                <div className="bn-category-image-field">
                <label>Fotografía de la categoría</label>

                <div className="bn-category-image-preview">
                    {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" />
                    ) : (
                    <div>
                        <span>+</span>
                        <p>Selecciona una fotografía</p>
                    </div>
                    )}
                </div>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                />

                <small>JPG, PNG o WEBP · Máximo 5 MB</small>
                </div>
            </div>

            <div className="bn-category-form-actions">
                <button
                type="button"
                className="bn-refresh-button"
                onClick={() => setShowForm(false)}
                >
                Cancelar
                </button>

                <button
                type="submit"
                className="bn-category-save-button"
                disabled={saving}
                >
                {saving
                    ? "Guardando..."
                    : editingCategory
                    ? "Guardar cambios"
                    : "Crear categoría"}
                </button>
            </div>
            </form>
        </div>
        )}


          {loading ? (
            <p>Cargando categorías...</p>
          ) : (
            <div>
              <h2>Categorías registradas ({categories.length})</h2>

              <div className="bn-table-wrap">
                <table className="bn-payments-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Imagen</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                  <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                        <td>
                            <strong>
                            {category.parentId
                                ? `↳ ${category.name}`
                                : category.name}
                            </strong>
                        </td>

                        {/* Fotografía de la categoría */}
                        <td>
                            <div className="bn-category-table-image">
                            {category.imageUrl ? (
                                <img
                                src={`http://localhost:8080${category.imageUrl}`}
                                alt={category.name}
                                />
                            ) : (
                                <span>Sin imagen</span>
                            )}
                            </div>
                        </td>

                        <td>{category.description || "—"}</td>

                        <td>
                            {category.parentId
                            ? "Subcategoría"
                            : "Principal"}
                        </td>

                        <td>
                            <button
                            className={
                                category.active
                                ? "bn-category-status-button bn-category-status-inactive"
                                : "bn-category-status-button bn-category-status-active"
                            }
                            onClick={() => updateCategoryStatus(category)}
                            disabled={loading}
                            >
                            {category.active ? "Desactivar" : "Activar"}
                            </button>
                        </td>

                        <td>
                            <div className="bn-category-actions">
                                <button
                                className="bn-category-edit-button"
                                onClick={() => openEditForm(category)}
                                >
                                ✎ Editar
                                </button>

                                <button
                                className="bn-category-delete-button"
                                onClick={() => handleDeleteCategory(category)}
                                disabled={deletingId === category.id}
                                >
                                {deletingId === category.id ? "Eliminando..." : "🗑 Eliminar"}
                                </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminCategoriesPage;
