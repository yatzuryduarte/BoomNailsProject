
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  FileCheck,
  ShieldCheck,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';

import './OrderConfirmationPage.css';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();

  const message =
    location.state?.message ||
    'Tu pedido fue registrado y el comprobante quedó pendiente de revisión.';

  return (
    <main className="order-confirmation-page">
      <section className="order-confirmation-card">

        <div className="confirmation-success-icon">
          <CheckCircle2 size={48} />
        </div>

        <p className="confirmation-brand">BOOM NAILS</p>

        <h1>¡Gracias por tu pedido!</h1>

        <p className="confirmation-subtitle">
          {message}
        </p>

        <div className="confirmation-order-number">
          <span>NÚMERO DE PEDIDO</span>
          <strong>#{orderId}</strong>
          <span className="confirmation-status">
            <Clock3 size={16} />
            Pago pendiente de revisión
          </span>
        </div>

        <div className="confirmation-notice">
          <ShieldCheck size={23} />
          <div>
            <strong>Tu comprobante está en revisión</strong>
            <p>
              Hemos recibido tu comprobante de transferencia.
              El pedido no se considera pagado hasta que nuestro
              administrador confirme el pago.
            </p>
          </div>
        </div>

        <div className="confirmation-next-steps">
          <h2>¿Qué sigue ahora?</h2>

          <div className="confirmation-step">
            <div className="confirmation-step-icon">
              <FileCheck size={21} />
            </div>
            <div>
              <strong>Pedido recibido</strong>
              <p>Registramos tu pedido y recibimos el comprobante.</p>
            </div>
          </div>

          <div className="confirmation-step">
            <div className="confirmation-step-icon">
              <ShieldCheck size={21} />
            </div>
            <div>
              <strong>Validación del pago</strong>
              <p>El administrador revisará la transferencia.</p>
            </div>
          </div>

          <div className="confirmation-step">
            <div className="confirmation-step-icon">
              <PackageCheck size={21} />
            </div>
            <div>
              <strong>Preparación del pedido</strong>
              <p>
                Una vez confirmado el pago, podremos preparar
                tu pedido para el envío.
              </p>
            </div>
          </div>
        </div>

        <Link to="/" className="confirmation-store-button">
          <ShoppingBag size={19} />
          Volver a la tienda
        </Link>

        <p className="confirmation-footer">
          Gracias por elegir BOOM NAILS 💙
        </p>

      </section>
    </main>
  );
}

export default OrderConfirmationPage;
