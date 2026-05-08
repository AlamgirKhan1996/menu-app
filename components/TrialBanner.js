"use client";

import { useState, useEffect } from "react";

export default function TrialBanner() {
  const [trial, setTrial] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard/trial");
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        if (!cancelled) setTrial(data);
      } catch (e) {
        // swallow — banner just won't render
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!trial || trial.status === "PAID" || dismissed) return null;

  // EXPIRED — Full block screen
  if (trial.status === "EXPIRED") {
    return (
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}>
        <div style={{
          background: "#0f1923",
          border: "1px solid rgba(239,68,68,.3)",
          borderRadius: 20,
          padding: "40px 32px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⏰</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
            Your Free Trial Has Ended
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 24 }}>
            Your 7-day free trial is over. Upgrade to keep your menu live and continue receiving orders.
          </p>

          {/* Pricing */}
          <div style={{
            background: "rgba(37,211,102,.08)",
            border: "1px solid rgba(37,211,102,.2)",
            borderRadius: 14,
            padding: "20px",
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 4 }}>
              Continue with
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              SAR 199
              <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,.4)" }}>/month</span>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
              Unlimited orders · AI Menu Writer · Analytics
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/966595632609?text=أريد ترقية حسابي في OrderFlow"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #25D366, #128C7E)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              textDecoration: "none",
              marginBottom: 12,
            }}
          >
            💬 Upgrade via WhatsApp
          </a>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            Contact Alamgir: +966 59 563 2609
          </div>
        </div>
      </div>
    );
  }

  // TRIAL — Top banner
  const urgency = trial.daysLeft <= 3;

  return (
    <div style={{
      background: urgency
        ? "linear-gradient(135deg, #EF4444, #DC2626)"
        : "linear-gradient(135deg, #F59E0B, #D97706)",
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>{urgency ? "🚨" : "⏳"}</span>
        <div>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
            {urgency
              ? `Only ${trial.daysLeft} day${trial.daysLeft !== 1 ? "s" : ""} left in your trial!`
              : `Free trial: ${trial.daysLeft} days remaining`}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.8)", marginLeft: 8 }}>
            Upgrade to keep everything running
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a
          href="https://wa.me/966595632609?text=أريد ترقية حسابي في OrderFlow"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "7px 16px",
            background: "rgba(0,0,0,.25)",
            border: "1px solid rgba(255,255,255,.3)",
            borderRadius: 20,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          💬 Upgrade Now
        </a>
        {!urgency && (
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.6)",
              cursor: "pointer",
              fontSize: 18,
              padding: "0 4px",
            }}
          >×</button>
        )}
      </div>
    </div>
  );
}