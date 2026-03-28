"use client";

import { getItemCount } from "@/utils/whatsapp";

export default function Navbar({ client, cart, onCartOpen }) {
  const count = getItemCount(cart);

  return (
    <header style={{
      position:      "sticky",
      top:            0,
      zIndex:         90,
      background:    "rgba(250,250,247,0.92)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom:  "1px solid rgba(0,0,0,0.06)",
      padding:       "0 20px",
      height:         60,
      display:       "flex",
      alignItems:    "center",
      justifyContent: "space-between",
    }}>

      {/* Left: brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width:          36,
          height:         36,
          borderRadius:  "50%",
          background:    client.coverGradient,
          display:       "flex",
          alignItems:    "center",
          justifyContent: "center",
          fontSize:       18,
          flexShrink:     0,
        }}>
          {client.emoji}
        </div>
        <div>
          <div style={{
            fontFamily:    "var(--font-display)",
            fontWeight:     700,
            fontSize:       16,
            lineHeight:     1.1,
            letterSpacing: "-0.02em",
          }}>
            {client.name}
          </div>
          <div style={{
            fontSize:   11,
            color:     "var(--ink-60)",
            lineHeight:  1,
          }}>
            🕐 {client.hours}
          </div>
        </div>
      </div>

      {/* Right: cart button */}
      <button
        onClick={onCartOpen}
        style={{
          position:      "relative",
          display:       "flex",
          alignItems:    "center",
          gap:            8,
          background:    count > 0 ? "var(--green)" : "var(--cream-dark)",
          color:         count > 0 ? "#fff" : "var(--ink-60)",
          border:        "none",
          borderRadius:  "var(--radius-pill)",
          padding:       "9px 16px",
          fontFamily:    "var(--font-body)",
          fontWeight:     600,
          fontSize:       14,
          transition:    "background 0.3s var(--ease), color 0.3s var(--ease), transform 0.15s",
          cursor:        "pointer",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        aria-label={`View cart — ${count} items`}
      >
        <span style={{ fontSize: 16 }}>🛒</span>
        <span>Cart</span>
        {count > 0 && (
          <span style={{
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            width:           20,
            height:          20,
            borderRadius:   "50%",
            background:     "#fff",
            color:          "var(--green)",
            fontSize:        11,
            fontWeight:      800,
            animation:      "badgePop 0.3s var(--ease-bounce)",
          }}>
            {count}
          </span>
        )}
      </button>
    </header>
  );
}
