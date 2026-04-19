export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
          <h1 style={{ fontSize: "4rem", fontWeight: "bold", marginBottom: "1rem" }}>404</h1>
          <p style={{ fontSize: "1.25rem", color: "#6b7280" }}>Page not found</p>
          <a href="/" style={{ marginTop: "1.5rem", color: "#3b82f6", textDecoration: "underline" }}>Go home</a>
        </div>
      </body>
    </html>
  );
}
