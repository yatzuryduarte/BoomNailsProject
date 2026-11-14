function InventoryStats({ inventory }) {
  const totalPresentations = inventory.length;

  const lowStock = inventory.filter(
    (item) => item.stock > 0 && item.stock <= item.minimumStock
  ).length;

  const outOfStock = inventory.filter(
    (item) => item.stock === 0
  ).length;

  const activePresentations = inventory.filter(
    (item) => item.productActive && item.presentationActive
  ).length;

  return (
    <div className="bn-stat-grid">
      <article className="bn-stat-card bn-stat-featured">
        <div className="bn-stat-top">
          <span>Presentaciones registradas</span>
          <span className="bn-stat-icon">▦</span>
        </div>

        <strong>{totalPresentations}</strong>

        <small>Variantes de productos</small>
      </article>

      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Stock bajo</span>
          <span className="bn-stat-icon">!</span>
        </div>

        <strong>{lowStock}</strong>

        <small>Presentaciones por reponer</small>
      </article>

      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Sin existencias</span>
          <span className="bn-stat-icon">×</span>
        </div>

        <strong>{outOfStock}</strong>

        <small>Presentaciones agotadas</small>
      </article>

      <article className="bn-stat-card">
        <div className="bn-stat-top">
          <span>Presentaciones activas</span>
          <span className="bn-stat-icon">✓</span>
        </div>

        <strong>{activePresentations}</strong>

        <small>Productos y presentaciones activos</small>
      </article>
    </div>
  );
}

export default InventoryStats;