"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function QRPage() {
  const { data: session } = useSession();
  const [menuUrl, setMenuUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef(null);

  useEffect(() => {
    if (session?.user?.restaurantSlug) {
      const url = `${window.location.origin}/${session.user.restaurantSlug}`;
      setMenuUrl(url);

      // Load QR library dynamically
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.onload = () => {
        if (qrRef.current) {
          qrRef.current.innerHTML = "";
          new window.QRCode(qrRef.current, {
            text: url,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: window.QRCode.CorrectLevel.H,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, [session]);

  function copyLink() {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadQR() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session?.user?.restaurantSlug}-qr-code.png`;
    a.click();
  }

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", color: "#fff", maxWidth: 600 }}>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📱 QR Code</h1>
      <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 32 }}>
        Print this QR code and place it on your tables. Customers scan → menu opens instantly.
      </p>

      {/* QR Card */}
      <div style={{
        background: "#111416",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
        marginBottom: 20,
      }}>
        {/* QR Code */}
        <div style={{
          display: "inline-block",
          background: "#fff",
          padding: 16,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <div ref={qrRef} />
        </div>

        {/* Restaurant Name */}
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
          {session?.user?.restaurantName}
        </div>
        <div style={{ color: "rgba(255,255,255,.4)", fontSize: 13, marginBottom: 24 }}>
          Scan to view menu & order via WhatsApp
        </div>

        {/* Menu URL */}
        <div style={{
          background: "#0A0C0E",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 13,
          color: "#25D366",
          fontFamily: "monospace",
          wordBreak: "break-all",
          marginBottom: 20,
          textAlign: "left",
        }}>
          {menuUrl}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={copyLink}
            style={{
              flex: 1,
              padding: "12px",
              background: copied ? "rgba(37,211,102,.15)" : "rgba(255,255,255,.06)",
              border: copied ? "1px solid rgba(37,211,102,.3)" : "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              color: copied ? "#25D366" : "rgba(255,255,255,.7)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Link"}
          </button>
          <button
            onClick={downloadQR}
            style={{
              flex: 1,
              padding: "12px",
              background: "#25D366",
              border: "none",
              borderRadius: 8,
              color: "#000",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ⬇️ Download QR
          </button>
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: "rgba(37,211,102,.06)",
        border: "1px solid rgba(37,211,102,.15)",
        borderRadius: 12,
        padding: 20,
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#25D366", marginBottom: 12 }}>
          💡 How to use your QR code:
        </div>
        {[
          "Print it and place on every table",
          "Add it to your packaging and bags",
          "Share the link on Instagram bio",
          "Send to customers on WhatsApp",
          "Put on your entrance door",
        ].map((tip, i) => (
          <div key={i} style={{
            display: "flex", gap: 8,
            fontSize: 13,
            color: "rgba(255,255,255,.6)",
            marginBottom: 6,
          }}>
            <span style={{ color: "#25D366" }}>✓</span>
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}