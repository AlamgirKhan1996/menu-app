"use client";

import { useState, useEffect, useCallback } from "react";
import ImageUploader from "@/components/ImageUploader";
import { canAddMoreItems, getFeatures } from "@/lib/planAccess";



const EMOJIS = ["🍔", "🍕", "🍗", "🥩", "🌮", "🥗", "🍜", "🍛", "🍣", "🥪", "🍟", "🧆", "🥙", "🫕", "🍖", "🥘", "🫔", "🧇", "🥞", "🧈", "🍳", "🥚", "🧀", "🥓", "🌭", "🫓", "🥨", "🥐", "🍩", "🍪", "🎂", "🍰", "🧁", "🍦", "☕", "🧃", "🥤", "🍵", "🧋", "🍺"];

const EMPTY_FORM = {
  name: "", nameAr: "",
  description: "", descriptionAr: "",
  price: "", categoryId: "",
  image: null, images: [],
  isAvailable: true, isFeatured: false,
};

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeTab, setActiveTab] = useState("items");
  const [catName, setCatName] = useState("");
  const [catNameAr, setCatNameAr] = useState("");
  const [savingCat, setSavingCat] = useState(false);
  const [filterCat, setFilterCat] = useState("all");
  const [editingCat, setEditingCat] = useState(null);

