"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    whatsapp: "",
    city: "Madinah",
    isOpen: true,
    greetingMessage: "",
    awayMessage: "",
    openTime: "10:00",
    closeTime: "23:00",
  });

  useEffect(() => { fetchSettings(); }, []);

  async function fetchSettings() {
    const res = await fetch("/api/dashboard/settings");
    const data = await res.json();
    setForm({
      name: data.name || "",
      nameAr: data.nameAr || "",
      whatsapp: data.whatsapp || "",
      city: data.city || "Madinah",
      isOpen: data.isOpen ?? true,
      greetingMessage: data.settings?.greetingMessage || "مرحباً! 🎉 وصلنا طلبك بنجاح. سيتم التواصل معك خلال دقيقتين للتأكيد. شكراً ❤️",
      awayMessage: data.settings?.awayMessage || "المطعم مغلق حالياً. سنرد عليك فور فتح المطعم ✅",
      openTime: data.settings?.openTime || "10:00",
      closeTime: data.settings?.closeTime || "23:00",
    });
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/dashboard/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const inp = {
    width: "100%",
    background: "#1a1e22",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8,
    padding: "11px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const menuUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${session?.user?.restaurantSlug}`
    : "";

  const tabs = [
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
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
            Manage your restaurant profile and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: saved ? "rgba(37,211,102,.2)" : saving ? "rgba(37,211,102,.5)" : "#25D366",
            border: saved ? "1px solid rgba(37,211,102,.4)" : "none",
            borderRadius: 8,
            color: saved ? "#25D366" : "#000",
            fontWeight: 800,
            fontSize: 14,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all .2s",
          }}
        >
          {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4,
        background: "#111416",
        borderRadius: 10, padding: 4,
        marginBottom: 24,
        overflowX: "auto",
      }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: "8px 16px",
            borderRadius: 7,
            border: "none",
            background: activeTab === tab.id ? "#fff" : "transparent",
            color: activeTab === tab.id ? "#000" : "rgba(255,255,255,.5)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Open/Closed Toggle */}
          <div style={{
            background: form.isOpen ? "rgba(37,211,102,.08)" : "rgba(239,68,68,.08)",
            border: `1px solid ${form.isOpen ? "rgba(37,211,102,.2)" : "rgba(239,68,68,.2)"}`,
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                Restaurant Status
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
                {form.isOpen ? "🟢 Currently accepting orders" : "🔴 Not accepting orders"}
              </div>
            </div>
            <button
              onClick={() => setForm(p => ({ ...p, isOpen: !p.isOpen }))}
              style={{
                padding: "10px 20px",
                background: form.isOpen ? "#25D366" : "#EF4444",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {form.isOpen ? "Mark Closed" : "Mark Open"}
            </button>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              Restaurant Name (English)
            </label>
            <input style={inp} value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Asian Taste" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              Restaurant Name (Arabic)
            </label>
            <input style={{ ...inp, direction: "rtl" }} value={form.nameAr}
              onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
              placeholder="المطعم الآسيوي" />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              WhatsApp Number
            </label>
            <input style={inp} value={form.whatsapp}
              onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
              placeholder="966501234567" />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
              Orders will be sent to this number. No + or spaces.
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              City
            </label>
            <select style={{ ...inp, cursor: "pointer" }}
              value={form.city}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
              {["Madinah", "Makkah", "Riyadh", "Jeddah", "Dammam", "Other"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* WhatsApp Tab */}
      {activeTab === "whatsapp" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{
            background: "rgba(37,211,102,.06)",
            border: "1px solid rgba(37,211,102,.15)",
            borderRadius: 10,
            padding: "14px 16px",
            fontSize: 13,
            color: "rgba(255,255,255,.6)",
            lineHeight: 1.6,
          }}>
            💡 These messages are displayed to customers as instructions. 
            Copy them into your WhatsApp Business auto-reply settings.
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              Greeting Message (shown when open)
            </label>
            <textarea
              style={{ ...inp, minHeight: 100, resize: "vertical", direction: "rtl" }}
              value={form.greetingMessage}
              onChange={e => setForm(p => ({ ...p, greetingMessage: e.target.value }))}
              placeholder="مرحباً! وصلنا طلبك..."
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
              Away Message (shown when closed)
            </label>
            <textarea
              style={{ ...inp, minHeight: 100, resize: "vertical", direction: "rtl" }}
              value={form.awayMessage}
              onChange={e => setForm(p => ({ ...p, awayMessage: e.target.value }))}
              placeholder="المطعم مغلق حالياً..."
            />
          </div>

          {/* Preview */}
          <div style={{
            background: "#0b141a",
            borderRadius: 12,
            padding: 16,
            border: "1px solid rgba(255,255,255,.06)",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>
              WhatsApp Preview
            </div>
            <div style={{
              background: "#005c4b",
              borderRadius: "12px 12px 4px 12px",
              padding: "10px 14px",
              fontSize: 13,
              color: "#e9edef",
              maxWidth: "85%",
              marginLeft: "auto",
              lineHeight: 1.6,
              direction: "rtl",
            }}>
              {form.greetingMessage || "Your greeting message will appear here..."}
            </div>
          </div>
        </div>
      )}

      {/* Hours Tab */}
      {activeTab === "hours" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Opening Time
              </label>
              <input
                type="time"
                style={inp}
                value={form.openTime}
                onChange={e => setForm(p => ({ ...p, openTime: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 6 }}>
                Closing Time
              </label>
              <input
                type="time"
                style={inp}
                value={form.closeTime}
                onChange={e => setForm(p => ({ ...p, closeTime: e.target.value }))}
              />
            </div>
          </div>

          <div style={{
            background: "#111416",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 12,
            padding: 20,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
              {form.openTime} – {form.closeTime}
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
              Your restaurant hours shown to customers
            </div>
          </div>
        </div>
      )}

      {/* Menu Link Tab */}
      {activeTab === "menu_url" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Main URL Card */}
          <div style={{
            background: "#111416",
            border: "1px solid rgba(37,211,102,.2)",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔗</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
              Your Menu Link
            </div>
            <div style={{
              background: "#0A0C0E",
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 14,
              color: "#25D366",
              fontFamily: "monospace",
              wordBreak: "break-all",
              marginBottom: 16,
              textAlign: "left",
            }}>
              {menuUrl}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => { navigator.clipboard.writeText(menuUrl); }}
                style={{
                  padding: "10px 20px",
                  background: "rgba(37,211,102,.12)",
                  border: "1px solid rgba(37,211,102,.25)",
                  borderRadius: 8,
                  color: "#25D366",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                📋 Copy Link
              </button>
              <a href={menuUrl} target="_blank" rel="noopener noreferrer" style={{
                padding: "10px 20px",
                background: "#25D366",
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "none",
              }}>
                👁 Preview Menu
              </a>
            </div>
          </div>

          {/* Share Instructions */}
          <div style={{
            background: "#111416",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "rgba(255,255,255,.8)" }}>
              📣 How to share your menu:
            </div>
            {[
              { icon: "📱", title: "Instagram Bio", desc: "Add the link to your Instagram bio so followers can order directly" },
              { icon: "💬", title: "WhatsApp Status", desc: "Share as your WhatsApp status daily with today's specials" },
              { icon: "🖨️", title: "Print QR Code", desc: "Go to QR Code tab → download → print and place on every table" },
              { icon: "📦", title: "On Packaging", desc: "Print the QR on your bags and boxes for repeat orders" },
              { icon: "🗺️", title: "Google Maps", desc: "Add the link to your Google Maps listing in the website field" },
            ].map((item) => (
              <div key={item.title} style={{
                display: "flex",
                gap: 14,
                marginBottom: 14,
                paddingBottom: 14,
                borderBottom: "1px solid rgba(255,255,255,.04)",
              }}>
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