"use client";

import { useEffect, useState } from "react";

export default function HeroSection({ client }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      position:   "relative",
      overflow:   "hidden",
      background:  client.coverGradient,
      padding:    "56px 24px 64px",
      color:      "#fff",
    }}>
      {/* Decorative circles */}
      <div style={{
        position:     "absolute", top: -60, right: -60,
        width:         220, height: 220, borderRadius: "50%",
        background:   "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />
      <div style={{
        position:     "absolute", bottom: -40, left: -40,
        width:         160, height: 160, borderRadius: "50%",
        background:   "rgba(255,255,255,0.04)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>

        {/* Emoji logo */}
        <div style={{
          width:          80, height: 80,
          borderRadius:  "var(--radius-xl)",
          background:    "rgba(255,255,255,0.12)",
          backdropFilter: "blur(20px)",
          border:        "1px solid rgba(255,255,255,0.18)",
          display:       "flex",
          alignItems:    "center",
          justifyContent: "center",
          fontSize:       42,
          marginBottom:   24,
          opacity:        loaded ? 1 : 0,
          transform:      loaded ? "none" : "scale(0.8)",
          transition:    "opacity 0.5s var(--ease), transform 0.5s var(--ease)",
          animation:     loaded ? "float 4s ease-in-out infinite 0.5s" : "none",
        }}>
          {client.emoji}
        </div>

        {/* Name */}
        <h1 style={{
          fontFamily:    "var(--font-display)",
          fontWeight:     900,
          fontSize:      "clamp(32px, 7vw, 56px)",
          lineHeight:     1.05,
          letterSpacing: "-0.03em",
          marginBottom:   10,
          opacity:        loaded ? 1 : 0,
          transform:      loaded ? "none" : "translateY(16px)",
          transition:    "opacity 0.6s var(--ease) 0.1s, transform 0.6s var(--ease) 0.1s",
        }}>
          {client.name}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize:   "clamp(15px, 3vw, 18px)",
          color:     "rgba(255,255,255,0.7)",
          lineHeight:  1.6,
          marginBottom: 28,
          maxWidth:    420,
          opacity:    loaded ? 1 : 0,
          transform:  loaded ? "none" : "translateY(16px)",
          transition: "opacity 0.6s var(--ease) 0.2s, transform 0.6s var(--ease) 0.2s",
        }}>
          {client.tagline}
        </p>

        {/* Trust badges */}
        <div style={{
          display:    "flex",
          gap:         10,
          flexWrap:   "wrap",
          opacity:    loaded ? 1 : 0,
          transform:  loaded ? "none" : "translateY(16px)",
          transition: "opacity 0.6s var(--ease) 0.3s, transform 0.6s var(--ease) 0.3s",
        }}>
          {[
            { icon: "⭐", text: `${client.rating} Rating` },
            { icon: "🕐", text: client.deliveryTime },
            { icon: "🚴", text: "Free Delivery" },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display:        "flex",
              alignItems:     "center",
              gap:             6,
              background:    "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border:        "1px solid rgba(255,255,255,0.16)",
              borderRadius:  "var(--radius-pill)",
              padding:       "7px 14px",
              fontSize:       13,
              fontWeight:     500,
            }}>
              <span style={{ fontSize: 14 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
