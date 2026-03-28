import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--cream)",
      padding: "32px",
      textAlign: "center",
      gap: 16,
    }}>
      <div style={{ fontSize: 72 }}>🍽️</div>
      <h1 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 900,
        fontSize: "clamp(28px, 5vw, 48px)",
        color: "var(--ink)",
      }}>
        Restaurant not found
      </h1>
      <p style={{ color: "var(--ink-60)", fontSize: 16, maxWidth: 380 }}>
        This restaurant link doesn't exist or may have moved. Please check the URL and try again.
      </p>
      <Link
        href="/"
        style={{
          marginTop: 8,
          background: "#25D366",
          color: "#fff",
          padding: "12px 28px",
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Go Home
      </Link>
    </div>
  );
}
