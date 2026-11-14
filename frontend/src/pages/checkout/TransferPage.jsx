
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { apiRequest } from '../../services/api';
import './TransferPage.css';
import { formatCurrency } from "../../utils/formatters";


function TransferPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalItems, totalPrice } = useCart();

  const form = location.state?.form;

  const [comprobante, setComprobante] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  if (!form || cartItems.length === 0) {
    return (
      <main className="transfer-page">
        <h1>No encontramos los datos de tu compra</h1>
        <p>Regresa al checkout para completar tus datos.</p>
        <button onClick={() => navigate('/checkout')}>
          Volver al checkout
        </button>
      </main>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!comprobante) {
      setError('Adjunta el comprobante de transferencia.');
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
    ];

    if (!allowedTypes.includes(comprobante.type)) {
      setError('El archivo debe ser JPG, PNG o PDF.');
      return;
    }

    if (comprobante.size > 5 * 1024 * 1024) {
      setError('El comprobante no puede superar los 5 MB.');
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

      const result = await apiRequest('/checkout', {
        method: 'POST',
        body: data,
      });

      navigate(`/order-confirmation/${result.orderId}`, {
        state: {
          orderId: result.orderId,
          message: result.message,
        },
      });
    } catch (err) {
      setError(
        err.message || 'Ocurrió un error al enviar el comprobante.'
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="transfer-page">
      <header className="transfer-header">
        <p>BOOM NAILS</p>
        <h1>Transferencia bancaria</h1>
        <span>
          Realiza tu pago y adjunta el comprobante para validar tu pedido.
        </span>
      </header>

      <div className="transfer-layout">
        <section className="transfer-card">
          <h2>Datos para realizar tu pago</h2>

          <img
            className="transfer-qr"
            src="/images/qr-bancolombia.jpeg"
            alt="Código QR de pago Boom Nails"
          />

          <div className="transfer-data">
            <span>Banco</span>
            <strong>Bancolombia</strong>

            <span>Tipo de cuenta</span>
            <strong>Cuenta de ahorros</strong>

            <span>Número de cuenta</span>
            <div className="transfer-account">
              <strong>58200021868</strong>
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText('58200021868')
                }
              >
                Copiar
              </button>
            </div>

            <span>Titular</span>
            <strong>Yatzury Niño</strong>
          </div>

          <p className="transfer-warning">
            Verifica los datos del destinatario antes de confirmar
            la transferencia. Tu pedido quedará pendiente hasta
            que el administrador valide el pago.
          </p>

          <form onSubmit={handleSubmit}>
            <h2>Adjuntar comprobante</h2>

            <label htmlFor="receipt">
              Comprobante (JPG, PNG o PDF, máximo 5 MB)
            </label>

            <input
              id="receipt"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(event) =>
                setComprobante(event.target.files?.[0] || null)
              }
              required
            />

            {comprobante && (
              <p>Archivo seleccionado: {comprobante.name}</p>
            )}

            {error && (
              <p className="transfer-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="transfer-submit"
            >
              {enviando
                ? 'Enviando comprobante...'
                : 'Enviar comprobante'}
            </button>
          </form>
        </section>

        <aside className="transfer-summary">
          <h2>Resumen del pedido</h2>

          {cartItems.map((item) => (
            <div
              className="transfer-summary-item"
              key={`${item.productId}-${item.presentationId}`}
            >
              <span>
                {item.name} × {item.quantity}
                <small>{item.presentationName}</small>
              </span>

              <strong>
                {formatCurrency(item.price * item.quantity)}
              </strong>
            </div>
          ))}

          <div className="transfer-total">
            <span>{totalItems} unidades</span>
            <strong>{formatCurrency(totalPrice)}</strong>
          </div>

          <p>El costo de envío se confirmará según tu dirección.</p>

          <button
            type="button"
            onClick={() => navigate('/checkout', { state: { form } })}
          >
            Volver a datos de envío
          </button>
        </aside>
      </div>
    </main>
  );
}

export default TransferPage;
