"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import ImageUploader from "@/components/ImageUploader";

// ─── SlugEditor ───────────────────────────────────────────────────────────────
function SlugEditor({ currentSlug }) {
  const [editing, setEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(currentSlug || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const menuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${newSlug}`
    : `/${newSlug}`;

  async function saveSlug() {
    if (!confirmed) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/dashboard/slug", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setSaving(false); return; }
      setSuccess(true);
      setEditing(false);
      setConfirmed(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  const inp = {
    width: "100%", background: "#1a1e22",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "11px 14px", color: "#fff", fontSize: 14,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      background: editing ? "rgba(245,158,11,.06)" : "rgba(255,255,255,.03)",
      border: editing ? "1px solid rgba(245,158,11,.25)" : "1px solid rgba(255,255,255,.08)",
      borderRadius: 12, padding: "16px 18px", transition: "all .3s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>🔗 Menu URL Slug</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Your public menu link address</div>
        </div>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setNewSlug(currentSlug); setError(""); setSuccess(false); }}
            style={{ padding: "6px 14px", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, color: "rgba(255,255,255,.7)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            ✏️ Change
          </button>
        )}
      </div>

      {!editing && (
        <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 13, color: "#25D366", wordBreak: "break-all" }}>
          {typeof window !== "undefined" ? window.location.origin : ""}/{currentSlug}
        </div>
      )}

      {editing && (
        <div>
          <div style={{ background: "rgba(245,158,11,.1)", border: "1px solid rgba(245,158,11,.25)", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#F59E0B", lineHeight: 1.6 }}>
            ⚠️ <strong>Warning:</strong> Changing your slug will break all existing QR codes and shared links. Update your materials after changing.
          </div>

          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,.5)", display: "block", marginBottom: 6 }}>New URL slug</label>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ padding: "11px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRight: "none", borderRadius: "8px 0 0 8px", fontSize: 12, color: "rgba(255,255,255,.35)", whiteSpace: "nowrap", flexShrink: 0 }}>
                {typeof window !== "undefined" ? window.location.hostname : "yourdomain.com"}/
              </div>
              <input
                style={{ ...inp, borderRadius: "0 8px 8px 0", flex: 1 }}
                placeholder="your-restaurant-name"
                value={newSlug}
                onChange={e => {
                  setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-"));
                  setError(""); setConfirmed(false);
                }}
              />
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 5 }}>Only lowercase letters, numbers, and hyphens. Min 3 chars.</div>
          </div>

          {newSlug && (
            <div style={{ background: "rgba(0,0,0,.3)", borderRadius: 8, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: newSlug === currentSlug ? "rgba(255,255,255,.3)" : "#25D366", marginBottom: 12, wordBreak: "break-all" }}>
              Preview: {menuUrl}
              {newSlug === currentSlug && <span style={{ color: "#F59E0B", marginLeft: 8, fontFamily: "sans-serif" }}>(same as current)</span>}
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "8px 12px", color: "#EF4444", fontSize: 12, marginBottom: 12 }}>{error}</div>
          )}

          {newSlug && newSlug !== currentSlug && newSlug.length >= 3 && (
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14, cursor: "pointer", padding: "10px 12px", background: "rgba(255,255,255,.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,.07)" }}>
              <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>
                I understand my old menu link and QR codes will stop working. I will update my shared links and printed materials.
              </span>
            </label>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setEditing(false); setError(""); setConfirmed(false); }} style={{ padding: "10px 18px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, color: "rgba(255,255,255,.5)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
            <button
              onClick={saveSlug}
              disabled={!confirmed || saving || newSlug === currentSlug || newSlug.length < 3}
              style={{
                flex: 1, padding: "10px",
                background: confirmed && newSlug !== currentSlug && newSlug.length >= 3 ? "linear-gradient(135deg, #F59E0B, #D97706)" : "rgba(255,255,255,.06)",
                border: "none", borderRadius: 8,
                color: confirmed && newSlug !== currentSlug ? "#000" : "rgba(255,255,255,.25)",
                fontSize: 13, fontWeight: 800,
                cursor: confirmed && newSlug !== currentSlug ? "pointer" : "not-allowed",
                fontFamily: "inherit",
              }}
            >
              {saving ? "Updating..." : "🔗 Update Slug"}
            </button>
          </div>
        </div>
      )}

      {success && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", borderRadius: 8, color: "#25D366", fontSize: 12, fontWeight: 700 }}>
          ✅ Slug updated! Reloading...
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [slug, setSlug] = useState("");
  const [nameChanged, setNameChanged] = useState(false); // ← tracks name edit
  const [originalName, setOriginalName] = useState("");  // ← original name for comparison
  const [form, setForm] = useState({
    name: "", nameAr: "", tagline: "", taglineAr: "",
    whatsapp: "", city: "Madinah", isOpen: true,
    logo: null, coverImage: null, accentColor: "#25D366",
    greetingMessage: "", awayMessage: "",
    openTime: "10:00", closeTime: "23:00",
  });

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    let data = {};
    try {
      const res = await fetch("/api/dashboard/settings");
      const text = await res.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = {};
    }
    setSlug(data.slug || "");
    setOriginalName(data.name || "");
    setForm({
      name: data.name || "",
      nameAr: data.nameAr || "",
      tagline: data.tagline || "",
      taglineAr: data.taglineAr || "",
      whatsapp: data.whatsapp || "",
      city: data.city || "Madinah",
      isOpen: data.isOpen ?? true,
      logo: data.logo || null,
      coverImage: data.coverImage || null,
      accentColor: data.accentColor || "#25D366",
      greetingMessage: data.settings?.greetingMessage || "مرحباً! 🎉 وصلنا طلبك بنجاح. سيتم التواصل معك خلال دقيقتين للتأكيد. شكراً ❤️",
      awayMessage: data.settings?.awayMessage || "المطعم مغلق حالياً. سنرد عليك فور فتح المطعم ✅",
      openTime: data.settings?.openTime || "10:00",
      closeTime: data.settings?.closeTime || "23:00",
    });
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true); setSuccess(""); setError("");
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, nameAr: form.nameAr,
          whatsapp: form.whatsapp, city: form.city, isOpen: form.isOpen,
          logo: form.logo, coverImage: form.coverImage, accentColor: form.accentColor,
          tagline: form.tagline, taglineAr: form.taglineAr,
          greetingMessage: form.greetingMessage, awayMessage: form.awayMessage,
          openTime: form.openTime, closeTime: form.closeTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Save failed"); return; }
      setSuccess("Saved successfully! ✅");
      setOriginalName(form.name);   // update baseline
      setNameChanged(false);        // reset warning
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Network error — try again");
    } finally {
      setSaving(false);
    }
  }

  const inp = {
    width: "100%", background: "#1a1e22",
    border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
    padding: "11px 14px", color: "#fff", fontSize: 14,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  // ✅ Uses live slug state — updates instantly after SlugEditor saves
  const menuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${slug || session?.user?.restaurantSlug}`
    : "";

  const tabs = [
    { id: "branding", label: "🎨 Branding" },
    { id: "profile", label: "🏪 Profile" },
    { id: "whatsapp", label: "💬 WhatsApp" },
    { id: "hours", label: "🕐 Hours" },
    { id: "menu_url", label: "🔗 Menu Link" },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#fff" }}>
      Loading settings...
    </div>
  );

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", color: "#fff", maxWidth: 700 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>⚙️ Settings</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Manage your restaurant profile and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          padding: "10px 24px",
          background: saved ? "rgba(37,211,102,.2)" : saving ? "rgba(37,211,102,.5)" : "#25D366",
          border: saved ? "1px solid rgba(37,211,102,.4)" : "none",
          borderRadius: 8, color: saved ? "#25D366" : "#000",
          fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
          fontFamily: "inherit", transition: "all .2s",
        }}>
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: "#111416", borderRadius: 10, padding: 4, marginBottom: 24, overflowX: "auto" }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "8px 16px", borderRadius: 7, border: "none",
            background: activeTab === tab.id ? "#fff" : "transparent",
            color: activeTab === tab.id ? "#000" : "rgba(255,255,255,.5)",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            fontFamily: "inherit", whiteSpace: "nowrap",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BRANDING TAB ── */}
      {activeTab === "branding" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#111416", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,.06)", letterSpacing: ".08em", textTransform: "uppercase" }}>
              Live Preview — What customers see
            </div>
            <div style={{ height: 140, background: form.coverImage ? `url(${form.coverImage}) center/cover` : "linear-gradient(135deg, #1a0a2e, #0a1a2e)", position: "relative", display: "flex", alignItems: "flex-end", padding: "0 20px 16px" }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: form.logo ? `url(${form.logo}) center/cover` : form.accentColor, border: "3px solid rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0, marginRight: 14, overflow: "hidden" }}>
                {!form.logo && "🍽️"}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 2 }}>{form.name || "Restaurant Name"}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{form.tagline || "Your tagline here"}</div>
              </div>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
              <div style={{ padding: "8px 16px", background: form.accentColor, borderRadius: 20, fontSize: 12, fontWeight: 700, color: "#000" }}>Order Now 💬</div>
              <div style={{ padding: "8px 16px", background: form.accentColor + "20", border: `1px solid ${form.accentColor}40`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: form.accentColor }}>View Cart</div>
            </div>
          </div>

          <ImageUploader label="Banner / Cover Image" hint="Recommended: 1200×400px." value={form.coverImage} onChange={(url) => setForm(p => ({ ...p, coverImage: url }))} folder="covers" aspectRatio="banner" />

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>Restaurant Logo</label>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <ImageUploader value={form.logo} onChange={(url) => setForm(p => ({ ...p, logo: url }))} folder="logos" aspectRatio="logo" hint="Square, min 200×200px" />
              <div style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,.35)", lineHeight: 1.7, paddingTop: 8 }}>Your logo appears on the menu page, QR code, and all customer-facing pages.</div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Tagline (English)</label>
            <input style={inp} placeholder="e.g. Riyadh's finest smash burgers" value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Tagline (Arabic)</label>
            <input style={{ ...inp, direction: "rtl" }} placeholder="أفضل برجر في الرياض" value={form.taglineAr} onChange={e => setForm(p => ({ ...p, taglineAr: e.target.value }))} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>Brand Color</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {["#25D366", "#FF6B35", "#E63946", "#D4A853", "#06B6D4", "#8B5CF6", "#EC4899", "#10B981"].map((color) => (
                <button key={color} onClick={() => setForm(p => ({ ...p, accentColor: color }))} style={{ width: 36, height: 36, borderRadius: "50%", background: color, border: form.accentColor === color ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", outline: "none", boxShadow: form.accentColor === color ? `0 0 0 2px ${color}` : "none" }} />
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="color" value={form.accentColor} onChange={e => setForm(p => ({ ...p, accentColor: e.target.value }))} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", cursor: "pointer", background: "none", padding: 0 }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Custom</span>
              </div>
            </div>
          </div>

          {error && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13 }}>{error}</div>}
          {success && <div style={{ background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", borderRadius: 10, padding: "10px 14px", color: "#25D366", fontSize: 13, fontWeight: 700 }}>{success}</div>}
          <button onClick={handleSave} disabled={saving} style={{ width: "100%", padding: "14px", background: saving ? "rgba(255,255,255,.06)" : "linear-gradient(135deg, #25D366, #128C7E)", border: "none", borderRadius: 12, color: saving ? "rgba(255,255,255,.3)" : "#fff", fontSize: 15, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : "💾 Save Branding"}
          </button>
        </div>
      )}

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Open/Closed toggle */}
          <div style={{ background: form.isOpen ? "rgba(37,211,102,.08)" : "rgba(239,68,68,.08)", border: `1px solid ${form.isOpen ? "rgba(37,211,102,.2)" : "rgba(239,68,68,.2)"}`, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Restaurant Status</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>{form.isOpen ? "🟢 Currently accepting orders" : "🔴 Not accepting orders"}</div>
            </div>
            <button onClick={() => setForm(p => ({ ...p, isOpen: !p.isOpen }))} style={{ padding: "10px 20px", background: form.isOpen ? "#25D366" : "#EF4444", border: "none", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              {form.isOpen ? "Mark Closed" : "Mark Open"}
            </button>
          </div>

          {/* ✅ Restaurant Name with smart warning */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              Restaurant Name (English)
            </label>
            <input
              style={inp}
              value={form.name}
              onChange={e => {
                setForm(p => ({ ...p, name: e.target.value }));
                setNameChanged(e.target.value !== originalName && e.target.value.length > 2);
              }}
              placeholder="Asian Taste"
            />

            {/* ⚠️ Name change warning */}
            {nameChanged && (
              <div style={{ marginTop: 10, background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#F59E0B", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  ⚠️ You changed the restaurant name — remember to update:
                </div>
                {[
                  { icon: "🔗", text: "Menu URL slug", sub: `Currently: /${slug} — update below if you want it to match the new name`, highlight: true },
                  { icon: "📱", text: "Instagram bio link", sub: "Update the link in your Instagram bio if you change the slug" },
                  { icon: "🖨️", text: "Printed QR codes", sub: "Reprint if slug changes — old QR codes will break" },
                  { icon: "💬", text: "Shared WhatsApp / social links", sub: "Send customers the new link after updating" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: i < 3 ? 8 : 0, paddingBottom: i < 3 ? 8 : 0, borderBottom: i < 3 ? "1px solid rgba(245,158,11,.1)" : "none" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: item.highlight ? "#F59E0B" : "rgba(255,255,255,.7)" }}>{item.text}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 2, lineHeight: 1.5 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}

                {/* Current URL + scroll to slug */}
                <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(0,0,0,.3)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 3 }}>Current menu URL</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#25D366" }}>
                      {typeof window !== "undefined" ? window.location.origin : ""}/{slug}
                    </div>
                  </div>
                  <button
                    onClick={() => document.getElementById("slug-editor-section")?.scrollIntoView({ behavior: "smooth" })}
                    style={{ padding: "6px 12px", background: "rgba(245,158,11,.2)", border: "1px solid rgba(245,158,11,.3)", borderRadius: 8, color: "#F59E0B", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", flexShrink: 0 }}
                  >
                    Update Slug ↓
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Restaurant Name (Arabic)</label>
            <input style={{ ...inp, direction: "rtl" }} value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="المطعم الآسيوي" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>WhatsApp Number</label>
            <input style={inp} value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="966501234567" />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>Orders will be sent to this number. No + or spaces.</div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>City</label>
            <select style={{ ...inp, cursor: "pointer" }} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
              {["Madinah", "Makkah", "Riyadh", "Jeddah", "Dammam", "Other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* ✅ Slug editor with scroll target id */}
          <div id="slug-editor-section">
            <SlugEditor currentSlug={slug} />
          </div>

          {error && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: "10px 14px", color: "#EF4444", fontSize: 13 }}>{error}</div>}
          {success && <div style={{ background: "rgba(37,211,102,.1)", border: "1px solid rgba(37,211,102,.2)", borderRadius: 10, padding: "10px 14px", color: "#25D366", fontSize: 13, fontWeight: 700 }}>{success}</div>}
        </div>
      )}

      {/* ── WHATSAPP TAB ── */}
      {activeTab === "whatsapp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "rgba(37,211,102,.06)", border: "1px solid rgba(37,211,102,.15)", borderRadius: 10, padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.6 }}>
            💡 These messages are displayed to customers as instructions. Copy them into your WhatsApp Business auto-reply settings.
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Greeting Message (shown when open)</label>
            <textarea style={{ ...inp, minHeight: 100, resize: "vertical", direction: "rtl" }} value={form.greetingMessage} onChange={e => setForm(p => ({ ...p, greetingMessage: e.target.value }))} placeholder="مرحباً! وصلنا طلبك..." />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Away Message (shown when closed)</label>
            <textarea style={{ ...inp, minHeight: 100, resize: "vertical", direction: "rtl" }} value={form.awayMessage} onChange={e => setForm(p => ({ ...p, awayMessage: e.target.value }))} placeholder="المطعم مغلق حالياً..." />
          </div>
          <div style={{ background: "#0b141a", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>WhatsApp Preview</div>
            <div style={{ background: "#005c4b", borderRadius: "12px 12px 4px 12px", padding: "10px 14px", fontSize: 13, color: "#e9edef", maxWidth: "85%", marginLeft: "auto", lineHeight: 1.6, direction: "rtl" }}>
              {form.greetingMessage || "Your greeting message will appear here..."}
            </div>
          </div>
        </div>
      )}

      {/* ── HOURS TAB ── */}
      {activeTab === "hours" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Opening Time</label>
              <input type="time" style={inp} value={form.openTime} onChange={e => setForm(p => ({ ...p, openTime: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>Closing Time</label>
              <input type="time" style={inp} value={form.closeTime} onChange={e => setForm(p => ({ ...p, closeTime: e.target.value }))} />
            </div>
          </div>
          <div style={{ background: "#111416", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{form.openTime} – {form.closeTime}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Your restaurant hours shown to customers</div>
          </div>
        </div>
      )}

      {/* ── MENU LINK TAB ── */}
      {activeTab === "menu_url" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#111416", border: "1px solid rgba(37,211,102,.2)", borderRadius: 12, padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Your Menu Link</div>
            {/* ✅ Live URL — updates after slug change */}
            <div style={{ background: "#0A0C0E", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#25D366", fontFamily: "monospace", wordBreak: "break-all", marginBottom: 16, textAlign: "left" }}>
              {menuUrl}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => navigator.clipboard.writeText(menuUrl)} style={{ padding: "10px 20px", background: "rgba(37,211,102,.12)", border: "1px solid rgba(37,211,102,.25)", borderRadius: 8, color: "#25D366", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                📋 Copy Link
              </button>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "10px 20px", background: "#25D366", border: "none", borderRadius: 8, color: "#000", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
                👁 Preview Menu
              </a>
            </div>
          </div>
          <div style={{ background: "#111416", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "rgba(255,255,255,.8)" }}>📣 How to share your menu:</div>
            {[
              { icon: "📱", title: "Instagram Bio", desc: "Add the link to your Instagram bio so followers can order directly" },
              { icon: "💬", title: "WhatsApp Status", desc: "Share as your WhatsApp status daily with today's specials" },
              { icon: "🖨️", title: "Print QR Code", desc: "Go to QR Code tab → download → print and place on every table" },
              { icon: "📦", title: "On Packaging", desc: "Print the QR on your bags and boxes for repeat orders" },
              { icon: "🗺️", title: "Google Maps", desc: "Add the link to your Google Maps listing in the website field" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 14, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
