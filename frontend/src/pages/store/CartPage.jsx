
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

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

function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (/^https?:\/\//i.test(imageUrl)) return imageUrl;

    return `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  return (
    <main className="cart-page">
      <header className="cart-header">
        <p className="home-eyebrow">BOOM NAILS</p>
        <h1>Tu carrito de compras</h1>
        <p>
          {totalItems} {totalItems === 1 ? 'unidad seleccionada' : 'unidades seleccionadas'}
        </p>
      </header>

      {cartItems.length === 0 ? (
        <section className="cart-empty">
          <h2>Tu carrito está vacío</h2>
          <p>Descubre nuestros productos y elige tus favoritos.</p>
          <button type="button" onClick={() => navigate('/')}>
            Explorar catálogo
          </button>
        </section>
      ) : (
        <section className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => {
              const imageUrl = getImageUrl(item.imageUrl);

              return (
                <article
                  className="cart-item"
                  key={`${item.productId}-${item.presentationId}`}
                >
                  <div className="cart-item-image">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.name} />
                    ) : (
                      <span>BOOM NAILS</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    
                    <h2>{item.name}</h2>
                    <p>{item.presentationName} · {item.size}</p>
                    <p className="cart-item-price">{formatPrice(item.price)}</p>

                    <div className="cart-quantity">
                      <label htmlFor={`cart-qty-${item.productId}-${item.presentationId}`}>
                        Cantidad
                      </label>
                      <button
                        type="button"
                        aria-label={`Disminuir cantidad de ${item.name}`}
                        disabled={item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.presentationId,
                            item.quantity - 1,
                          )
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Aumentar cantidad de ${item.name}`}
                        disabled={item.quantity >= item.stock}
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.presentationId,
                            item.quantity + 1,
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-button"
                      onClick={() =>
                        removeFromCart(item.productId, item.presentationId)
                      }
                    >
                      Eliminar
                    </button>
                  </div>

                  <p className="cart-item-subtotal">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Resumen de compra</h2>

            <div className="cart-summary-row">
              <span>Productos</span>
              <span>{totalItems}</span>
            </div>

            <div className="cart-summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>

            <p className="cart-shipping-note">
              El costo de envío se calculará durante el proceso de compra.
            </p>

            <div className="cart-summary-total">
              <span>Total parcial</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>

            <button
              type="button"
              className="cart-checkout-button"
              onClick={() => navigate('/checkout')}
            >
              Continuar compra
            </button>

            <button
              type="button"
              className="cart-continue-button"
              onClick={() => navigate('/')}
            >
              Seguir comprando
            </button>

            <button
              type="button"
              className="cart-clear-button"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </aside>
        </section>
      )}
    </main>
  );
}

export default CartPage;

