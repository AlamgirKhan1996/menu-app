"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLAN_CONFIG = {
  trial:      { label: "Free Trial",  color: "#6B7280", icon: "⏳" },
  starter:    { label: "Starter",     color: "#3B82F6", icon: "🚀" },
  pro:        { label: "Pro",         color: "#D4A853", icon: "⭐" },
  enterprise: { label: "Enterprise",  color: "#8B5CF6", icon: "👑" },
};

const PLAN_PRICES = { starter: 99, pro: 199, enterprise: 399 };

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/restaurant-auth/signin"); return; }
    if (session?.user?.role !== "SUPER_ADMIN") { router.push("/dashboard"); return; }
    fetchRestaurants();
  }, [session, status, router]);

  async function fetchRestaurants() {
    try {
      const res = await fetch("/api/admin/restaurants");
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (e) {}
    finally { setLoading(false); }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Change Plan ──────────────────────────────────────────
  async function changePlan(id, plan) {
    setUpdating(`plan-${id}`);
    try {
      const res = await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      const data = await res.json();
      if (data.success) {
        setRestaurants(prev => prev.map(r =>
          r.id === id ? { ...r, plan, isPaid: plan !== "trial" } : r
        ));
        showToast(`✅ Plan changed to ${plan}!`);
      }
    } catch (e) {
      showToast("❌ Failed to update plan", "error");
    } finally {
      setUpdating(null);
    }
  }

  // ── Toggle Active ────────────────────────────────────────
  async function toggleActive(id, current) {
    setUpdating(`active-${id}`);
    try {
      await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      setRestaurants(prev => prev.map(r =>
        r.id === id ? { ...r, isActive: !current } : r
      ));
      showToast(`${!current ? "🟢 Enabled" : "🔴 Disabled"} successfully!`);
    } catch (e) {
      showToast("❌ Failed", "error");
    } finally {
      setUpdating(null);
    }
  }

  // ── Extend Trial ─────────────────────────────────────────
  async function extendTrial(id, days) {
    setUpdating(`trial-${id}`);
    try {
      await fetch("/api/admin/restaurants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, extendTrial: days }),
      });
      showToast(`✅ Trial extended by ${days} days!`);
      fetchRestaurants();
    } catch (e) {
      showToast("❌ Failed", "error");
    } finally {
      setUpdating(null);
    }
  }

  const now = new Date();
  const filtered = restaurants.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.users?.[0]?.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: restaurants.length,
    paid: restaurants.filter(r => r.isPaid).length,
    trial: restaurants.filter(r => !r.isPaid && r.trialEndsAt && new Date(r.trialEndsAt) > now).length,
    expired: restaurants.filter(r => !r.isPaid && (!r.trialEndsAt || new Date(r.trialEndsAt) <= now)).length,
    mrr: restaurants.filter(r => r.plan === "starter").length * 99
        + restaurants.filter(r => r.plan === "pro").length * 199
        + restaurants.filter(r => r.plan === "enterprise").length * 399,
  };

  const inp = {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10, padding: "10px 14px", color: "#fff",
    fontSize: 14, outline: "none", fontFamily: "inherit",
    width: "100%", boxSizing: "border-box",
  };

  if (status === "loading" || (status === "authenticated" && loading)) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12, animation: "spin 1s linear infinite" }}>⚙️</div>
        <div style={{ color: "rgba(255,255,255,.4)" }}>Loading admin panel...</div>
      </div>
    </div>
  );

  if (session?.user?.role !== "SUPER_ADMIN") return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Redirecting...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: 24, fontFamily: "-apple-system, sans-serif" }}>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#EF4444" : "#25D366",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontWeight: 700, fontSize: 13,
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          animation: "slideDown .3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>🔐 OrderFlow Admin</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
            Logged in as <span style={{ color: "#25D366" }}>{session?.user?.email}</span>
          </div>
        </div>
        <button
          onClick={fetchRestaurants}
          style={{
            padding: "8px 16px", background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.1)", borderRadius: 10,
            color: "rgba(255,255,255,.6)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total",    value: stats.total,        color: "#fff",     icon: "🏪" },
          { label: "Paid",     value: stats.paid,         color: "#25D366",  icon: "💰" },
          { label: "On Trial", value: stats.trial,        color: "#F59E0B",  icon: "⏳" },
          { label: "Expired",  value: stats.expired,      color: "#EF4444",  icon: "🚨" },
          { label: "MRR",      value: `SAR ${stats.mrr}`, color: "#8B5CF6",  icon: "📈" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 14, padding: 16, textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ marginBottom: 16 }}>
        <input
          style={inp}
          placeholder="🔍 Search by name, email or slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Restaurant List ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(r => {
          const trialEnd = r.trialEndsAt ? new Date(r.trialEndsAt) : null;
          const daysLeft = trialEnd ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;
          const isExpired = !r.isPaid && (!trialEnd || trialEnd <= now);
          const planCfg = PLAN_CONFIG[r.plan] || PLAN_CONFIG.trial;
          const isExpanded = expandedId === r.id;

          return (
            <div key={r.id} style={{
              background: "rgba(255,255,255,.03)",
              border: isExpired
                ? "1px solid rgba(239,68,68,.25)"
                : r.isPaid
                ? "1px solid rgba(37,211,102,.2)"
                : "1px solid rgba(255,255,255,.08)",
              borderRadius: 16,
              overflow: "hidden",
              transition: "all .2s",
            }}>

              {/* ── Restaurant Row ── */}
              <div style={{
                padding: "16px 20px",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", flexWrap: "wrap", gap: 12,
              }}>

                {/* Left — Info */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{r.name}</div>
                    {/* Plan Badge */}
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: `${planCfg.color}15`,
                      border: `1px solid ${planCfg.color}35`,
                      borderRadius: 99, padding: "2px 10px",
                      fontSize: 10, fontWeight: 800,
                      color: planCfg.color, letterSpacing: ".04em",
                    }}>
                      {planCfg.icon} {planCfg.label.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)", marginBottom: 8 }}>
                    /{r.slug} · {r.users?.[0]?.email}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {/* Status badge */}
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: r.isPaid ? "rgba(37,211,102,.15)" : isExpired ? "rgba(239,68,68,.15)" : "rgba(245,158,11,.15)",
                      color: r.isPaid ? "#25D366" : isExpired ? "#EF4444" : "#F59E0B",
                    }}>
                      {r.isPaid ? "✅ PAID" : isExpired ? "🚨 EXPIRED" : `⏳ ${daysLeft}d left`}
                    </span>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                      background: r.isActive ? "rgba(37,211,102,.08)" : "rgba(239,68,68,.08)",
                      color: r.isActive ? "#25D366" : "#EF4444",
                    }}>
                      {r.isActive ? "🟢 Active" : "🔴 Disabled"}
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)" }}>
                      📦 {r._count?.orders || 0} orders
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)" }}>
                      🍔 {r._count?.menuItems || 0} items
                    </span>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 11, color: "rgba(255,255,255,.3)", background: "rgba(255,255,255,.05)" }}>
                      📅 {new Date(r.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                </div>

                {/* Right — Quick Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    style={{
                      padding: "8px 14px",
                      background: isExpanded ? "rgba(212,168,83,.15)" : "rgba(255,255,255,.06)",
                      border: isExpanded ? "1px solid rgba(212,168,83,.3)" : "1px solid rgba(255,255,255,.1)",
                      borderRadius: 10, color: isExpanded ? "#D4A853" : "rgba(255,255,255,.6)",
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    ⚙️ Manage {isExpanded ? "▲" : "▼"}
                  </button>
                  <button
                    onClick={() => toggleActive(r.id, r.isActive)}
                    disabled={updating === `active-${r.id}`}
                    style={{
                      padding: "8px 14px",
                      background: r.isActive ? "rgba(239,68,68,.1)" : "rgba(37,211,102,.1)",
                      border: r.isActive ? "1px solid rgba(239,68,68,.3)" : "1px solid rgba(37,211,102,.3)",
                      borderRadius: 10,
                      color: r.isActive ? "#EF4444" : "#25D366",
                      fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      opacity: updating === `active-${r.id}` ? 0.5 : 1,
                    }}
                  >
                    {r.isActive ? "🔴 Disable" : "🟢 Enable"}
                  </button>
                </div>
              </div>

              {/* ── Expanded Management Panel ── */}
              {isExpanded && (
                <div style={{
                  borderTop: "1px solid rgba(255,255,255,.06)",
                  padding: "20px",
                  background: "rgba(0,0,0,.2)",
                  animation: "slideDown .2s ease",
                }}>

                  {/* Plan Selector */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>
                      🎯 Change Plan
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.entries(PLAN_CONFIG).map(([key, cfg]) => {
                        const isCurrentPlan = r.plan === key;
                        const isUpdating = updating === `plan-${r.id}`;
                        return (
                          <button
                            key={key}
                            onClick={() => !isCurrentPlan && changePlan(r.id, key)}
                            disabled={isCurrentPlan || isUpdating}
                            style={{
                              padding: "10px 18px",
                              background: isCurrentPlan ? `${cfg.color}20` : "rgba(255,255,255,.04)",
                              border: isCurrentPlan ? `2px solid ${cfg.color}` : `1px solid ${cfg.color}30`,
                              borderRadius: 10,
                              color: isCurrentPlan ? cfg.color : "rgba(255,255,255,.5)",
                              fontSize: 13, fontWeight: isCurrentPlan ? 800 : 600,
                              cursor: isCurrentPlan ? "default" : "pointer",
                              fontFamily: "inherit",
                              opacity: isUpdating && !isCurrentPlan ? 0.5 : 1,
                              transition: "all .15s",
                              display: "flex", alignItems: "center", gap: 6,
                            }}
                          >
                            <span>{cfg.icon}</span>
                            <span>{cfg.label}</span>
                            {PLAN_PRICES[key] && (
                              <span style={{ fontSize: 10, opacity: 0.6 }}>SAR {PLAN_PRICES[key]}</span>
                            )}
                            {isCurrentPlan && (
                              <span style={{ fontSize: 10, background: cfg.color, color: "#000", borderRadius: 99, padding: "1px 6px", fontWeight: 900 }}>
                                CURRENT
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {updating === `plan-${r.id}` && (
                      <div style={{ fontSize: 12, color: "#25D366", marginTop: 8 }}>⏳ Updating plan...</div>
                    )}
                  </div>

                  {/* Trial Extension */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 10, letterSpacing: ".06em", textTransform: "uppercase" }}>
                      ⏳ Extend Trial
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[3, 7, 14, 30].map(days => (
                        <button
                          key={days}
                          onClick={() => extendTrial(r.id, days)}
                          disabled={updating === `trial-${r.id}`}
                          style={{
                            padding: "8px 16px",
                            background: "rgba(245,158,11,.08)",
                            border: "1px solid rgba(245,158,11,.2)",
                            borderRadius: 10, color: "#F59E0B",
                            fontSize: 12, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit",
                            opacity: updating === `trial-${r.id}` ? 0.5 : 1,
                          }}
                        >
                          +{days} days
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant Info */}
                  <div style={{
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid rgba(255,255,255,.06)",
                    borderRadius: 10, padding: "12px 16px",
                    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 12, fontSize: 12,
                  }}>
                    {[
                      { label: "Restaurant ID", value: r.id.slice(0, 16) + "..." },
                      { label: "Slug", value: `/${r.slug}` },
                      { label: "WhatsApp", value: r.whatsapp || "Not set" },
                      { label: "City", value: r.city || "Not set" },
                      { label: "Created", value: new Date(r.createdAt).toLocaleDateString("en-GB") },
                      { label: "Trial Ends", value: r.trialEndsAt ? new Date(r.trialEndsAt).toLocaleDateString("en-GB") : "No trial" },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ color: "rgba(255,255,255,.35)", marginBottom: 3 }}>{item.label}</div>
                        <div style={{ color: "rgba(255,255,255,.7)", fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,.3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>No restaurants found</div>
        </div>
      )}
    </div>
  );
}