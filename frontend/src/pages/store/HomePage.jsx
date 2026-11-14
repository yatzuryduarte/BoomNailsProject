
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './HomePage.css';
import { formatCurrency } from "../../utils/formatters";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
).replace(/\/api\/?$/, '');

function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPresentations, setSelectedPresentations] = useState({});
  const [quantities, setQuantities] = useState({});
  const [notice, setNotice] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [categories, setCategories] = useState([]);

  const { addToCart, totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const data = await apiRequest('/productos');

        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'No fue posible cargar los productos.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
        try {
        const data = await apiRequest('/categories');

        if (!cancelled) {
            setCategories(Array.isArray(data) ? data : []);
        }
        } catch (err) {
        console.error('Error al cargar las categorías:', err);
        }
    }

    loadCategories();

    return () => {
        cancelled = true;
    };
    }, []);

  function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  // Si ya viene como URL completa
  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // Si viene como /api/...
  if (imageUrl.startsWith('/api/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // Si viene como /uploads/...
  if (imageUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  // Si viene como uploads/...
  if (imageUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${imageUrl}`;
  }

  // Si viene como /product-images/...
  if (imageUrl.startsWith('/product-images/')) {
    return `${API_BASE_URL}/api${imageUrl}`;
  }

  // Si viene como product-images/...
  if (imageUrl.startsWith('product-images/')) {
    return `${API_BASE_URL}/api/${imageUrl}`;
  }

  return `${API_BASE_URL}/${imageUrl}`;
}

  function getSelectedPresentation(product, availablePresentations) {
    const selectedId = selectedPresentations[product.id];

    return (
      availablePresentations.find(
        (presentation) => String(presentation.id) === String(selectedId),
      ) || availablePresentations[0]
    );
  }

  function handleAddToCart(product, presentation) {
    if (!presentation) {
      setNotice('Este producto no tiene presentaciones disponibles.');
      return;
    }

    const quantity = Number(quantities[product.id] || 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setNotice('Selecciona una cantidad válida.');
      return;
    }

    if (quantity > Number(presentation.stock)) {
      setNotice(`Solo hay ${presentation.stock} unidades disponibles.`);
      return;
    }

    try {
      addToCart(product, presentation, quantity);

      setAddedProductId(product.id);
      setNotice(`${product.name} se agregó al carrito.`);

      setTimeout(() => {
        setAddedProductId(null);
      }, 1800);
    } catch (err) {
      setNotice(err.message || 'No fue posible agregar el producto.');
    }
  }

  return (
    <main className="home-page">
        {/* Barra superior */}
    <div className="store-topbar">
    <span>🚚 Envíos a toda Colombia</span>
    <span>♡ Productos originales Boom Nails</span>
    <span>🔒 Pagos seguros</span>
    </div>

    {/* Encabezado principal */}
    <header className="store-header">
    <button
        type="button"
        className="store-logo"
        onClick={() => navigate("/")}
    >
        <strong>BOOM</strong>
        <small>NAILS</small>
    </button>

        <nav className="store-navigation">
        <button
            type="button"
            className="active"
            onClick={() => navigate("/")}
        >
            Inicio
        </button>

        <button
            type="button"
            onClick={() => navigate("/category/1")}
        >
            Esmaltes
        </button>

        <button
            type="button"
            onClick={() => navigate("/category/2")}
        >
            Acrylgel
        </button>

        <button
            type="button"
            onClick={() => navigate("/category/3")}
        >
            Uñas
        </button>
        </nav>

    <button
        type="button"
        className="store-cart"
        onClick={() => navigate("/cart")}
        aria-label="Ver carrito"
    >
        🛒 <span>{totalItems}</span>
    </button>
    </header>
        <section className="home-banner">
            <img
                src="/images/banner.png"
                alt="Colección Boom Nails"
                className="home-banner-image"
            />
        </section>

        <section className="home-categories">
    {categories
        .filter((category) => category.parentId !== null)
        .map((category) => {
        const imageUrl = getImageUrl(category.imageUrl);

        return (
            <div
            className="category-item"
            key={category.id}
            onClick={() => navigate(`/category/${category.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                navigate(`/category/${category.id}`);
                }
            }}
            >
            <div className="category-circle">
                {imageUrl ? (
                <img src={imageUrl} alt={category.name} />
                ) : (
                <span>{category.name}</span>
                )}
            </div>

            <span>{category.name}</span>
            </div>
        );
        })}
    </section>

      <section className="home-catalog">
        <div className="catalog-heading">
          <div>
            <p className="home-eyebrow">NUESTRO CATÁLOGO</p>
            <h2>Productos para tus uñas</h2>
          </div>
          <span>{products.length} productos</span>
        </div>

        {notice && (
          <div className="cart-notice" role="status">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')}>
              Cerrar
            </button>
          </div>
        )}

        {loading && (
          <p className="catalog-message">Cargando productos...</p>
        )}

        {error && (
          <div className="catalog-error">
            <p>No pudimos cargar el catálogo.</p>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Intentar de nuevo
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="catalog-message">
            No hay productos disponibles en este momento.
          </p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => {
              const presentations = product.presentations || [];

              const availablePresentations = presentations.filter(
                (presentation) =>
                  presentation.active && Number(presentation.stock) > 0,
              );

              const presentation = getSelectedPresentation(
                product,
                availablePresentations,
              );

              const imageUrl = getImageUrl(product.imageUrl);
              const quantity = Number(quantities[product.id] || 1);

              return (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <span>BOOM</span>
                        <span>NAILS</span>
                        <small>Imagen próximamente</small>
                      </div>
                    )}
                  </div>

                  <div className="product-info">
                    
                    <h3>{product.name}</h3>
                    <p className="product-description">
                      {product.description}
                    </p>

                    {availablePresentations.length > 0 ? (
                      <>
                        <label
                          className="presentation-label"
                          htmlFor={`presentation-${product.id}`}
                        >
                          Presentación
                        </label>

                        <select
                          id={`presentation-${product.id}`}
                          className="presentation-select"
                          value={presentation?.id ?? ''}
                          onChange={(event) =>
                            setSelectedPresentations((current) => ({
                              ...current,
                              [product.id]: event.target.value,
                            }))
                          }
                        >
                          {availablePresentations.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                          ))}
                        </select>

                        <p className="product-size">
                          Tamaño: {presentation.size}
                        </p>

                        <p className="product-price">
                          {formatCurrency(presentation.retailPrice)}
                        </p>


                        <label
                          className="quantity-label"
                          htmlFor={`quantity-${product.id}`}
                        >
                          Cantidad
                        </label>

                        <input
                          id={`quantity-${product.id}`}
                          className="quantity-input"
                          type="number"
                          min="1"
                          max={presentation.stock}
                          value={quantity}
                          onChange={(event) =>
                            setQuantities((current) => ({
                              ...current,
                              [product.id]: event.target.value,
                            }))
                          }
                        />

                      <button
                        type="button"
                        className={`add-to-cart-button ${
                          addedProductId === product.id ? 'added' : ''
                        }`}
                        onClick={() => handleAddToCart(product, presentation)}
                      >
                        {addedProductId === product.id
                          ? '✓ ¡Agregado!'
                          : 'Agregar al carrito'}
                      </button>
                      </>
                    ) : (
                      <p className="product-stock">
                        Producto agotado temporalmente
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default HomePage;
