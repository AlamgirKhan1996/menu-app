"use client";

import { useEffect, useState } from "react";

export default function HeroSection({ client }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      position: "relative",
      overflow: "hidden",
      color: "#fff",
    }}>

      {/* Banner Image */}
      <div style={{
        height: 200,
        background: client.coverImage
          ? `url(${client.coverImage}) center/cover no-repeat`
          : client.coverGradient,
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7))",
        }} />
      </div>

      {/* Info Row */}
      <div style={{
        background: "#fff",
        padding: "0 20px 20px",
        position: "relative",
      }}>

        {/* Logo - overlaps banner */}
        <div style={{
          width: 80, height: 80,
          borderRadius: 18,
          background: client.logo
            ? `url(${client.logo}) center/cover`
            : client.coverGradient,
          border: "4px solid #fff",
          marginTop: -40,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          boxShadow: "0 4px 20px rgba(0,0,0,.15)",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {!client.logo && client.emoji}
        </div>

        {/* Name + Tagline */}
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(22px, 5vw, 32px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: 6,
          color: "var(--ink)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "none" : "translateY(10px)",
          transition: "opacity .5s ease, transform .5s ease",
        }}>
          {client.name}
          {client.nameAr && (
            <span style={{ fontSize: "0.6em", color: "var(--ink-60)", marginLeft: 10, fontWeight: 400 }}>
              {client.nameAr}
            </span>
          )}
        </h1>

        {client.tagline && (
          <p style={{
            fontSize: 14,
            color: "var(--ink-60)",
            marginBottom: 14,
            lineHeight: 1.5,
          }}>
            {client.tagline}
          </p>
        )}

        {/* Trust Badges */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { icon: "⭐", text: `${client.rating} Rating` },
            { icon: "🕐", text: client.hours },
            { icon: "💬", text: "WhatsApp Order" },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "var(--cream-dark)",
              borderRadius: 99,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--ink-60)",
            }}>
              <span>{icon}</span>
              <span>{text}</span>
            </div>
          ))}

          {/* Status Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: client.isOpen !== false
              ? "rgba(37,211,102,.1)"
              : "rgba(239,68,68,.1)",
            borderRadius: 99,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 700,
            color: client.isOpen !== false ? "#25D366" : "#EF4444",
          }}>
            <span>{client.isOpen !== false ? "🟢" : "🔴"}</span>
            <span>{client.isOpen !== false ? "Open Now" : "Closed"}</span>
          </div>
        </div>
      </div>
    </section>
  );
}