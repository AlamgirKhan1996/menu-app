"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar         from "@/components/Navbar";
import CartDrawer     from "@/components/CartDrawer";
import StickyOrderBar from "@/components/StickyOrderBar";
import HeroSection    from "@/sections/HeroSection";
import MenuSection    from "@/sections/MenuSection";
import { addToCart, removeFromCart, deleteFromCart, clearCart } from "@/utils/cart";

/**
 * RestaurantPage — the full client-side restaurant ordering experience.
 * Receives the `client` object (from data/clients.js) as a prop
 * from the server component at app/[client]/page.js.
 *
 * State:
 *  cart        — array of { id, name, price, emoji, qty }
 *  cartOpen    — boolean for drawer visibility
 *  toastMsg    — ephemeral "added to cart" message
 */
export default function RestaurantPage({ client }) {
  const [cart,     setCart]     = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  /* ── Cart actions ──────────────────────────────────────────────────────── */
  const handleAdd = useCallback((item) => {
    setCart((prev) => addToCart(prev, item));
    showToast(`${item.emoji} ${item.name} added!`);
  }, []);

  const handleRemove = useCallback((itemId) => {
    setCart((prev) => removeFromCart(prev, itemId));
  }, []);

  const handleDelete = useCallback((itemId) => {
    setCart((prev) => deleteFromCart(prev, itemId));
  }, []);

  const handleClear = useCallback(() => {
    setCart(clearCart());
  }, []);

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  function showToast(msg) {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }

  /* ── Lock body scroll when cart is open ────────────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = cartOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  /* ── Inject per-client accent colour as CSS variable ───────────────────── */
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", client.accentColor);
    document.documentElement.style.setProperty(
      "--accent-light",
      `${client.accentColor}18`
    );
    document.documentElement.style.setProperty(
      "--accent-glow",
      `${client.accentColor}30`
    );
  }, [client.accentColor]);

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <Navbar
        client={client}
        cart={cart}
        onCartOpen={() => setCartOpen(true)}
      />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <HeroSection client={client} />

      {/* ── Menu ───────────────────────────────────────────────────────── */}
      <MenuSection
        client={client}
        cart={cart}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />

      {/* ── Cart drawer ────────────────────────────────────────────────── */}
      {cartOpen && (
        <CartDrawer
          client={client}
          cart={cart}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onDelete={handleDelete}
          onClose={() => setCartOpen(false)}
          onClear={handleClear}
        />
      )}

      {/* ── Sticky bottom order bar ─────────────────────────────────────── */}
      <StickyOrderBar
        cart={cart}
        accentColor={client.accentColor}
        onOpen={() => setCartOpen(true)}
      />

      {/* ── Toast notification ─────────────────────────────────────────── */}
      <div style={{
        position:   "fixed",
        bottom:      90,
        left:       "50%",
        transform:  "translateX(-50%)",
        zIndex:      400,
        background: "var(--ink)",
        color:      "#fff",
        borderRadius: "var(--radius-pill)",
        padding:    "10px 20px",
        fontSize:    14,
        fontWeight:  600,
        whiteSpace: "nowrap",
        boxShadow:  "0 8px 32px rgba(0,0,0,0.3)",
        pointerEvents: "none",
        transition:    "opacity 0.3s var(--ease), transform 0.3s var(--ease)",
        opacity:       toastVisible ? 1 : 0,
        transform:     toastVisible
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(12px)",
      }}>
        {toastMsg}
      </div>
    </>
  );
}
