import { useEffect, useState } from "react";

import { apiRequest } from "../../../../services/api";

const createEmptyPresentation = () => ({
  id: null,
  name: "",
  volumeMl: "",
  unitsPerPackage: "",
  retailPrice: "",
  wholesalePrice: "",
});

const initialForm = {
  categoryId: "",
  reference: "",
  name: "",
  description: "",
  presentations: [createEmptyPresentation()],
};

export default function ProductFormModal({
  open,
  product,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(product);

  useEffect(() => {
    if (!open) {
      return;
    }

    setError("");

    const loadModalData = async () => {
      try {
        setLoadingCategories(true);

        const categoriesData = await apiRequest("/categories");

        setCategories(
          Array.isArray(categoriesData)
            ? categoriesData
            : []
        );

        if (product) {
          setLoadingProduct(true);

          const productData = await apiRequest(
            `/admin/productos/${product.id}`
          );

          setForm({
            categoryId: String(
              productData.categoryId ?? ""
            ),
            reference: productData.reference ?? "",
            name: productData.name ?? "",
            description: productData.description ?? "",
            presentations:
              productData.presentations?.length > 0
                ? productData.presentations.map(
                    (presentation) => ({
                      id: presentation.id ?? null,
                      name: presentation.name ?? "",
                      volumeMl:
                        presentation.volumeMl != null
                          ? String(presentation.volumeMl)
                          : "",
                      unitsPerPackage:
                        presentation.unitsPerPackage != null
                          ? String(
                              presentation.unitsPerPackage
                            )
                          : "",
                      retailPrice:
                        presentation.retailPrice != null
                          ? String(
                              presentation.retailPrice
                            )
                          : "",
                      wholesalePrice:
                        presentation.wholesalePrice != null
                          ? String(
                              presentation.wholesalePrice
                            )
                          : "",
                    })
                  )
                : [createEmptyPresentation()],
          });
        } else {
          setForm(initialForm);
        }
      } catch (err) {
        setError(
          err.message ||
            "No fue posible cargar la información del producto."
        );
      } finally {
        setLoadingCategories(false);
        setLoadingProduct(false);
      }
    };

    loadModalData();
  }, [open, product]);

  if (!open) {
    return null;
  }

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePresentationChange = (
    index,
    field,
    value
  ) => {
    setForm((current) => {
      const presentations = [
        ...current.presentations,
      ];

      presentations[index] = {
        ...presentations[index],
        [field]: value,
      };

      return {
        ...current,
        presentations,
      };
    });
  };

  const addPresentation = () => {
    setForm((current) => ({
      ...current,
      presentations: [
        ...current.presentations,
        createEmptyPresentation(),
      ],
    }));
  };

  const removePresentation = (index) => {
    setForm((current) => {
      if (current.presentations.length === 1) {
        return current;
      }

      return {
        ...current,
        presentations:
          current.presentations.filter(
            (_, presentationIndex) =>
              presentationIndex !== index
          ),
      };
    });
  };

  const validateForm = () => {
    if (!form.categoryId) {
      return "Debes seleccionar una categoría.";
    }

    if (!form.reference.trim()) {
      return "La referencia es obligatoria.";
    }

    if (!form.name.trim()) {
      return "El nombre del producto es obligatorio.";
    }

    if (form.presentations.length === 0) {
      return "El producto debe tener al menos una presentación.";
    }

    for (
      let index = 0;
      index < form.presentations.length;
      index += 1
    ) {
      const presentation =
        form.presentations[index];

      const presentationNumber = index + 1;

      if (!presentation.name.trim()) {
        return `La presentación ${presentationNumber} necesita un nombre.`;
      }

      const hasVolume =
        presentation.volumeMl !== "";

      const hasUnits =
        presentation.unitsPerPackage !== "";

      if (hasVolume === hasUnits) {
        return `La presentación ${presentationNumber} debe tener volumen en ml o unidades por paquete, pero no ambos.`;
      }

      if (
        hasVolume &&
        Number(presentation.volumeMl) <= 0
      ) {
        return `El volumen de la presentación ${presentationNumber} debe ser mayor que cero.`;
      }

      if (
        hasUnits &&
        Number(presentation.unitsPerPackage) <= 0
      ) {
        return `Las unidades de la presentación ${presentationNumber} deben ser mayores que cero.`;
      }

      if (
        presentation.retailPrice === "" ||
        Number(presentation.retailPrice) < 0
      ) {
        return `El precio detal de la presentación ${presentationNumber} no es válido.`;
      }

      if (
        presentation.wholesalePrice === "" ||
        Number(presentation.wholesalePrice) < 0
      ) {
        return `El precio mayorista de la presentación ${presentationNumber} no es válido.`;
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        categoryId: Number(form.categoryId),
        reference: form.reference.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        presentations: form.presentations.map(
          (presentation) => ({
            ...(isEditing && presentation.id
              ? { id: presentation.id }
              : {}),
            name: presentation.name.trim(),
            volumeMl:
              presentation.volumeMl === ""
                ? null
                : Number(presentation.volumeMl),
            unitsPerPackage:
              presentation.unitsPerPackage === ""
                ? null
                : Number(
                    presentation.unitsPerPackage
                  ),
            retailPrice: Number(
              presentation.retailPrice
            ),
            wholesalePrice: Number(
              presentation.wholesalePrice
            ),
          })
        ),
      };

      if (isEditing) {
        await apiRequest(
          `/admin/productos/${product.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiRequest(
          "/admin/productos",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }

      await onSaved();
    } catch (err) {
      setError(
        err.message ||
          `No fue posible ${
            isEditing
              ? "actualizar"
              : "crear"
          } el producto.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    onClose();
  };

  return (
    <div className="bn-product-modal-overlay">
      <div
        className="bn-product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <div className="bn-product-modal-header">
          <div>
            <span className="bn-products-eyebrow">
              Gestión del catálogo
            </span>

            <h2 id="product-modal-title">
              {isEditing
                ? "Editar producto"
                : "Nuevo producto"}
            </h2>

            <p>
              {isEditing
                ? "Actualiza la información comercial del producto."
                : "Registra el producto y sus presentaciones comerciales."}
            </p>
          </div>

          <button
            type="button"
            className="bn-product-modal-close"
            onClick={handleClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {(loadingCategories ||
          loadingProduct) && (
          <div className="bn-products-message">
            Cargando información...
          </div>
        )}

        {!loadingCategories &&
          !loadingProduct && (
            <form onSubmit={handleSubmit}>
              <div className="bn-product-form-grid">
                <div className="bn-form-field">
                  <label htmlFor="product-category">
                    Categoría *
                  </label>

                  <select
                    id="product-category"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleFieldChange}
                    disabled={saving}
                  >
                    <option value="">
                      Selecciona una categoría
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bn-form-field">
                  <label htmlFor="product-reference">
                    Referencia / SKU *
                  </label>

                  <input
                    id="product-reference"
                    name="reference"
                    type="text"
                    value={form.reference}
                    onChange={handleFieldChange}
                    placeholder="Ej. BOMBOM-001"
                    disabled={saving}
                  />
                </div>

                <div className="bn-form-field">
                  <label htmlFor="product-name">
                    Nombre del producto *
                  </label>

                  <input
                    id="product-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleFieldChange}
                    placeholder="Ej. BOMBOM"
                    disabled={saving}
                  />
                </div>

                <div className="bn-form-field bn-form-field-full">
                  <label htmlFor="product-description">
                    Descripción
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    value={form.description}
                    onChange={handleFieldChange}
                    placeholder="Describe el producto..."
                    rows={3}
                    disabled={saving}
                  />
                </div>
              </div>

              <section className="bn-product-presentations-form">
                <div className="bn-product-presentations-header">
                  <div>
                    <h3>Presentaciones</h3>

                    <p>
                      Define el tamaño o cantidad
                      comercial y sus precios.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="bn-btn bn-btn-secondary"
                    onClick={addPresentation}
                    disabled={saving}
                  >
                    + Agregar presentación
                  </button>
                </div>

                {form.presentations.map(
                  (presentation, index) => (
                    <article
                      className="bn-product-presentation-form"
                      key={
                        presentation.id ??
                        `new-${index}`
                      }
                    >
                      <div className="bn-product-presentation-form-header">
                        <strong>
                          Presentación {index + 1}
                        </strong>

                        {form.presentations.length >
                          1 && (
                          <button
                            type="button"
                            className="bn-product-remove-presentation"
                            onClick={() =>
                              removePresentation(
                                index
                              )
                            }
                            disabled={saving}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="bn-product-form-grid">
                        <div className="bn-form-field">
                          <label>
                            Presentación *
                          </label>

                          <input
                            type="text"
                            value={
                              presentation.name
                            }
                            onChange={(event) =>
                              handlePresentationChange(
                                index,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Ej. 8 ml"
                            disabled={saving}
                          />
                        </div>

                        <div className="bn-form-field">
                          <label>
                            Volumen (ml)
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              presentation.volumeMl
                            }
                            onChange={(event) =>
                              handlePresentationChange(
                                index,
                                "volumeMl",
                                event.target.value
                              )
                            }
                            placeholder="Ej. 8"
                            disabled={
                              saving ||
                              presentation.unitsPerPackage !==
                                ""
                            }
                          />
                        </div>

                        <div className="bn-form-field">
                          <label>
                            Unidades por paquete
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              presentation.unitsPerPackage
                            }
                            onChange={(event) =>
                              handlePresentationChange(
                                index,
                                "unitsPerPackage",
                                event.target.value
                              )
                            }
                            placeholder="Ej. 240"
                            disabled={
                              saving ||
                              presentation.volumeMl !==
                                ""
                            }
                          />
                        </div>

                        <div className="bn-form-field">
                          <label>
                            Precio detal *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              presentation.retailPrice
                            }
                            onChange={(event) =>
                              handlePresentationChange(
                                index,
                                "retailPrice",
                                event.target.value
                              )
                            }
                            placeholder="Ej. 18000"
                            disabled={saving}
                          />
                        </div>

                        <div className="bn-form-field">
                          <label>
                            Precio mayorista *
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={
                              presentation.wholesalePrice
                            }
                            onChange={(event) =>
                              handlePresentationChange(
                                index,
                                "wholesalePrice",
                                event.target.value
                              )
                            }
                            placeholder="Ej. 12600"
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </article>
                  )
                )}
              </section>

              {error && (
                <div className="bn-products-error">
                  {error}
                </div>
              )}

              <div className="bn-product-modal-footer">
                <button
                  type="button"
                  className="bn-btn bn-btn-secondary"
                  onClick={handleClose}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="bn-btn bn-btn-primary"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : isEditing
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </form>
          )}
      </div>
    </div>
  );
}