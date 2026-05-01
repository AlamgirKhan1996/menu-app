"use client";

import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import MenuSection from "./MenuSection";
import CartDrawer from "@/components/CartDrawer";
import StickyOrderBar from "@/components/StickyOrderBar";

export default function RestaurantPage({ client }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Inject brand color
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", client.accentColor || "#25D366");
    document.documentElement.style.setProperty("--accent-light", `${client.accentColor || "#25D366"}18`);
  }, [client.accentColor]);

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  }

  function removeFromCart(itemId) {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing?.qty === 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
    });
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const categories = ["All", ...new Set(client.menu.map(item => item.category))];
  const filteredMenu = activeCategory === "All"
    ? client.menu
    : client.menu.filter(i => i.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      maxWidth: 480,
      margin: "0 auto",
      position: "relative",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      {/* Hero */}
      <HeroSection client={client} />

      {/* Category Filter — Sticky */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "12px 0",
      }}>
        <div style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingInline: 16,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "7px 16px",
                borderRadius: 99,
                border: activeCategory === cat
                  ? "none"
                  : "1px solid #e5e7eb",
                background: activeCategory === cat
                  ? (client.accentColor || "#25D366")
                  : "#fff",
                color: activeCategory === cat ? "#fff" : "#6b7280",
                fontSize: 13,
                fontWeight: activeCategory === cat ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all .2s",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ padding: "16px 16px 120px" }}>
        {filteredMenu.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No items in this category yet</div>
          </div>
        )}

        {filteredMenu.map(item => (
          <div key={item.id} style={{
            display: "flex",
            gap: 12,
            padding: "16px 0",
            borderBottom: "1px solid #f9fafb",
          }}>
            {/* Item Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                <h3 style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {item.name}
                </h3>
                {item.popular && (
                  <span style={{
                    background: "#FEF3C7",
                    color: "#D97706",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    🔥 Popular
                  </span>
                )}
              </div>

              {item.nameAr && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4, direction: "rtl", textAlign: "left" }}>
                  {item.nameAr}
                </div>
              )}

              {item.desc && (
                <p style={{
                  fontSize: 13,
                  color: "#6b7280",
                  lineHeight: 1.5,
                  margin: "0 0 10px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.desc}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#111",
                }}>
                  SAR {item.price.toFixed(2)}
                </span>

                {/* Add/Remove Controls */}
                {(() => {
                  const cartItem = cart.find(i => i.id === item.id);
                  return cartItem ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          width: 32, height: 32,
                          borderRadius: "50%",
                          border: `2px solid ${client.accentColor || "#25D366"}`,
                          background: "#fff",
                          color: client.accentColor || "#25D366",
                          fontSize: 18,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >−</button>
                      <span style={{ fontWeight: 800, fontSize: 15, minWidth: 16, textAlign: "center" }}>
                        {cartItem.qty}
                      </span>
                      <button
                        onClick={() => addToCart(item)}
                        style={{
                          width: 32, height: 32,
                          borderRadius: "50%",
                          border: "none",
                          background: client.accentColor || "#25D366",
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >+</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        width: 36, height: 36,
                        borderRadius: "50%",
                        border: "none",
                        background: client.accentColor || "#25D366",
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 4px 12px ${client.accentColor || "#25D366"}40`,
                      }}
                    >+</button>
                  );
                })()}
              </div>
            </div>

            {/* Food Image */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 14,
              overflow: "hidden",
              flexShrink: 0,
              background: item.image && item.image.startsWith("http")
                ? `url(${item.image}) center/cover`
                : "linear-gradient(135deg, #f9fafb, #f3f4f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
            }}>
              {(!item.image || !item.image.startsWith("http")) && (item.emoji || "🍔")}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky Cart Button */}
      {totalItems > 0 && (
        <div style={{
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 448,
          zIndex: 50,
        }}>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: client.accentColor || "#25D366",
              border: "none",
              borderRadius: 16,
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: `0 8px 30px ${client.accentColor || "#25D366"}50`,
              fontFamily: "inherit",
            }}
          >
            <span style={{
              background: "rgba(0,0,0,.2)",
              borderRadius: 8,
              padding: "2px 10px",
              fontSize: 13,
            }}>
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </span>
            <span>View Order 🛒</span>
            <span style={{ fontWeight: 900 }}>
              SAR {cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        restaurant={client}
        onAdd={addToCart}
        onRemove={removeFromCart}
        accentColor={client.accentColor}
      />
    </div>
  );
}
