"use client";

import { useState } from "react";

export default function MenuCard({ item, qty, onAdd, onRemove, accentColor, index }) {
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    onAdd(item);
    setTimeout(() => setAdding(false), 380);
  };

  const gradients = [
    "linear-gradient(135deg, #FFF3E0, #FFE0B2)",
    "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
    "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
    "linear-gradient(135deg, #FCE4EC, #F8BBD0)",
    "linear-gradient(135deg, #F3E5F5, #E1BEE7)",
    "linear-gradient(135deg, #E0F2F1, #B2DFDB)",
  ];
  const cardGradient = gradients[index % gradients.length];

  return (
    <div
      style={{
        background:    "#fff",
        borderRadius:  "var(--radius-lg)",
        overflow:      "hidden",
        boxShadow:     "var(--shadow-card)",
        border:        "1px solid rgba(0,0,0,0.04)",
        transition:    "transform 0.25s var(--ease), box-shadow 0.25s var(--ease)",
        cursor:        "default",
        display:       "flex",
        flexDirection: "column",
        animation:     `fadeUp 0.5s var(--ease) ${index * 0.05}s both`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform  = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform  = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      {/* Food visual area */}
      <div style={{
        height:         120,
        background:     cardGradient,
        display:       "flex",
        alignItems:    "center",
        justifyContent: "center",
        fontSize:       56,
        position:      "relative",
        userSelect:    "none",
      }}>
        <span style={{
          filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
          animation: `float ${3 + (index % 3) * 0.5}s ease-in-out ${index * 0.2}s infinite`,
        }}>
          {item.emoji}
        </span>

        {/* Badges top-right */}
        <div style={{
          position:   "absolute",
          top:         10,
          right:       10,
          display:    "flex",
          flexDirection: "column",
          gap:         4,
          alignItems: "flex-end",
        }}>
          {item.popular && (
            <span style={{
              background:   "#FF6B35",
              color:        "#fff",
              fontSize:      10,
              fontWeight:    700,
              padding:      "3px 8px",
              borderRadius: "var(--radius-pill)",
              letterSpacing: "0.05em",
            }}>🔥 POPULAR</span>
          )}
          {item.new && (
            <span style={{
              background:   "#25D366",
              color:        "#fff",
              fontSize:      10,
              fontWeight:    700,
              padding:      "3px 8px",
              borderRadius: "var(--radius-pill)",
              letterSpacing: "0.05em",
            }}>✨ NEW</span>
          )}
          {item.spicy && (
            <span style={{
              background:   "#E63946",
              color:        "#fff",
              fontSize:      10,
              fontWeight:    700,
              padding:      "3px 8px",
              borderRadius: "var(--radius-pill)",
              letterSpacing: "0.05em",
            }}>🌶️ SPICY</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontFamily:    "var(--font-display)",
            fontWeight:     700,
            fontSize:       16,
            lineHeight:     1.2,
            letterSpacing: "-0.01em",
            marginBottom:   6,
            color:         "var(--ink)",
          }}>
            {item.name}
          </h3>
          <p style={{
            color:      "var(--ink-60)",
            fontSize:    13,
            lineHeight:  1.55,
            marginBottom: 14,
            display:    "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow:   "hidden",
          }}>
            {item.desc}
          </p>
        </div>

        {/* Price + controls */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginTop:      "auto",
        }}>
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight:  "bold",
            fontSize:    18,
            color:      "#FF6B35",
          }}>
            SAR {item.price}
          </span>

          {/* Quantity control / add button */}
          {qty === 0 ? (
            <button
              onClick={handleAdd}
              style={{
                display:       "flex",
                alignItems:    "center",
                justifyContent: "center",
                gap:            6,
                background:    adding ? "#25D366" : accentColor,
                color:         "#fff",
                border:        "none",
                borderRadius:  "var(--radius-pill)",
                padding:       "9px 18px",
                fontSize:       13,
                fontWeight:     700,
                fontFamily:    "var(--font-body)",
                cursor:        "pointer",
                transition:    "all 0.25s var(--ease-bounce)",
                transform:      adding ? "scale(0.95)" : "scale(1)",
                boxShadow:     `0 4px 16px ${accentColor}40`,
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
              Add
            </button>
          ) : (
            <div style={{
              display:       "flex",
              alignItems:    "center",
              gap:            2,
              background:    "var(--cream-dark)",
              borderRadius:  "var(--radius-pill)",
              padding:        2,
              animation:     "popIn 0.3s var(--ease-bounce)",
            }}>
              <button
                onClick={() => onRemove(item.id)}
                style={{
                  width:         30,
                  height:        30,
                  borderRadius: "50%",
                  border:        "none",
                  background:    "#fff",
                  color:        "var(--ink)",
                  fontSize:      18,
                  fontWeight:    700,
                  lineHeight:    1,
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent: "center",
                  cursor:        "pointer",
                  transition:   "transform 0.15s",
                  boxShadow:    "var(--shadow-sm)",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                −
              </button>

              <span style={{
                minWidth:   28,
                textAlign:  "center",
                fontWeight:  700,
                fontSize:    15,
                color:      "var(--ink)",
              }}>
                {qty}
              </span>

              <button
                onClick={handleAdd}
                style={{
                  width:         30,
                  height:        30,
                  borderRadius: "50%",
                  border:        "none",
                  background:   accentColor,
                  color:        "#fff",
                  fontSize:      18,
                  fontWeight:    700,
                  lineHeight:    1,
                  display:       "flex",
                  alignItems:    "center",
                  justifyContent: "center",
                  cursor:        "pointer",
                  transition:   "transform 0.15s",
                  boxShadow:    `0 2px 8px ${accentColor}50`,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