const PLANS = "trial";
const FEATURES = getFeatures(PLANS);
const itemCount = menuItems.length;
const canAdd = canAddMoreItems(PLANS, itemCount);

  const fetchAll = useCallback(async () => {
    try {
      const itemsRes = await fetch("/api/dashboard/menu");
      const itemsData = await itemsRes.json();
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch (err) {
      setItems([]);
    }
    try {
      const catsRes = await fetch("/api/dashboard/categories");
      const catsData = await catsRes.json();
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      setCategories([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  function openAdd() {
    setEditingItem(null);
    setItemForm({ ...EMPTY_FORM, categoryId: categories[0]?.id || "" });
    setAiResult(null);
    setError("");
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setItemForm({
      name: item.name || "",
      nameAr: item.nameAr || "",
      description: item.description || "",
      descriptionAr: item.descriptionAr || "",
      price: item.price?.toString() || "",
      categoryId: item.categoryId || "",
      image: item.image || null,
      images: Array.isArray(item.images) ? [...item.images] : [],
      isAvailable: item.isAvailable ?? true,
      isFeatured: item.isFeatured ?? false,
    });
    setAiResult(null);
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setItemForm(EMPTY_FORM);
    setAiResult(null);
    setError("");
  }

  async function handleSave() {
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) {
      setError("Name, price and category are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editingItem ? `/api/dashboard/menu/${editingItem.id}` : "/api/dashboard/menu";
      const method = editingItem ? "PUT" : "POST";
      const payload = {
        name: itemForm.name,
        nameAr: itemForm.nameAr || null,
        description: itemForm.description || null,
        descriptionAr: itemForm.descriptionAr || null,
        price: parseFloat(itemForm.price),
        categoryId: itemForm.categoryId,
        image: itemForm.images?.[0] || itemForm.image || null,
        images: Array.isArray(itemForm.images) ? itemForm.images : [],
        isAvailable: itemForm.isAvailable,
        isFeatured: itemForm.isFeatured,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed"); return; }
      await fetchAll();
      closeModal();
    } catch (err) {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  // ✅ FIXED: single slash in URL
  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/dashboard/menu/${id}`, { method: "DELETE" });
    await fetchAll();
  }

  async function handleAIGenerate() {
    if (!itemForm.name || aiLoading) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/dashboard/ai/menu-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: itemForm.name,
          category: categories.find(c => c.id === itemForm.categoryId)?.name || "",
          price: itemForm.price,
        }),
      });
      const data = await res.json();
      if (data.descriptionEn) {
        setAiResult(data);
        setItemForm(p => ({
          ...p,
          description: p.description || data.descriptionEn,
          descriptionAr: p.descriptionAr || data.descriptionAr,
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  }

  async function handleAddCategory() {
    if (!catName) return;
    setSavingCat(true);
    await fetch("/api/dashboard/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, nameAr: catNameAr }),
    });
    setCatName(""); setCatNameAr("");
    await fetchAll();
    setSavingCat(false);
  }

  async function handleDeleteCat(id) {
    if (!confirm("Delete category? Items will lose their category.")) return;
    await fetch(`/api/dashboard/categories/${id}`, { method: "DELETE" });
    await fetchAll();
  }

  async function handleEditCat() {
    if (!editingCat?.name) return;
    await fetch("/api/dashboard/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingCat),
    });
    setEditingCat(null);
    await fetchAll();
  }

  const filteredItems = filterCat === "all"
    ? items
    : items.filter(i => i.categoryId === filterCat);

  const inp = {
    width: "100%", padding: "10px 14px",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10, color: "#fff",
    fontSize: 14, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "rgba(255,255,255,.4)" }}>
      Loading menu...
    </div>
  );

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
            🍽️ Menu Manager
          </h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
            {items.length} items · {categories.length} categories
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setActiveTab(activeTab === "items" ? "categories" : "items")}
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 10, color: "rgba(255,255,255,.7)",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {activeTab === "items" ? "⚙️ Categories" : "🍽️ Items"}
          </button>
          {activeTab === "items" && (
            canAdd ? (
              <button onClick={() => setShowForm(true)}>+ Add Item</button>
            ) : (
              <div style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.2)",
                borderRadius: 10,
                padding: "10px 16px",
                fontSize: 13,
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                🔒 Menu item limit reached ({features.maxMenuItems} items on {plan} plan).{" "}
                <a href="/dashboard/upgrade" style={{ color: "#D4A853", fontWeight: 700 }}>
                  Upgrade →
                </a>
              </div>
            )
          )}
        </div>
      </div>

      {/* ITEMS TAB */}
      {activeTab === "items" && (
        <>
          {categories.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => setFilterCat("all")}
                style={{
                  padding: "6px 16px", borderRadius: 99,
                  border: "none", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  background: filterCat === "all" ? "#25D366" : "rgba(255,255,255,.06)",
                  color: filterCat === "all" ? "#000" : "rgba(255,255,255,.5)",
                }}
              >
                All ({items.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  style={{
                    padding: "6px 16px", borderRadius: 99,
                    border: "none", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", fontFamily: "inherit",
                    background: filterCat === cat.id ? "#25D366" : "rgba(255,255,255,.06)",
                    color: filterCat === cat.id ? "#000" : "rgba(255,255,255,.5)",
                  }}
                >
                  {cat.name} ({items.filter(i => i.categoryId === cat.id).length})
                </button>
              ))}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "rgba(255,255,255,.02)",
              border: "2px dashed rgba(255,255,255,.08)",
              borderRadius: 16,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>No items yet</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.25)", marginBottom: 20 }}>Add your first menu item to get started</div>
              <button onClick={openAdd} style={{ padding: "10px 24px", background: "#25D366", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                + Add First Item
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {filteredItems.map(item => {
                const mainImage = item.images?.[0] || item.image;
                const hasRealImage = mainImage && mainImage.startsWith("http");
                const cat = categories.find(c => c.id === item.categoryId);
                return (
                  <div key={item.id} style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 14, overflow: "hidden",
                  }}>
                    <div style={{
                      height: 160,
                      background: hasRealImage ? `url(${mainImage}) center/cover` : "linear-gradient(135deg, #1a1a2e, #16213e)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 56,
                      position: "relative",
                    }}>
                      {!hasRealImage && (mainImage || "🍔")}

                      <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                        {item.isFeatured && (
                          <span style={{ background: "#F59E0B", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99 }}>⭐ FEATURED</span>
                        )}
                        {!item.isAvailable && (
                          <span style={{ background: "rgba(239,68,68,.9)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99 }}>UNAVAILABLE</span>
                        )}
                      </div>

                      {item.images?.length > 1 && (
                        <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,.6)", borderRadius: 99, padding: "3px 8px", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                          📸 {item.images.length}
                        </div>
                      )}

                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                        <button
                          onClick={() => openEdit(item)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,0,0,.6)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >✏️</button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,.7)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >🗑️</button>
                      </div>
                    </div>

                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 2 }}>{item.name}</div>
                          {item.nameAr && (
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", direction: "rtl" }}>{item.nameAr}</div>
                          )}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "#25D366", marginLeft: 12, flexShrink: 0 }}>
                          SAR {item.price}
                        </div>
                      </div>
                      {item.description && (
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5, marginTop: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.06)", padding: "3px 8px", borderRadius: 6 }}>
                          {cat?.name || "Uncategorized"}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: item.isAvailable ? "#25D366" : "#EF4444" }}>
                          {item.isAvailable ? "● Available" : "● Unavailable"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === "categories" && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 14, padding: "20px", marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Add New Category</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inp} placeholder="Category name (English) e.g. Burgers" value={catName} onChange={e => setCatName(e.target.value)} />
              <input style={{ ...inp, direction: "rtl" }} placeholder="اسم الفئة بالعربي مثال: برجر" value={catNameAr} onChange={e => setCatNameAr(e.target.value)} />
              <button
                onClick={handleAddCategory}
                disabled={!catName || savingCat}
                style={{ padding: "10px", background: catName ? "#25D366" : "rgba(255,255,255,.06)", border: "none", borderRadius: 10, color: catName ? "#fff" : "rgba(255,255,255,.3)", fontSize: 13, fontWeight: 700, cursor: catName ? "pointer" : "not-allowed", fontFamily: "inherit" }}
              >
                {savingCat ? "Adding..." : "+ Add Category"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, padding: "14px 16px" }}>
                {editingCat?.id === cat.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input style={inp} placeholder="Category name (English)" value={editingCat.name} onChange={e => setEditingCat(p => ({ ...p, name: e.target.value }))} />
                    <input style={{ ...inp, direction: "rtl" }} placeholder="اسم الفئة بالعربي" value={editingCat.nameAr} onChange={e => setEditingCat(p => ({ ...p, nameAr: e.target.value }))} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={handleEditCat} style={{ flex: 1, padding: "8px", background: "#25D366", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✓ Save</button>
                      <button onClick={() => setEditingCat(null)} style={{ padding: "8px 16px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "rgba(255,255,255,.5)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{cat.name}</div>
                      {cat.nameAr && <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", direction: "rtl" }}>{cat.nameAr}</div>}
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{items.filter(i => i.categoryId === cat.id).length} items</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setEditingCat({ id: cat.id, name: cat.name, nameAr: cat.nameAr || "" })}
                        style={{ padding: "6px 12px", background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", borderRadius: 8, color: "#25D366", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >✏️ Edit</button>
                      <button
                        onClick={() => handleDeleteCat(cat.id)}
                        style={{ padding: "6px 12px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, color: "#EF4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                      >🗑️ Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
          <div style={{ background: "#0f1923", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", padding: "28px 24px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{editingItem ? "✏️ Edit Item" : "➕ Add Menu Item"}</h2>
              <button onClick={closeModal} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,.08)", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Item Name *</label>
                <input style={inp} placeholder="e.g. Smash Burger" value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>اسم العنصر</label>
                <input style={{ ...inp, direction: "rtl" }} placeholder="برجر سماش" value={itemForm.nameAr} onChange={e => setItemForm(p => ({ ...p, nameAr: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Price (SAR) *</label>
                <input style={inp} type="number" placeholder="25" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>Category *</label>
                <select style={{ ...inp, cursor: "pointer" }} value={itemForm.categoryId} onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, rgba(139,92,246,.1), rgba(37,211,102,.06))", border: "1px solid rgba(139,92,246,.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: aiResult ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✨</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>AI Menu Writer</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>{itemForm.name ? "Ready to generate!" : "Enter item name first"}</div>
                  </div>
                </div>
                <button
                  onClick={handleAIGenerate}
                  disabled={!itemForm.name || aiLoading}
                  style={{ padding: "8px 16px", background: !itemForm.name || aiLoading ? "rgba(255,255,255,.06)" : "linear-gradient(135deg, #8B5CF6, #25D366)", border: "none", borderRadius: 20, color: !itemForm.name || aiLoading ? "rgba(255,255,255,.3)" : "#fff", fontSize: 12, fontWeight: 700, cursor: !itemForm.name || aiLoading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}
                >
                  {aiLoading ? "Writing..." : "🤖 Generate"}
                </button>
              </div>
              {aiResult && (
                <div style={{ background: "rgba(0,0,0,.25)", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.6, borderLeft: "3px solid #8B5CF6" }}>
                  <div style={{ marginBottom: 4 }}><span style={{ color: "#25D366", fontWeight: 700 }}>EN: </span>{aiResult.descriptionEn}</div>
                  <div style={{ direction: "rtl", textAlign: "right" }}><span style={{ color: "#8B5CF6", fontWeight: 700 }}>AR: </span>{aiResult.descriptionAr}</div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>Description (English)</label>
                {aiResult?.descriptionEn && (
                  <button onClick={() => setItemForm(p => ({ ...p, description: aiResult.descriptionEn }))} style={{ fontSize: 10, fontWeight: 700, color: "#25D366", background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>✓ Use AI</button>
                )}
              </div>
              <textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} placeholder="Mouth-watering description..." value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.5)" }}>وصف العنصر (Arabic)</label>
                {aiResult?.descriptionAr && (
                  <button onClick={() => setItemForm(p => ({ ...p, descriptionAr: aiResult.descriptionAr }))} style={{ fontSize: 10, fontWeight: 700, color: "#8B5CF6", background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>✓ استخدم</button>
                )}
              </div>
              <textarea style={{ ...inp, minHeight: 60, resize: "vertical", direction: "rtl" }} placeholder="وصف شهي للطبق..." value={itemForm.descriptionAr} onChange={e => setItemForm(p => ({ ...p, descriptionAr: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <ImageUploader
                label="Item Photos (up to 4)"
                hint="First photo is the main image shown to customers"
                multiple={true}
                maxImages={4}
                currentImages={itemForm.images}
                onImagesChange={(urls) => setItemForm(p => ({ ...p, images: urls, image: urls[0] || null }))}
                folder="menu"
              />
            </div>

            {itemForm.images.length === 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.4)", display: "block", marginBottom: 8 }}>Or pick an icon (if no photo)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setItemForm(p => ({ ...p, image: e }))} style={{ width: 36, height: 36, borderRadius: 8, border: itemForm.image === e ? "2px solid #25D366" : "1px solid rgba(255,255,255,.1)", background: itemForm.image === e ? "rgba(37,211,102,.15)" : "rgba(255,255,255,.04)", fontSize: 20, cursor: "pointer" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[
                { label: "✅ Available", key: "isAvailable", color: "#25D366" },
                { label: "⭐ Featured", key: "isFeatured", color: "#F59E0B" },
              ].map(({ label, key, color }) => (
                <button key={key} onClick={() => setItemForm(p => ({ ...p, [key]: !p[key] }))} style={{ flex: 1, padding: "10px", background: itemForm[key] ? `${color}15` : "rgba(255,255,255,.04)", border: itemForm[key] ? `1px solid ${color}40` : "1px solid rgba(255,255,255,.08)", borderRadius: 10, color: itemForm[key] ? color : "rgba(255,255,255,.4)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  {label}
                </button>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "14px", background: saving ? "rgba(255,255,255,.06)" : "linear-gradient(135deg, #25D366, #128C7E)", border: "none", borderRadius: 12, color: saving ? "rgba(255,255,255,.3)" : "#fff", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {saving ? "Saving..." : editingItem ? "Save Changes ✓" : "Add to Menu 🍽️"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}