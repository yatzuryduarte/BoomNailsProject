
import { Link, useLocation, useParams } from 'react-router-dom';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();

  const message =
    location.state?.message ||
    'Tu pedido fue registrado y el comprobante quedó pendiente de revisión.';

  return (
    <main className="order-confirmation-page">
      <section className="order-confirmation-card">
        <h1>¡Gracias por tu pedido!</h1>

        <p>{message}</p>

        <p>
          <strong>Número de pedido:</strong> {orderId}
        </p>

        <p>
          Tu comprobante de transferencia está pendiente de revisión.
          El pedido no se considera pagado hasta que el administrador
          confirme el pago.
        </p>

        <Link to="/" className="checkout-submit-button">
          Volver a la tienda
        </Link>
      </section>
    </main>
  );
}

export default OrderConfirmationPage;
