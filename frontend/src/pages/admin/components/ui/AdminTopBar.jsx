import "./AdminCommon.css";

function AdminTopBar({ section, onLogout }) {
  return (
    <div className="bn-admin-topbar">
      <div>
        <strong>BOOM NAILS</strong>
        <small>Administración · {section}</small>
      </div>

      <button
        type="button"
        className="bn-logout"
        onClick={onLogout}
      >
        Salir
      </button>
    </div>
  );
}

export default AdminTopBar;