"use client";

import { getOrderTotal, getItemCount } from "@/utils/whatsapp";

/**
 * StickyOrderBar — floats at the bottom when cart has items.
 * Tapping it opens the cart drawer.
 */
export default function StickyOrderBar({ cart, accentColor, onOpen }) {
  const total = getOrderTotal(cart);
  const count = getItemCount(cart);

  if (count === 0) return null;

  return (
    <div style={{
      position:   "fixed",
      bottom:      20,
      left:        "50%",
      transform:  "translateX(-50%)",
      zIndex:      150,
      width:      "calc(100% - 40px)",
      maxWidth:    480,
      animation:  "slideInUp 0.4s var(--ease-bounce)",
    }}>
      <button
        onClick={onOpen}
        style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          width:          "100%",
          padding:        "16px 20px",
          borderRadius:  "var(--radius-xl)",
          border:         "none",
          background:    "#25D366",
          color:         "#fff",
          fontFamily:    "var(--font-body)",
          cursor:        "pointer",
          boxShadow:     "0 12px 48px rgba(37,211,102,0.4), 0 4px 16px rgba(0,0,0,0.15)",
          transition:    "transform 0.2s var(--ease), box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform  = "translateY(-2px) scale(1.01)";
          e.currentTarget.style.boxShadow  = "0 18px 56px rgba(37,211,102,0.5), 0 6px 20px rgba(0,0,0,0.18)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform  = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow  = "0 12px 48px rgba(37,211,102,0.4), 0 4px 16px rgba(0,0,0,0.15)";
        }}
      >
        {/* Left: item count */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          width:           30,
          height:          30,
          borderRadius:   "50%",
          background:     "rgba(255,255,255,0.25)",
          fontWeight:      800,
          fontSize:        14,
          flexShrink:      0,
        }}>
          {count}
        </div>

        {/* Center: label */}
        <div style={{ fontWeight: 700, fontSize: 16 }}>
          View Order 💬
        </div>

        {/* Right: total */}
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight:  900,
          fontSize:    16,
          flexShrink:  0,
        }}>
          SAR {total}
        </div>
      </button>
    </div>
  );
}
