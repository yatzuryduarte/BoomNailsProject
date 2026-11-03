function AdminAccessDenied() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        background: "#F8FBFF",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          padding: "45px",
          borderRadius: "20px",
          boxShadow: "0 4px 20px rgba(24, 54, 100, 0.10)",
          maxWidth: "450px",
          width: "100%",
        }}
      >
        <h2 style={{ color: "#102957", marginBottom: "12px" }}>
          Acceso restringido
        </h2>

        <p style={{ color: "#64748B", marginBottom: "25px" }}>
          Debes iniciar sesión para acceder al panel de administración.
        </p>

        <a
          href="/admin/payments"
          style={{
            display: "inline-block",
            background: "#F72F91",
            color: "#FFFFFF",
            padding: "13px 25px",
            borderRadius: "12px",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          Ir a iniciar sesión
        </a>
      </div>
    </main>
  );
}

export default AdminAccessDenied;