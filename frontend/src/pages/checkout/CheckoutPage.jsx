
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CheckoutPage.css';


function formatPrice(price) {
  return Number(price).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function CheckoutPage() {
  const { cartItems, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    correo: '',
    telefono: '',
    direccion: '',
    departamento: '',
    ciudad: '',
    codigoPostal: '',
    pais: 'Colombia',
    observaciones: '',
  });
  const [comprobante, setComprobante] = useState(null);
  const [error, setError] = useState('');

  const [enviando, setEnviando] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

    async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Tu carrito está vacío. Agrega productos antes de continuar.');
      return;
    }


    
if (paymentMethod === 'whatsapp') {
  const lines = cartItems.map(
    (item) =>
      `- ${item.name} (${item.presentationName}) x ${item.quantity}: ${formatPrice(item.price * item.quantity)}`
  );

  const message = [
    'Hola, quiero consultar este pedido de Boom Nails:',
    ...lines,
    `Total: ${formatPrice(totalPrice)}`,
    '',
    `Nombre: ${form.nombre}`,
    `Teléfono: ${form.telefono}`,
    `Ciudad: ${form.ciudad}`,
    `Dirección: ${form.direccion}`,
    `Correo: ${form.correo}`,
  ].join('\n');

  const whatsappUrl =
    `https://wa.me/message/2H5Q65Q5L4RCJ1?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  return;
}

if (paymentMethod === 'transferencia') {
  navigate('/checkout/transferencia', {
    state: { form },
  });
  return;
}


    setEnviando(true);

    try {
        const order = {
            customerId: null,
            customerName: form.nombre.trim(),
            customerEmail: form.correo.trim(),
            customerPhone: form.telefono.trim(),
            shippingAddress: form.direccion.trim(),
            shippingCity: form.ciudad.trim(),
            shippingDepartment: form.departamento.trim(),
            shippingCountry: form.pais,
            deliveryNote: form.observaciones.trim(),
            items: cartItems.map((item) => ({
            presentationId: Number(item.presentationId),
            quantity: Number(item.quantity),
            })),
        };

        const data = new FormData();
        data.append('order', JSON.stringify(order));
        data.append('receipt', comprobante);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

        const response = await fetch(`${apiUrl}/checkout`, {
            method: 'POST',
            body: data,
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
            result.message || result.error ||
            'No fue posible registrar el pedido. Verifica los datos e inténtalo nuevamente.',
            );
        }

        navigate(`/order-confirmation/${result.orderId}`, {
        state: {
            orderId: result.orderId,
            message: result.message,
        },
        });
        } catch (err) {
        setError(err.message || 'Ocurrió un error al enviar el pedido.');
        } finally {
        setEnviando(false);
        }
  }

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos antes de iniciar la compra.</p>
          <button type="button" onClick={() => navigate('/')}>
            Volver al catálogo
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <p className="home-eyebrow">BOOM NAILS</p>
        <h1>Finalizar compra</h1>
        <p>Completa tus datos para coordinar el envío de tu pedido.</p>
      </header>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <section className="checkout-section">
            <h2>1. Datos personales</h2>

            <label htmlFor="nombre">Nombre completo *</label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <label htmlFor="documento">Documento de identidad (opcional)</label>
            <input
              id="documento"
              name="documento"
              value={form.documento}
              onChange={handleChange}
            />

            <label htmlFor="correo">Correo electrónico *</label>
            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="telefono">Teléfono *</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
          </section>

          <section className="checkout-section">
            <h2>2. Dirección de envío</h2>

            <label htmlFor="pais">País *</label>
            <select
              id="pais"
              name="pais"
              value={form.pais}
              onChange={handleChange}
              required
            >
              <option value="Colombia">Colombia</option>
            </select>

            <label htmlFor="departamento">Departamento *</label>
            <input
              id="departamento"
              name="departamento"
              value={form.departamento}
              onChange={handleChange}
              autoComplete="address-level1"
              required
            />

            <label htmlFor="ciudad">Ciudad o municipio *</label>
            <input
              id="ciudad"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              autoComplete="address-level2"
              required
            />

            <label htmlFor="direccion">Dirección completa *</label>
            <input
              id="direccion"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              autoComplete="street-address"
              placeholder="Calle, carrera, número, apartamento..."
              required
            />

            <label htmlFor="codigoPostal">Código postal (opcional)</label>
            <input
              id="codigoPostal"
              name="codigoPostal"
              value={form.codigoPostal}
              onChange={handleChange}
              autoComplete="postal-code"
            />

            <label htmlFor="observaciones">Indicaciones para la entrega</label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={3}
            />
          </section>

          <section className="checkout-section">
            <h2>3. Método de pago</h2>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={paymentMethod === 'transferencia'}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span>
                <strong>Transferencia bancaria</strong>
                <small>Consulta los datos bancarios y adjunta tu comprobante en el siguiente paso.</small>
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="whatsapp"
                checked={paymentMethod === 'whatsapp'}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />
              <span>
                <strong>Continuar por WhatsApp</strong>
                <small>Consulta tu pedido con nuestro equipo. No se registra como compra finalizada.</small>
              </span>
            </label>

            


          </section>

          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="checkout-submit-button"
            disabled={enviando}
            >
                {paymentMethod === 'whatsapp'
                  ? 'Continuar por WhatsApp'
                  : 'Continuar a transferencia'}
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Resumen del pedido</h2>

          {cartItems.map((item) => (
            <div
              className="checkout-summary-item"
              key={`${item.productId}-${item.presentationId}`}
            >
              <span>
                {item.name} × {item.quantity}
                <small>{item.presentationName}</small>
              </span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}

          <div className="checkout-summary-total">
            <span>{totalItems} unidades</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </div>

          <p>El costo de envío se confirmará según tu dirección.</p>

          <button
            type="button"
            className="checkout-back-button"
            onClick={() => navigate('/cart')}
          >
            Volver al carrito
          </button>
        </aside>
      </div>
    </main>
  );
}

export default CheckoutPage;
