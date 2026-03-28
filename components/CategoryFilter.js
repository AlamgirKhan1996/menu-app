"use client";

import { useRef } from "react";

export default function CategoryFilter({ categories, active, onChange, accentColor }) {
  const scrollRef = useRef(null);

  return (
    <div style={{
      position:      "sticky",
      top:            60,
      zIndex:         80,
      background:    "rgba(250,250,247,0.95)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom:  "1px solid rgba(0,0,0,0.05)",
    }}>
      <div
        ref={scrollRef}
        style={{
          display:         "flex",
          gap:              8,
          padding:         "12px 20px",
          overflowX:       "auto",
          scrollbarWidth:  "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <style>{`
          div::-webkit-scrollbar { display: none; }
          .cat-pill { position: relative; overflow: hidden; }
          .cat-pill::after {
            content: '';
            position: absolute;
            inset: 0;
            background: currentColor;
            opacity: 0;
            border-radius: inherit;
            transition: opacity 0.15s;
          }
          .cat-pill:active::after { opacity: 0.12; }
        `}</style>

        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className="cat-pill"
              style={{
                flexShrink:   0,
                padding:     "8px 18px",
                borderRadius: "var(--radius-pill)",
                border:      "none",
                fontSize:     13,
                fontWeight:   isActive ? 700 : 500,
                fontFamily:  "var(--font-body)",
                cursor:      "pointer",
                transition:  "all 0.22s var(--ease)",
                background:   isActive ? accentColor : "rgba(0,0,0,0.06)",
                color:        isActive ? "#fff" : "var(--ink-60)",
                transform:    isActive ? "scale(1.03)" : "scale(1)",
                boxShadow:    isActive ? `0 4px 16px ${accentColor}40` : "none",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
