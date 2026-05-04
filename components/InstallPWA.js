"use client";

import { useState, useEffect } from "react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (installed || !show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      left: 16, right: 16,
      background: "linear-gradient(135deg, #0f1923, #1a2a1a)",
      border: "1px solid rgba(37,211,102,.3)",
      borderRadius: 16,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      zIndex: 200,
      boxShadow: "0 8px 40px rgba(0,0,0,.5)",
      animation: "slideInUp .4s ease",
    }}>
      <div style={{
        width: 48, height: 48,
        background: "#25D366",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 24,
        flexShrink: 0,
      }}>💬</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginBottom: 2 }}>
          Install OrderFlow App
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>
          Add to home screen for quick access
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setShow(false)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.08)",
            border: "none", borderRadius: 8,
            color: "rgba(255,255,255,.5)",
            fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Later
        </button>
        <button
          onClick={async () => {
            if (!prompt) return;
            prompt.prompt();
            const { outcome } = await prompt.userChoice;
            if (outcome === "accepted") setInstalled(true);
            setShow(false);
          }}
          style={{
            padding: "8px 14px",
            background: "#25D366",
            border: "none", borderRadius: 8,
            color: "#000", fontSize: 12,
            fontWeight: 800, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Install ✓
        </button>
      </div>
    </div>
  );
}