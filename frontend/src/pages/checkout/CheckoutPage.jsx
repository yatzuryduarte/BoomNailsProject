import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CheckoutPage.css';

const INITIAL_FORM = {
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
};

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
  const location = useLocation();

  /*
   * Si el usuario viene desde TransferPage,
   * recuperamos los datos que ya había diligenciado.
   */
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    ...(location.state?.form || {}),
  }));

  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [error, setError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  }

  function validateForm() {
    const requiredFields = [
      {
        field: 'nombre',
        message: 'Ingresa tu nombre completo.',
      },
      {
        field: 'correo',
        message: 'Ingresa tu correo electrónico.',
      },
      {
        field: 'telefono',
        message: 'Ingresa tu número de teléfono.',
      },
      {
        field: 'departamento',
        message: 'Ingresa tu departamento.',
      },
      {
        field: 'ciudad',
        message: 'Ingresa tu ciudad o municipio.',
      },
      {
        field: 'direccion',
        message: 'Ingresa tu dirección de envío.',
      },
    ];

    for (const item of requiredFields) {
      if (!form[item.field].trim()) {
        return item.message;
      }
    }

    const email = form.correo.trim();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return 'Ingresa un correo electrónico válido.';
    }

    const phone = form.telefono.trim();

    if (phone.length < 7) {
      return 'Ingresa un número de teléfono válido.';
    }

    return '';
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError(
        'Tu carrito está vacío. Agrega productos antes de continuar.'
      );
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * WHATSAPP
     *
     * Este flujo NO crea un pedido.
     * Solamente envía la consulta al equipo de Boom Nails.
     */
    if (paymentMethod === 'whatsapp') {
      const lines = cartItems.map(
        (item) =>
          `- ${item.name} (${item.presentationName}) x ${item.quantity}: ${formatPrice(
            item.price * item.quantity
          )}`
      );

      const message = [
        'Hola, quiero consultar este pedido de Boom Nails:',
        '',
        ...lines,
        '',
        `Total: ${formatPrice(totalPrice)}`,
        '',
        `Nombre: ${form.nombre.trim()}`,
        `Teléfono: ${form.telefono.trim()}`,
        `Ciudad: ${form.ciudad.trim()}`,
        `Dirección: ${form.direccion.trim()}`,
        `Correo: ${form.correo.trim()}`,
      ].join('\n');

      const whatsappUrl =
        `https://wa.me/message/2H5Q65Q5L4RCJ1?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        whatsappUrl,
        '_blank',
        'noopener,noreferrer'
      );

      return;
    }

    /*
     * TRANSFERENCIA
     *
     * No creamos el pedido todavía.
     * Primero llevamos al cliente a la pantalla donde
     * realizará la transferencia y adjuntará el comprobante.
     */
    if (paymentMethod === 'transferencia') {
      navigate('/checkout/transferencia', {
        state: {
          form: {
            ...form,
            nombre: form.nombre.trim(),
            documento: form.documento.trim(),
            correo: form.correo.trim(),
            telefono: form.telefono.trim(),
            direccion: form.direccion.trim(),
            departamento: form.departamento.trim(),
            ciudad: form.ciudad.trim(),
            codigoPostal: form.codigoPostal.trim(),
            pais: form.pais,
            observaciones: form.observaciones.trim(),
          },
        },
      });
    }
  }

  /*
   * Carrito vacío
   */
  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <h1>Tu carrito está vacío</h1>

          <p>
            Agrega productos antes de iniciar la compra.
          </p>

          <button
            type="button"
            onClick={() => navigate('/')}
          >
            Volver al catálogo
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <header className="checkout-header">
        <p className="home-eyebrow">
          BOOM NAILS
        </p>

        <h1>Finalizar compra</h1>

        <p>
          Completa tus datos para coordinar el envío
          de tu pedido.
        </p>
      </header>

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          {/* ========================= */}
          {/* 1. DATOS PERSONALES */}
          {/* ========================= */}

          <section className="checkout-section">
            <h2>1. Datos personales</h2>

            <label htmlFor="nombre">
              Nombre completo *
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <label htmlFor="documento">
              Documento de identidad (opcional)
            </label>

            <input
              id="documento"
              name="documento"
              type="text"
              value={form.documento}
              onChange={handleChange}
              autoComplete="off"
            />

            <label htmlFor="correo">
              Correo electrónico *
            </label>

            <input
              id="correo"
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <label htmlFor="telefono">
              Teléfono *
            </label>

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

          {/* ========================= */}
          {/* 2. DIRECCIÓN */}
          {/* ========================= */}

          <section className="checkout-section">
            <h2>2. Dirección de envío</h2>

            <label htmlFor="pais">
              País *
            </label>

            <select
              id="pais"
              name="pais"
              value={form.pais}
              onChange={handleChange}
              required
            >
              <option value="Colombia">
                Colombia
              </option>
            </select>

            <label htmlFor="departamento">
              Departamento *
            </label>

            <input
              id="departamento"
              name="departamento"
              type="text"
              value={form.departamento}
              onChange={handleChange}
              autoComplete="address-level1"
              required
            />

            <label htmlFor="ciudad">
              Ciudad o municipio *
            </label>

            <input
              id="ciudad"
              name="ciudad"
              type="text"
              value={form.ciudad}
              onChange={handleChange}
              autoComplete="address-level2"
              required
            />

            <label htmlFor="direccion">
              Dirección completa *
            </label>

            <input
              id="direccion"
              name="direccion"
              type="text"
              value={form.direccion}
              onChange={handleChange}
              autoComplete="street-address"
              placeholder="Calle, carrera, número, apartamento..."
              required
            />

            <label htmlFor="codigoPostal">
              Código postal (opcional)
            </label>

            <input
              id="codigoPostal"
              name="codigoPostal"
              type="text"
              value={form.codigoPostal}
              onChange={handleChange}
              autoComplete="postal-code"
            />

            <label htmlFor="observaciones">
              Indicaciones para la entrega
            </label>

            <textarea
              id="observaciones"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={3}
              placeholder="Apartamento, conjunto, portería, referencias..."
            />
          </section>

          {/* ========================= */}
          {/* 3. MÉTODO DE PAGO */}
          {/* ========================= */}

          <section className="checkout-section">
            <h2>3. Método de pago</h2>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={
                  paymentMethod === 'transferencia'
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
              />

              <span>
                <strong>
                  Transferencia bancaria
                </strong>

                <small>
                  Consulta los datos bancarios y
                  adjunta tu comprobante en el
                  siguiente paso.
                </small>
              </span>
            </label>

            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="whatsapp"
                checked={
                  paymentMethod === 'whatsapp'
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
              />

              <span>
                <strong>
                  Continuar por WhatsApp
                </strong>

                <small>
                  Consulta tu pedido con nuestro
                  equipo. No se registra como compra
                  finalizada.
                </small>
              </span>
            </label>
          </section>

          {/* ========================= */}
          {/* ERROR */}
          {/* ========================= */}

          {error && (
            <p
              className="checkout-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* ========================= */}
          {/* BOTÓN PRINCIPAL */}
          {/* ========================= */}

          <button
            type="submit"
            className="checkout-submit-button"
          >
            {paymentMethod === 'whatsapp'
              ? 'Continuar por WhatsApp'
              : 'Continuar a transferencia'}
          </button>
        </form>

        {/* ========================= */}
        {/* RESUMEN DEL PEDIDO */}
        {/* ========================= */}

        <aside className="checkout-summary">
          <h2>Resumen del pedido</h2>

          {cartItems.map((item) => (
            <div
              className="checkout-summary-item"
              key={`${item.productId}-${item.presentationId}`}
            >
              <span>
                {item.name} × {item.quantity}

                <small>
                  {item.presentationName}
                </small>
              </span>

              <strong>
                {formatPrice(
                  item.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <div className="checkout-summary-total">
            <span>
              {totalItems} unidades
            </span>

            <strong>
              {formatPrice(totalPrice)}
            </strong>
          </div>

          <p>
            El costo de envío se confirmará según
            tu dirección.
          </p>

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