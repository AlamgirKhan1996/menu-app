"use client";

import { formatOrderMessage, buildWhatsAppLink, getOrderTotal, getItemCount } from "@/utils/whatsapp";
import { deleteFromCart } from "@/utils/cart";

function CartItem({ item, onAdd, onRemove, onDelete, accentColor }) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      gap:             12,
      padding:        "14px 0",
      borderBottom:   "1px solid rgba(0,0,0,0.05)",
      animation:      "fadeUp 0.3s var(--ease)",
    }}>
      {/* Emoji avatar */}
      <div style={{
        width:          46,
        height:         46,
        borderRadius:  "var(--radius-md)",
        background:    "var(--cream-dark)",
        display:       "flex",
        alignItems:    "center",
        justifyContent: "center",
        fontSize:       22,
        flexShrink:     0,
      }}>
        {item.emoji}
      </div>

      {/* Name + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight:  600,
          fontSize:    14,
          lineHeight:  1.2,
          overflow:   "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.name}
        </div>
        <div style={{ color: "var(--ink-60)", fontSize: 13, marginTop: 3 }}>
          SAR {item.price} × {item.qty} = <strong style={{ color: "var(--ink)" }}>SAR {item.price * item.qty}</strong>
        </div>
      </div>

      {/* Qty controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onRemove(item.id)}
          style={{
            width:         28, height: 28,
            borderRadius: "50%", border: "1px solid rgba(0,0,0,0.1)",
            background:   "#fff", color: "var(--ink)",
            fontSize:      16, fontWeight: 700,
            display:       "flex", alignItems: "center", justifyContent: "center",
            cursor:        "pointer", transition: "all 0.15s",
          }}
        >−</button>

        <span style={{ minWidth: 20, textAlign: "center", fontWeight: 700, fontSize: 14 }}>
          {item.qty}
        </span>

        <button
          onClick={() => onAdd(item)}
          style={{
            width:         28, height: 28,
            borderRadius: "50%", border: "none",
            background:   accentColor, color: "#fff",
            fontSize:      16, fontWeight: 700,
            display:       "flex", alignItems: "center", justifyContent: "center",
            cursor:        "pointer", transition: "all 0.15s",
            boxShadow:    `0 2px 8px ${accentColor}50`,
          }}
        >+</button>

        {/* Delete */}
        <button
          onClick={() => onDelete(item.id)}
          style={{
            width:         28, height: 28,
            borderRadius: "50%", border: "none",
            background:   "rgba(239,68,68,0.1)", color: "#EF4444",
            fontSize:      14,
            display:       "flex", alignItems: "center", justifyContent: "center",
            cursor:        "pointer", marginLeft: 4,
            transition:   "all 0.15s",
          }}
          title="Remove item"
        >✕</button>
      </div>
    </div>
  );
}

