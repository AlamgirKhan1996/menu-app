"use client";

import { useState, useEffect } from "react";
import HeroSection from "./HeroSection";
import CartDrawer from "@/components/CartDrawer";

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  ar: {
    all: "الكل",
    popular: "🔥 الأكثر طلباً",
    noItems: "لا توجد أصناف في هذه الفئة",
    viewOrder: "عرض الطلب 🛒",
    item: "صنف",
    items: "أصناف",
    addToHome: "أضف للشاشة الرئيسية",
    addToHomeDesc: "ثبّت القائمة على جهازك للوصول السريع",
    install: "تثبيت",
    later: "لاحقاً",
    currency: "ريال",
  },
  en: {
    all: "All",
    popular: "🔥 Popular",
    noItems: "No items in this category yet",
    viewOrder: "View Order 🛒",
    item: "item",
    items: "items",
    addToHome: "Add to Home Screen",
    addToHomeDesc: "Install menu on your device for quick access",
    install: "Install",
    later: "Later",
    currency: "SAR",
  },
};

// ── PWA Install Banner ────────────────────────────────────────────────────────
function InstallBanner({ lang, accentColor, onDismiss }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const t = T[lang];

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(false);
    if (onDismiss) onDismiss();
  }

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 90,
      left: "50%",
      transform: "translateX(-50%)",
      width: "calc(100% - 32px)",
      maxWidth: 448,
      zIndex: 60,
      background: "#fff",
      border: `1px solid ${accentColor}30`,
      borderRadius: 16,
      padding: "14px 16px",
      boxShadow: "0 8px 32px rgba(0,0,0,.15)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      direction: lang === "ar" ? "rtl" : "ltr",
    }}>
      <div style={{
        width: 44, height: 44,
        borderRadius: 12,
        background: accentColor,
        display: "flex", alignItems: "center",
        justifyContent: "center",
        fontSize: 22, flexShrink: 0,
      }}>🍽️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#111", marginBottom: 2 }}>
          {t.addToHome}
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>
          {t.addToHomeDesc}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => setShow(false)}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#6b7280",
            fontSize: 12, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {t.later}
        </button>
        <button
          onClick={handleInstall}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: accentColor,
            color: "#fff",
            fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {t.install}
        </button>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function RestaurantPage({ client }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLang] = useState("ar"); // ✅ Arabic by default

  // Inject brand color + set document direction
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", client.accentColor || "#25D366");
    document.documentElement.style.setProperty("--accent-light", `${client.accentColor || "#25D366"}18`);
  }, [client.accentColor]);

  // Update direction when lang changes
  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    };
  }, [lang]);

  const t = T[lang];
  const accent = client.accentColor || "#25D366";

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
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Build categories with translations
  const rawCategories = client.categories || [];
  const filteredMenu = activeCategory === "all"
    ? client.menu
    : client.menu.filter(i => i.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f0f0",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 480,
        minHeight: "100vh",
        background: "#fff",
        position: "relative",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxShadow: "0 0 40px rgba(0,0,0,.15)",
        direction: lang === "ar" ? "rtl" : "ltr",
      }}>

        {/* ── Language Toggle ── */}
        <div style={{
          position: "absolute",
          top: 16,
          left: lang === "ar" ? 16 : "auto",
          right: lang === "ar" ? "auto" : 16,
          zIndex: 100,
        }}>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              background: "rgba(0,0,0,.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 99,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}
          >
            <span style={{ fontSize: 14 }}>🌐</span>
            <span>{lang === "ar" ? "EN" : "عربي"}</span>
          </button>
        </div>

        {/* Hero */}
        <HeroSection client={client} lang={lang} />

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
            flexDirection: lang === "ar" ? "row-reverse" : "row",
          }}>
            {/* All button */}
            <button
              onClick={() => setActiveCategory("all")}
              style={{
                padding: "7px 16px",
                borderRadius: 99,
                border: activeCategory === "all" ? "none" : "1px solid #e5e7eb",
                background: activeCategory === "all" ? accent : "#fff",
                color: activeCategory === "all" ? "#fff" : "#6b7280",
                fontSize: 13,
                fontWeight: activeCategory === "all" ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all .2s",
                fontFamily: "inherit",
                flexShrink: 0,
              }}
            >
              {t.all}
            </button>

            {/* Dynamic categories */}
            {rawCategories
              .filter(cat => cat && cat !== "All")
              .map(cat => {
                // Support both string and object categories
                const catName = typeof cat === "string" ? cat : cat.name;
                const catNameAr = typeof cat === "object" ? cat.nameAr : null;
                const displayName = lang === "ar" && catNameAr ? catNameAr : catName;
                const isActive = activeCategory === catName;

                return (
                  <button
                    key={catName}
                    onClick={() => setActiveCategory(catName)}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 99,
                      border: isActive ? "none" : "1px solid #e5e7eb",
                      background: isActive ? accent : "#fff",
                      color: isActive ? "#fff" : "#6b7280",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all .2s",
                      fontFamily: "inherit",
                      flexShrink: 0,
                    }}
                  >
                    {displayName}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ padding: "16px 16px 120px" }}>
          {filteredMenu.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.noItems}</div>
            </div>
          )}

          {filteredMenu.map(item => {
            const displayName = lang === "ar" && item.nameAr ? item.nameAr : item.name;
            const displayDesc = lang === "ar" && item.descAr ? item.descAr : item.desc;
            const cartItem = cart.find(i => i.id === item.id);

            return (
              <div key={item.id} style={{
                display: "flex",
                gap: 12,
                padding: "16px 0",
                borderBottom: "1px solid #f9fafb",
                flexDirection: lang === "ar" ? "row-reverse" : "row",
              }}>
                {/* Item Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                    marginBottom: 4,
                    flexDirection: lang === "ar" ? "row-reverse" : "row",
                  }}>
                    <h3 style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111",
                      margin: 0,
                      lineHeight: 1.3,
                      textAlign: lang === "ar" ? "right" : "left",
                    }}>
                      {displayName}
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
                        whiteSpace: "nowrap",
                      }}>
                        {t.popular}
                      </span>
                    )}
                  </div>

                  {displayDesc && (
                    <p style={{
                      fontSize: 13,
                      color: "#6b7280",
                      lineHeight: 1.5,
                      margin: "0 0 10px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textAlign: lang === "ar" ? "right" : "left",
                    }}>
                      {displayDesc}
                    </p>
                  )}

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexDirection: lang === "ar" ? "row-reverse" : "row",
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>
                      {lang === "ar"
                        ? `${item.price.toFixed(0)} ${t.currency}`
                        : `${t.currency} ${item.price.toFixed(2)}`}
                    </span>

                    {/* Add/Remove Controls */}
                    {cartItem ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            width: 32, height: 32,
                            borderRadius: "50%",
                            border: `2px solid ${accent}`,
                            background: "#fff",
                            color: accent,
                            fontSize: 18, fontWeight: 700,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
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
                            background: accent,
                            color: "#fff",
                            fontSize: 18, fontWeight: 700,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
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
                          background: accent,
                          color: "#fff",
                          fontSize: 20, fontWeight: 700,
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          boxShadow: `0 4px 12px ${accent}40`,
                        }}
                      >+</button>
                    )}
                  </div>
                </div>

                {/* Food Image */}
                <div style={{
                  width: 100, height: 100,
                  borderRadius: 14,
                  overflow: "hidden",
                  flexShrink: 0,
                  background: item.image && item.image.startsWith("http")
                    ? `url(${item.image}) center/cover`
                    : "linear-gradient(135deg, #f9fafb, #f3f4f6)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                }}>
                  {(!item.image || !item.image.startsWith("http")) && (item.emoji || "🍔")}
                </div>
              </div>
            );
          })}
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
                background: accent,
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: `0 8px 30px ${accent}50`,
                fontFamily: "inherit",
                direction: lang === "ar" ? "rtl" : "ltr",
              }}
            >
              <span style={{
                background: "rgba(0,0,0,.2)",
                borderRadius: 8,
                padding: "2px 10px",
                fontSize: 13,
              }}>
                {totalItems} {totalItems === 1 ? t.item : t.items}
              </span>
              <span>{t.viewOrder}</span>
              <span style={{ fontWeight: 900 }}>
                {lang === "ar"
                  ? `${totalPrice.toFixed(0)} ${t.currency}`
                  : `${t.currency} ${totalPrice.toFixed(2)}`}
              </span>
            </button>
          </div>
        )}

        {/* Cart Drawer */}
        {cartOpen && (
          <CartDrawer
            client={client}
            cart={cart}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onDelete={(itemId) => setCart(prev => prev.filter(i => i.id !== itemId))}
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            onClear={() => setCart([])}
            accentColor={accent}
            lang={lang}
          />
        )}

        {/* PWA Install Banner */}
        <InstallBanner lang={lang} accentColor={accent} />
      </div>
    </div>
  );
}