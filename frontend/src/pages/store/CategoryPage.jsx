
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './HomePage.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
).replace(/\/api\/?$/, '');

function formatPrice(price) {
  return Number(price).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function CategoryPage() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPresentations, setSelectedPresentations] = useState({});
  const [quantities, setQuantities] = useState({});
  const [notice, setNotice] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryProducts() {
      try {
        setLoading(true);
        setError('');

        const [categoriesData, productsData] = await Promise.all([
          apiRequest('/categories'),
          apiRequest('/productos'),
        ]);

        const selectedCategory = categoriesData.find(
          (item) => String(item.id) === String(categoryId)
        );

        const filteredProducts = productsData.filter(
          (product) =>
            String(product.categoryId) === String(categoryId) &&
            product.active
        );

        const filteredSubcategories = categoriesData.filter(
            (item) =>
                String(item.parentId) === String(categoryId) &&
                item.active
        );

        if (!cancelled) {
          setCategory(selectedCategory || null);
          setProducts(filteredProducts);
          setSubcategories(filteredSubcategories);
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

    loadCategoryProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;

    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }

    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  function getSelectedPresentation(product, availablePresentations) {
    const selectedId = selectedPresentations[product.id];

    return (
      availablePresentations.find(
        (presentation) =>
          String(presentation.id) === String(selectedId)
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
      <div className="store-topbar">
        <span>🚚 Envíos a toda Colombia</span>
        <span>♡ Productos originales Boom Nails</span>
        <span>🔒 Pagos seguros</span>
      </div>

      <header className="store-header">
        <button
          type="button"
          className="store-logo"
          onClick={() => navigate('/')}
        >
          <strong>BOOM</strong>
          <small>NAILS</small>
        </button>

        <nav className="store-navigation">
          <button type="button" onClick={() => navigate('/')}>
            Inicio
          </button>
          <button type="button" onClick={() => navigate('/category/1')}>
            Esmaltes
          </button>
          <button type="button" onClick={() => navigate('/category/2')}>
            Acrylgel
          </button>
          <button type="button" onClick={() => navigate('/category/3')}>
            Uñas
          </button>
        </nav>

        <button
          type="button"
          className="store-cart"
          onClick={() => navigate('/cart')}
          aria-label="Ver carrito"
        >
          🛒 <span>{totalItems}</span>
        </button>
      </header>
        <button
        type="button"
        className="category-back-button"
        onClick={() => navigate('/')}
        >
        ← Volver a categorías
        </button>
      <section className="home-catalog">
        <div className="catalog-heading">
          <div>
            <p className="home-eyebrow">BOOM NAILS</p>
            <h2>{category?.name || 'Categoría no encontrada'}</h2>
            {category?.description && <p>{category.description}</p>}
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
            <p>No pudimos cargar los productos.</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && subcategories.length > 0 && (
            <div className="home-categories">
                {subcategories.map((subcategory) => (
                <button
                    type="button"
                    className="category-item"
                    key={subcategory.id}
                    onClick={() => navigate(`/category/${subcategory.id}`)}
                >
                    <div className="category-circle">
                    {subcategory.imageUrl ? (
                        <img
                        src={getImageUrl(subcategory.imageUrl)}
                        alt={subcategory.name}
                        />
                    ) : (
                        <span>BOOM</span>
                    )}
                    </div>

                    <span>{subcategory.name}</span>
                    <small>{subcategory.description}</small>
                </button>
                ))}
            </div>
            )}

            {!loading && !error && subcategories.length === 0 && products.length === 0 && (
            <p className="catalog-message">
                No hay productos disponibles en esta categoría.
            </p>
            )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => {
              const presentations = product.presentations || [];

              const availablePresentations = presentations.filter(
                (presentation) =>
                  presentation.active &&
                  Number(presentation.stock) > 0
              );

              const presentation = getSelectedPresentation(
                product,
                availablePresentations
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
                          {formatPrice(presentation.retailPrice)}
                        </p>

                      <div className="quantity-container">
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
                      </div>

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

export default CategoryPage;
