
import { useEffect, useState } from 'react';
import './AdminPaymentsPage.css';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Link } from 'react-router-dom';
import AdminSidebar from "./AdminSidebar";

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const money = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

function AdminPaymentsPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { credentials, login, logout } = useAdminAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openingReceipt, setOpeningReceipt] = useState(null);

  const [reviewingPayment, setReviewingPayment] = useState(null);

const reviewPayment = async (payment, action, reason = '') => {
  if (!credentials) return;

  const actionLabel = action === 'approve' ? 'aprobar' : 'rechazar';

  if (
    !window.confirm(
      `¿Confirmas que deseas ${actionLabel} el pago ${payment.orderNumber}?`
    )
  ) {
    return;
  }

  if (action === 'reject' && !reason.trim()) {
    setError('Debes indicar el motivo del rechazo.');
    return;
  }

    setReviewingPayment(payment.paymentId);
    setError('');
    setSuccess('');

  try {
    const response = await fetch(
      `${API_URL}/admin/payments/${payment.paymentId}/${action}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(
            `${credentials.email}:${credentials.password}`
          )}`,
          'Content-Type': 'application/json',
        },
        ...(action === 'reject'
          ? { body: JSON.stringify({ reason: reason.trim() }) }
          : {}),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `No fue posible ${actionLabel} el pago.`
      );
    }

    await loadPayments(credentials);
    setSuccess(data.message || 'Operación completada.');
  } catch (err) {
    setSuccess('');
    setError(err.message || 'Error al revisar el pago.');
  } finally {
    setReviewingPayment(null);
  }
};

  const loadPayments = async (auth) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/admin/payments/pending`, {
        headers: {
          Authorization: `Basic ${btoa(`${auth.email}:${auth.password}`)}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Credenciales incorrectas o acceso no autorizado.');
      }

      if (!response.ok) {
        throw new Error('No fue posible consultar los pagos pendientes.');
      }

      const data = await response.json();
      setPayments(data);
      login(auth);
      setPassword('');
    } catch (err) {
      logout();
      setPayments([]);
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (credentials) {
      loadPayments(credentials);
    }
    // La carga inicial se realiza al iniciar sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();

    const auth = { email: email.trim(), password };
    await loadPayments(auth);
  };

  const openReceipt = async (payment) => {
    if (!credentials || !payment.receiptPath) return;

    const preview = window.open('', '_blank');
    setOpeningReceipt(payment.paymentId);
    setError('');

    try {
      const baseUrl = API_URL.replace(/\/api\/?$/, '');
      const response = await fetch(
        `${baseUrl}${payment.receiptPath}`,
        {
          headers: {
            Authorization: `Basic ${btoa(
              `${credentials.email}:${credentials.password}`
            )}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('No fue posible abrir el comprobante.');
      }

      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);

      if (preview) {
        preview.location.href = fileUrl;
      } else {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.rel = 'noopener';
        link.click();
      }

      setTimeout(() => URL.revokeObjectURL(fileUrl), 60000);
    } catch (err) {
      preview?.close();
      setError(err.message || 'Error al abrir el comprobante.');
    } finally {
      setOpeningReceipt(null);
    }
  };

  if (!credentials) {
    return (
      <main className="bn-admin">
        <div className="bn-login-card">
          <div className="bn-brand">
            <span className="bn-brand-mark">B</span>
            <span>BOOM <strong>NAILS</strong></span>
          </div>

          <div className="bn-login-icon">✦</div>
          <p className="bn-eyebrow">PORTAL ADMINISTRATIVO</p>
          <h1>Bienvenida de nuevo</h1>
          <p className="bn-muted">
            Ingresa para gestionar los pagos y pedidos de tu tienda.
          </p>

          <form onSubmit={handleLogin} className="bn-login-form">
            <label htmlFor="admin-email">Correo electrónico</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              placeholder="admin@boomnails.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="bn-error">{error}</p>}

            <button className="bn-primary-button" disabled={loading}>
              {loading ? 'Verificando acceso...' : 'Ingresar al panel'}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="bn-login-footer">
            <span className="bn-lock">▣</span>
            Acceso exclusivo para administradores
          </p>
        </div>
      </main>
    );
  }

  const totalPending = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  
    return (
  <main className="bn-orders-layout">
    <AdminSidebar />

    <div className="bn-payments-content">
        <div className="bn-payments-topbar">
  <div>
    <strong>BOOM NAILS</strong>
    <small>Administración · Gestión de pagos</small>
  </div>

  <button
    className="bn-logout"
    onClick={() => {
      logout();
      setPayments([]);
      setEmail('');
      setPassword('');
    }}
  >
    Salir
  </button>
</div>

      <section className="bn-dashboard">
        <div className="bn-page-heading">
          <div>
            <p className="bn-eyebrow">CENTRO DE CONTROL</p>
            <h1>Revisión de pagos<span>.</span></h1>
            <p className="bn-muted">
              Verifica los comprobantes y controla las transferencias de tus clientes.
            </p>
          </div>

          <button
            className="bn-refresh-button"
            onClick={() => loadPayments(credentials)}
            disabled={loading}
          >
            ↻ <span>Actualizar</span>
          </button>
        </div>

        {error && <div className="bn-error-banner">{error}</div>}

        {success && (
            <div className="bn-success-banner" role="status">
                <span>✓</span>
                {success}
            </div>
        )}

        <div className="bn-stat-grid">
          <article className="bn-stat-card bn-stat-featured">
            <div className="bn-stat-top">
              <span>Pagos por revisar</span>
              <span className="bn-stat-icon">◷</span>
            </div>
            <strong>{payments.length}</strong>
            <small>Transferencias pendientes</small>
          </article>

          <article className="bn-stat-card">
            <div className="bn-stat-top">
              <span>Importe pendiente</span>
              <span className="bn-stat-icon">＄</span>
            </div>
            <strong className="bn-stat-money">{money(totalPending)}</strong>
            <small>Valor de los pagos listados</small>
          </article>

          <article className="bn-stat-card">
            <div className="bn-stat-top">
              <span>Método de pago</span>
              <span className="bn-stat-icon">↗</span>
            </div>
            <strong>Transferencia</strong>
            <small>Validación manual del comprobante</small>
          </article>
        </div>

        <section className="bn-payments-panel">
          <div className="bn-panel-heading">
            <div>
              <h2>Pagos pendientes</h2>
              <p>Revisa cada comprobante antes de confirmar el pedido.</p>
            </div>
            <span className="bn-count-pill">{payments.length} registros</span>
          </div>

          {loading ? (
            <div className="bn-empty-state">
              <span className="bn-spinner" />
              <p>Cargando información de pagos...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="bn-empty-state">
              <span className="bn-empty-icon">✓</span>
              <h3>Todo al día</h3>
              <p>No hay pagos pendientes de revisión.</p>
            </div>
          ) : (
            <div className="bn-table-wrap">
              <table className="bn-payments-table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Cliente</th>
                    <th>Fecha de envío</th>
                    <th>Importe</th>
                    <th>Estado</th>
                    <th>Comprobante</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.paymentId}>
                      <td>
                        <strong className="bn-order-number">
                          {payment.orderNumber}
                        </strong>
                        <small className="bn-subtext">
                          Pago #{payment.paymentId}
                        </small>
                      </td>

                      <td>
                        <strong>{payment.customerName}</strong>
                        <small className="bn-subtext">
                          {payment.customerEmail}
                        </small>
                      </td>

                      <td>
                        {payment.receiptUploadedAt
                          ? new Date(payment.receiptUploadedAt).toLocaleDateString(
                              'es-CO',
                              { day: '2-digit', month: 'short', year: 'numeric' }
                            )
                          : '—'}
                      </td>

                      <td>
                        <strong className="bn-amount">
                          {money(payment.amount)}
                        </strong>
                      </td>

                      <td>
                        <span className="bn-status">
                          <span />
                          Pendiente
                        </span>
                      </td>

                      <td>
                        <button
                          className="bn-receipt-button"
                          onClick={() => openReceipt(payment)}
                          disabled={openingReceipt === payment.paymentId}
                        >
                          {openingReceipt === payment.paymentId
                            ? 'Abriendo...'
                            : 'Ver comprobante ↗'}
                        </button>
                      </td>

                        <td>
                        <div className="bn-review-actions">
                            <button
                            className="bn-approve-button"
                            disabled={reviewingPayment === payment.paymentId}
                            onClick={() => reviewPayment(payment, 'approve')}
                            >
                            {reviewingPayment === payment.paymentId
                                ? 'Procesando...'
                                : 'Aprobar'}
                            </button>

                            <button
                            className="bn-reject-button"
                            disabled={reviewingPayment === payment.paymentId}
                            onClick={() => {
                                const reason = window.prompt(
                                'Indica el motivo del rechazo del comprobante:'
                                );

                                if (reason !== null) {
                                reviewPayment(payment, 'reject', reason);
                                }
                            }}
                            >
                            Rechazar
                            </button>
                        </div>
                        </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bn-panel-footer">
            <span>Los pagos solo se consideran aprobados tras su validación.</span>
            <span>BOOM NAILS · ADMIN</span>
          </div>
        </section>
      </section>
    </div>
    </main>
  );
}

export default AdminPaymentsPage;
