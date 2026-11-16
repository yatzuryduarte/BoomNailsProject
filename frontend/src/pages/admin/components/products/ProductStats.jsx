import { formatCurrency } from "../../../../utils/formatters";

export default function ProductStats({ products }) {
  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.active
  ).length;

  const inactiveProducts = products.filter(
    (product) => !product.active
  ).length;

  const totalStockValue = products.reduce((total, product) => {
    const productStock = (product.presentations || []).reduce(
      (sum, presentation) =>
        sum +
        (presentation.stock || 0) *
          (presentation.retailPrice || 0),
      0
    );

    return total + productStock;
  }, 0);

  return (
    <section className="bn-stat-grid bn-products-stats">
      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Total productos</span>
          <span className="bn-stat-icon">◉</span>
        </div>

        <strong>{totalProducts}</strong>

        <small>Productos registrados en el catálogo</small>
      </article>

      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Productos activos</span>
          <span className="bn-stat-icon">✓</span>
        </div>

        <strong>{activeProducts}</strong>

        <small>Disponibles actualmente en la tienda</small>
      </article>

      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Productos inactivos</span>
          <span className="bn-stat-icon">○</span>
        </div>

        <strong>{inactiveProducts}</strong>

        <small>Productos temporalmente desactivados</small>
      </article>

      <article className="bn-stat-card bn-stat-featured">
        <div className="bn-stat-top">
          <span>Valor en inventario</span>
          <span className="bn-stat-icon">$</span>
        </div>

        <strong className="bn-stat-money">
          {formatCurrency(totalStockValue)}
        </strong>

        <small>Valor comercial estimado del stock</small>
      </article>
    </section>
  );
}