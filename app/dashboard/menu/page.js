"use client";

import { useState, useEffect } from "react";
import ImageUploader from "@/components/ImageUploader";

const EMOJIS = ["🍔","🍕","🍣","🍗","🥗","🍜","🍝","🥩","🍱","🧆","🥙","🌮","🍛","🥘","🍲","🧋","☕","🥤","🍰","🍫","🍩","🍪","🥐","🫔","🧇","🥞","🍟","🌯","🥪","🍱"];

export default function MenuManagerPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("items");

  // Modals
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCat, setShowAddCat] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [itemForm, setItemForm] = useState({
  name: "", nameAr: "",
  description: "", descriptionAr: "",
  price: "", categoryId: "",
  image: null,      // ← main image URL
  images: [],       // ← multiple images
  isAvailable: true, isFeatured: false,
});
  const [catForm, setCatForm] = useState({ name: "", nameAr: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [catsRes, itemsRes] = await Promise.all([
      fetch("/api/dashboard/categories"),
      fetch("/api/dashboard/menu"),
    ]);
    setCategories(await catsRes.json());
    setItems(await itemsRes.json());
    setLoading(false);
  }

  function resetItemForm() {
  setItemForm({
    name: "", nameAr: "",
    description: "", descriptionAr: "",
    price: "", categoryId: categories[0]?.id || "",
    image: null, images: [],
    isAvailable: true, isFeatured: false,
  });
  setError("");
}

  function openEdit(item) {
  setItemForm({
    name: item.name,
    nameAr: item.nameAr || "",
    description: item.description || "",
    descriptionAr: item.descriptionAr || "",
    price: item.price.toString(),
    categoryId: item.categoryId,
    image: item.image || null,
    images: item.images || [],
    isAvailable: item.isAvailable,
    isFeatured: item.isFeatured,
  });
  setEditingItem(item);
  setShowAddItem(true);
}

  async function saveItem() {
    if (!itemForm.name || !itemForm.price || !itemForm.categoryId) {
      setError("Name, price and category are required");
      return;
    }
    setSaving(true);
    setError("");

    const url = editingItem
      ? `/api/dashboard/menu/${editingItem.id}`
      : "/api/dashboard/menu";
    const method = editingItem ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemForm),
    });

    if (res.ok) {
      await fetchAll();
      setShowAddItem(false);
      setEditingItem(null);
      resetItemForm();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
    }
    setSaving(false);
  }

  async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/dashboard/menu/${id}`, { method: "DELETE" });
    await fetchAll();
  }

  async function toggleAvailable(item) {
    await fetch(`/api/dashboard/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, emoji: item.image, isAvailable: !item.isAvailable }),
    });
    await fetchAll();
  }

  async function saveCategory() {
    if (!catForm.name) return;
    setSaving(true);
    await fetch("/api/dashboard/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(catForm),
    });
    setCatForm({ name: "", nameAr: "" });
    setShowAddCat(false);
    await fetchAll();
    setSaving(false);
  }

  async function deleteCategory(id) {
    if (!confirm("Delete this category? Items inside will also be deleted.")) return;
    await fetch("/api/dashboard/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await fetchAll();
  }

  const inp = {
    width: "100%",
    background: "#1a1e22",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#fff", fontSize: 18 }}>
      Loading menu...
    </div>
  );

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", color: "#fff", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🍔 Menu Manager</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
            {items.length} items · {categories.length} categories
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => { setShowAddCat(true); }}
            style={{
              padding: "10px 16px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,.7)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + Category
          </button>
          <button
            onClick={() => {
              resetItemForm();
              setEditingItem(null);
              setShowAddItem(true);
            }}
            style={{
              padding: "10px 20px",
              background: "#25D366",
              border: "none",
              borderRadius: 8,
              color: "#000",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#111416", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {["items", "categories"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 20px",
            borderRadius: 7,
            border: "none",
            background: activeTab === tab ? "#fff" : "transparent",
            color: activeTab === tab ? "#000" : "rgba(255,255,255,.5)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            textTransform: "capitalize",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Items Tab */}
      {activeTab === "items" && (
        <div>
          {categories.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "#111416", borderRadius: 12,
              border: "1px solid rgba(255,255,255,.06)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No categories yet</div>
              <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14, marginBottom: 20 }}>
                Create a category first, then add menu items
              </div>
              <button
                onClick={() => setShowAddCat(true)}
                style={{
                  padding: "10px 24px",
                  background: "#25D366",
                  border: "none", borderRadius: 8,
                  color: "#000", fontWeight: 800,
                  fontSize: 14, cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Create First Category
              </button>
            </div>
          )}

          {categories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            return (
              <div key={cat.id} style={{ marginBottom: 28 }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 10, marginBottom: 12,
                }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.8)" }}>
                    {cat.name}
                  </h2>
                  {cat.nameAr && (
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,.3)" }}>{cat.nameAr}</span>
                  )}
                  <span style={{
                    fontSize: 11, color: "rgba(255,255,255,.3)",
                    background: "rgba(255,255,255,.06)",
                    borderRadius: 99, padding: "2px 8px",
                  }}>
                    {catItems.length} items
                  </span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
                </div>

                {catItems.length === 0 && (
                  <div style={{
                    padding: "16px 20px",
                    background: "#111416",
                    borderRadius: 8,
                    border: "1px dashed rgba(255,255,255,.08)",
                    color: "rgba(255,255,255,.3)",
                    fontSize: 13,
                    textAlign: "center",
                  }}>
                    No items in this category yet
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {catItems.map((item) => (
                    <div key={item.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#111416",
                      border: "1px solid rgba(255,255,255,.06)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      opacity: item.isAvailable ? 1 : 0.5,
                    }}>
                      {/* Image Upload */}
<div style={{ marginBottom: 16 }}>
  <ImageUploader
    label="Item Photos"
    hint={`Upload up to 4 photos. First photo is the main image.`}
    multiple={true}
    maxImages={4}
    currentImages={itemForm.images}
    onImagesChange={(urls) => setItemForm(p => ({
      ...p,
      images: urls,
      image: urls[0] || null,
    }))}
    folder="menu"
  />
</div>

{/* Fallback Emoji if no image */}
{itemForm.images.length === 0 && (
  <div style={{ marginBottom: 16 }}>
    <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>
      Or choose an icon (if no photo)
    </label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {EMOJIS.map((e) => (
        <button key={e} onClick={() => setItemForm(p => ({ ...p, image: e }))}
          style={{
            width: 38, height: 38,
            borderRadius: 8,
            border: itemForm.image === e
              ? "2px solid #25D366"
              : "1px solid rgba(255,255,255,.1)",
            background: itemForm.image === e
              ? "rgba(37,211,102,.15)"
              : "rgba(255,255,255,.04)",
            fontSize: 20, cursor: "pointer",
          }}>
          {e}
        </button>
      ))}
    </div>
  </div>
)}

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{item.name}</span>
                          {item.nameAr && (
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{item.nameAr}</span>
                          )}
                          {item.isFeatured && (
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              background: "rgba(245,200,66,.15)",
                              color: "#F5C842", borderRadius: 99,
                              padding: "2px 8px",
                            }}>⭐ FEATURED</span>
                          )}
                        </div>
                        {item.description && (
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 2 }}>
                            {item.description}
                          </div>
                        )}
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#25D366" }}>
                          SAR {item.price}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Toggle Available */}
                        <button
                          onClick={() => toggleAvailable(item)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            border: "none",
                            background: item.isAvailable
                              ? "rgba(37,211,102,.12)"
                              : "rgba(255,255,255,.06)",
                            color: item.isAvailable ? "#25D366" : "rgba(255,255,255,.4)",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {item.isAvailable ? "✓ Available" : "✗ Sold Out"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(item)}
                          style={{
                            width: 32, height: 32,
                            borderRadius: 6,
                            border: "1px solid rgba(255,255,255,.1)",
                            background: "transparent",
                            color: "rgba(255,255,255,.5)",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                        >✏️</button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteItem(item.id)}
                          style={{
                            width: 32, height: 32,
                            borderRadius: 6,
                            border: "1px solid rgba(239,68,68,.2)",
                            background: "rgba(239,68,68,.06)",
                            color: "#EF4444",
                            fontSize: 14,
                            cursor: "pointer",
                          }}
                        >🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categories.length === 0 && (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: "#111416", borderRadius: 12,
              border: "1px solid rgba(255,255,255,.06)",
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>No categories yet</div>
            </div>
          )}
          {categories.map((cat) => (
            <div key={cat.id} style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#111416",
              border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 10,
              padding: "16px 18px",
            }}>
              <div style={{ fontSize: 22 }}>📂</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{cat.name}</div>
                {cat.nameAr && (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{cat.nameAr}</div>
                )}
              </div>
              <div style={{
                fontSize: 12, color: "rgba(255,255,255,.4)",
                background: "rgba(255,255,255,.06)",
                borderRadius: 99, padding: "4px 12px",
              }}>
                {cat._count?.menuItems || 0} items
              </div>
              <button
                onClick={() => deleteCategory(cat.id)}
                style={{
                  width: 32, height: 32,
                  borderRadius: 6,
                  border: "1px solid rgba(239,68,68,.2)",
                  background: "rgba(239,68,68,.06)",
                  color: "#EF4444",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >🗑</button>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD/EDIT ITEM MODAL ── */}
      {showAddItem && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.8)",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: "#111416",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 16,
            padding: 28,
            width: "100%",
            maxWidth: 520,
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "#fff" }}>
              {editingItem ? "✏️ Edit Item" : "➕ Add Menu Item"}
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,.1)",
                border: "1px solid rgba(239,68,68,.3)",
                borderRadius: 8, padding: "10px 14px",
                color: "#EF4444", fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            {/* Emoji Picker */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>
                Food Icon
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {EMOJIS.map((e) => (
                  <button key={e} onClick={() => setItemForm(p => ({ ...p, emoji: e }))}
                    style={{
                      width: 38, height: 38,
                      borderRadius: 8,
                      border: itemForm.emoji === e
                        ? "2px solid #25D366"
                        : "1px solid rgba(255,255,255,.1)",
                      background: itemForm.emoji === e
                        ? "rgba(37,211,102,.15)"
                        : "rgba(255,255,255,.04)",
                      fontSize: 20, cursor: "pointer",
                    }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Name (English) *
              </label>
              <input
                style={inp}
                placeholder="e.g. Smash Burger"
                value={itemForm.name}
                onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            {/* Name Arabic */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Name (Arabic)
              </label>
              <input
                style={{ ...inp, direction: "rtl", fontFamily: "inherit" }}
                placeholder="برجر سماش"
                value={itemForm.nameAr}
                onChange={e => setItemForm(p => ({ ...p, nameAr: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Description
              </label>
              <textarea
                style={{ ...inp, minHeight: 70, resize: "vertical" }}
                placeholder="Short description of the item..."
                value={itemForm.description}
                onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>

            {/* Price + Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                  Price (SAR) *
                </label>
                <input
                  style={inp}
                  type="number"
                  placeholder="45"
                  value={itemForm.price}
                  onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                  Category *
                </label>
                <select
                  style={{ ...inp, cursor: "pointer" }}
                  value={itemForm.categoryId}
                  onChange={e => setItemForm(p => ({ ...p, categoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              {[
                { key: "isAvailable", label: "Available", color: "#25D366" },
                { key: "isFeatured", label: "Featured ⭐", color: "#F5C842" },
              ].map(({ key, label, color }) => (
                <button key={key}
                  onClick={() => setItemForm(p => ({ ...p, [key]: !p[key] }))}
                  style={{
                    flex: 1, padding: "10px",
                    borderRadius: 8,
                    border: `1px solid ${itemForm[key] ? color + "40" : "rgba(255,255,255,.1)"}`,
                    background: itemForm[key] ? color + "15" : "transparent",
                    color: itemForm[key] ? color : "rgba(255,255,255,.4)",
                    fontWeight: 700, fontSize: 13,
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                  {itemForm[key] ? "✓" : "○"} {label}
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowAddItem(false); setEditingItem(null); resetItemForm(); }}
                style={{
                  flex: 1, padding: "12px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8, color: "rgba(255,255,255,.6)",
                  fontWeight: 600, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                disabled={saving}
                style={{
                  flex: 2, padding: "12px",
                  background: saving ? "rgba(37,211,102,.5)" : "#25D366",
                  border: "none", borderRadius: 8,
                  color: "#000", fontWeight: 800,
                  fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Saving..." : editingItem ? "Save Changes" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CATEGORY MODAL ── */}
      {showAddCat && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.8)",
          display: "flex", alignItems: "center",
          justifyContent: "center",
          zIndex: 100, padding: 20,
        }}>
          <div style={{
            background: "#111416",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 16,
            padding: 28,
            width: "100%",
            maxWidth: 400,
          }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: "#fff" }}>
              📂 Add Category
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Category Name (English) *
              </label>
              <input
                style={inp}
                placeholder="e.g. Burgers"
                value={catForm.name}
                onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Category Name (Arabic)
              </label>
              <input
                style={{ ...inp, direction: "rtl" }}
                placeholder="برجر"
                value={catForm.nameAr}
                onChange={e => setCatForm(p => ({ ...p, nameAr: e.target.value }))}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowAddCat(false); setCatForm({ name: "", nameAr: "" }); }}
                style={{
                  flex: 1, padding: "12px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8, color: "rgba(255,255,255,.6)",
                  fontWeight: 600, fontSize: 14,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveCategory}
                disabled={saving}
                style={{
                  flex: 2, padding: "12px",
                  background: saving ? "rgba(37,211,102,.5)" : "#25D366",
                  border: "none", borderRadius: 8,
                  color: "#000", fontWeight: 800,
                  fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Saving..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}