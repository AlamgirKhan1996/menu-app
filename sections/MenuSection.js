"use client";

import { useEffect, useRef, useState } from "react";
import MenuCard from "@/components/MenuCard";
import CategoryFilter from "@/components/CategoryFilter";
import { getItemQty } from "@/utils/cart";

export default function MenuSection({ client, cart, onAdd, onRemove }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const sectionRef = useRef(null);

  /* Filter menu by category + search */
  const menuItems = client.menu || [];
  const filtered = menuItems.filter((item) => {
    const matchCat  = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  /* Group filtered items by category for section headers */
  const grouped = filtered.reduce((acc, item) => {
    const key = item.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  /* Scroll-reveal observer */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08 }
    );
    const els = sectionRef.current?.querySelectorAll(".reveal") ?? [];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery]);

  return (
    <section ref={sectionRef}>
      {/* Sticky category bar */}
      <CategoryFilter
        categories={client.categories}
        active={activeCategory}
        onChange={(cat) => { setActiveCategory(cat); setSearchQuery(""); }}
        accentColor={client.accentColor}
      />

      <div style={{ padding: "0 20px 120px", maxWidth: 800, margin: "0 auto" }}>

        {/* Search bar */}
        <div style={{ padding: "18px 0 4px", position: "relative" }}>
          <div style={{
            position:  "absolute",
            left:       16,
            top:       "50%",
            transform: "translateY(-50%)",
            fontSize:   18,
            pointerEvents: "none",
            marginTop:  9,
          }}>🔍</div>
          <input
            type="text"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory("All"); }}
            style={{
              width:        "100%",
              padding:     "13px 16px 13px 44px",
              borderRadius: "var(--radius-lg)",
              border:       "1px solid rgba(0,0,0,0.08)",
              background:   "#fff",
              fontSize:      14,
              fontFamily:   "var(--font-body)",
              color:        "var(--ink)",
              outline:      "none",
              boxShadow:    "var(--shadow-sm)",
              transition:   "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => {
              e.target.style.borderColor = client.accentColor;
              e.target.style.boxShadow   = `0 0 0 3px ${client.accentColor}20`;
            }}
            onBlur={e => {
              e.target.style.borderColor = "rgba(0,0,0,0.08)";
              e.target.style.boxShadow   = "var(--shadow-sm)";
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position:  "absolute",
                right:      12,
                top:       "50%",
                transform: "translateY(-50%)",
                background: "none",
                border:     "none",
                fontSize:   18,
                color:     "var(--ink-40)",
                cursor:    "pointer",
                marginTop:  9,
              }}
            >✕</button>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            textAlign:      "center",
            padding:        "64px 24px",
            animation:      "fadeUp 0.4s var(--ease)",
          }}>
            <div style={{ fontSize: 56, marginBottom: 16, filter: "grayscale(1)", opacity: 0.4 }}>🍽️</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Nothing found</div>
            <div style={{ color: "var(--ink-60)", fontSize: 14 }}>
              Try a different category or search term
            </div>
            <button
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              style={{
                marginTop:    20,
                padding:     "10px 24px",
                borderRadius: "var(--radius-pill)",
                border:       "none",
                background:   client.accentColor,
                color:        "#fff",
                fontFamily:   "var(--font-body)",
                fontWeight:    600,
                fontSize:      14,
                cursor:        "pointer",
              }}
            >
              Show all items
            </button>
          </div>
        )}

        {/* Grouped menu sections */}
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginTop: 28 }}>

            {/* Category heading — only shown in "All" view */}
            {activeCategory === "All" && (
              <div
                className="reveal"
                style={{
                  display:    "flex",
                  alignItems: "center",
                  gap:         12,
                  marginBottom: 16,
                }}
              >
                <h2 style={{
                  fontFamily:    "var(--font-display)",
                  fontWeight:     700,
                  fontSize:       22,
                  letterSpacing: "-0.02em",
                  color:         "var(--ink)",
                }}>
                  {category}
                </h2>
                <div style={{
                  flex:       1,
                  height:      1,
                  background: "rgba(0,0,0,0.07)",
                }} />
                <span style={{
                  fontSize:  12,
                  color:    "var(--ink-40)",
                  fontWeight: 500,
                }}>
                  {items.length} {items.length === 1 ? "item" : "items"}
                </span>
              </div>
            )}

            {/* Cards grid */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap:                  16,
            }}>
              {items.map((item, i) => (
                <div key={item.id} className="reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                  <MenuCard
                    item={item}
                    qty={getItemQty(cart, item.id)}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    accentColor={client.accentColor}
                    index={i}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Bottom info strip */}
        {filtered.length > 0 && (
          <div style={{
            marginTop:      40,
            padding:        "18px 20px",
            background:    "#fff",
            borderRadius:  "var(--radius-lg)",
            border:        "1px solid rgba(0,0,0,0.05)",
            display:       "flex",
            alignItems:    "center",
            gap:            14,
            boxShadow:     "var(--shadow-sm)",
          }}>
            <div style={{
              width:          44,
              height:         44,
              borderRadius:  "50%",
              background:    "#25D36618",
              display:       "flex",
              alignItems:    "center",
              justifyContent: "center",
              fontSize:       22,
              flexShrink:     0,
            }}>💬</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                Order goes directly to {client.name}
              </div>
              <div style={{ color: "var(--ink-60)", fontSize: 13 }}>
                Your WhatsApp will open with your full order ready to send. 
                The restaurant confirms within minutes.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