export default function CartDrawer({ client, cart, onAdd, onRemove, onDelete, onClose, onClear }) {
  const total     = getOrderTotal(cart);
  const itemCount = getItemCount(cart);
  const isEmpty   = cart.length === 0;

  const waMessage = formatOrderMessage({
    restaurantName: client.name,
    restaurantEmoji: client.emoji,
    items: cart,
  });
  const waLink = buildWhatsAppLink(client.phone, waMessage);

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div style={{
        position:   "fixed",
        top:         0,
        right:       0,
        bottom:      0,
        width:      "min(420px, 100vw)",
        background: "#fff",
        zIndex:      300,
        display:    "flex",
        flexDirection: "column",
        animation:  "slideInRight 0.35s var(--ease)",
        boxShadow:  "-20px 0 80px rgba(0,0,0,0.15)",
      }}>

        {/* Header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "20px 24px",
          borderBottom:   "1px solid rgba(0,0,0,0.06)",
          flexShrink:      0,
        }}>
          <div>
            <h2 style={{
              fontFamily:    "var(--font-display)",
              fontWeight:     700,
              fontSize:       20,
              letterSpacing: "-0.02em",
            }}>
              Your Order
            </h2>
            <p style={{ color: "var(--ink-60)", fontSize: 13, marginTop: 2 }}>
              {isEmpty ? "No items yet" : `${itemCount} item${itemCount !== 1 ? "s" : ""} from ${client.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width:         36, height: 36,
              borderRadius: "50%",
              background:   "var(--cream-dark)",
              border:        "none",
              fontSize:       18, color: "var(--ink-60)",
              display:       "flex", alignItems: "center", justifyContent: "center",
              cursor:        "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--cream-dark)"; }}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* Body — item list */}
        <div style={{
          flex:       1,
          overflowY: "auto",
          padding:   "0 24px",
        }}>
          {isEmpty ? (
            <div style={{
              display:        "flex",
              flexDirection:  "column",
              alignItems:     "center",
              justifyContent: "center",
              height:         "100%",
              gap:             16,
              paddingBottom:   40,
            }}>
              <div style={{ fontSize: 64, filter: "grayscale(1)", opacity: 0.3 }}>🛒</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Your cart is empty</div>
                <div style={{ color: "var(--ink-60)", fontSize: 14 }}>Add items from the menu to get started</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  marginTop:    8,
                  padding:     "10px 24px",
                  borderRadius: "var(--radius-pill)",
                  border:       "none",
                  background:  "var(--cream-dark)",
                  fontFamily:  "var(--font-body)",
                  fontWeight:   600,
                  fontSize:     14,
                  cursor:       "pointer",
                }}
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  onDelete={onDelete}
                  accentColor={client.accentColor}
                />
              ))}

              {/* Clear all */}
              <button
                onClick={onClear}
                style={{
                  display:   "block",
                  width:     "100%",
                  marginTop:  12,
                  padding:   "8px",
                  background: "none",
                  border:    "none",
                  color:     "rgba(239,68,68,0.7)",
                  fontSize:   13,
                  fontFamily: "var(--font-body)",
                  cursor:    "pointer",
                  textAlign: "center",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(239,68,68,0.7)"; }}
              >
                🗑 Clear all items
              </button>
            </>
          )}
        </div>

        {/* Footer — totals + CTA */}
        {!isEmpty && (
          <div style={{
            borderTop:  "1px solid rgba(0,0,0,0.06)",
            padding:   "20px 24px 28px",
            flexShrink:  0,
          }}>
            {/* Order summary */}
            <div style={{
              background:   "var(--cream)",
              borderRadius: "var(--radius-md)",
              padding:      "14px 16px",
              marginBottom:  16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--ink-60)", fontSize: 14 }}>Subtotal</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>SAR {total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "var(--ink-60)", fontSize: 14 }}>Delivery</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#25D366" }}>To be confirmed</span>
              </div>
              <div style={{
                display:       "flex",
                justifyContent: "space-between",
                paddingTop:     10,
                borderTop:     "1px solid rgba(0,0,0,0.08)",
              }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight:  900,
                  fontSize:    20,
                  color:      "var(--ink)",
                }}>SAR {total}</span>
              </div>
            </div>

            {/* WhatsApp order button */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:             10,
                width:          "100%",
                padding:        "16px",
                borderRadius:   "var(--radius-lg)",
                background:     "#25D366",
                color:          "#fff",
                fontFamily:    "var(--font-body)",
                fontWeight:     700,
                fontSize:       16,
                textDecoration: "none",
                boxShadow:     "0 8px 32px rgba(37,211,102,0.35)",
                transition:    "transform 0.2s var(--ease), box-shadow 0.2s",
                animation:     "popIn 0.4s var(--ease-bounce)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform  = "scale(1.02)";
                e.currentTarget.style.boxShadow  = "0 12px 40px rgba(37,211,102,0.45)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform  = "scale(1)";
                e.currentTarget.style.boxShadow  = "0 8px 32px rgba(37,211,102,0.35)";
              }}
            >
              <span style={{ fontSize: 20 }}>💬</span>
              Send Order via WhatsApp
            </a>

            <p style={{
              textAlign: "center",
              fontSize:   12,
              color:     "var(--ink-40)",
              marginTop:  10,
            }}>
              WhatsApp will open with your order ready to send
            </p>
          </div>
        )}
      </div>
    </>
  );
}
