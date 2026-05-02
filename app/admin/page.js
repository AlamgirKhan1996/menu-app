"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/restaurant-auth/signin");
    if (session?.user?.role !== "SUPER_ADMIN") router.push("/dashboard");
  }, [session, status]);

  useEffect(() => {
    fetch("/api/admin/restaurants")
      .then(r => r.json())
      .then(data => { setRestaurants(data); setLoading(false); });
  }, []);

  async function toggleActive(id, current) {
    await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r));
  }

  async function activatePaid(id) {
    const months = prompt("How many months paid? (1, 3, 6, 12)");
    if (!months) return;
    await fetch("/api/admin/restaurants", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, markPaid: true, months: parseInt(months) }),
    });
    setRestaurants(prev => prev.map(r => r.id === id ? { ...r, isPaid: true } : r));
    alert("✅ Marked as paid!");
  }

  const now = new Date();
  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.users?.[0]?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: restaurants.length,
    paid: restaurants.filter(r => r.isPaid).length,
    trial: restaurants.filter(r => !r.isPaid && r.trialEndsAt && new Date(r.trialEndsAt) > now).length,
    expired: restaurants.filter(r => !r.isPaid && (!r.trialEndsAt || new Date(r.trialEndsAt) <= now)).length,
    mrr: restaurants.filter(r => r.isPaid).length * 199,
  };

  const inp = {
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
      Loading admin panel...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", padding: 24 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
          🔐 OrderFlow Admin
        </h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          Super Admin Panel — Only visible to you
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Restaurants", value: stats.total, color: "#fff", icon: "🏪" },
          { label: "Paid Customers", value: stats.paid, color: "#25D366", icon: "💰" },
          { label: "On Trial", value: stats.trial, color: "#F59E0B", icon: "⏳" },
          { label: "Trial Expired", value: stats.expired, color: "#EF4444", icon: "🚨" },
          { label: "MRR", value: `SAR ${stats.mrr}`, color: "#8B5CF6", icon: "📈" },
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 14,
            padding: "16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          style={inp}
          placeholder="🔍 Search by restaurant name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Restaurant List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(r => {
          const trialEnd = r.trialEndsAt ? new Date(r.trialEndsAt) : null;
          const daysLeft = trialEnd ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : null;
          const isExpired = !r.isPaid && (!trialEnd || trialEnd <= now);
          const isOnTrial = !r.isPaid && trialEnd && trialEnd > now;

          return (
            <div key={r.id} style={{
              background: "rgba(255,255,255,.03)",
              border: isExpired
                ? "1px solid rgba(239,68,68,.3)"
                : r.isPaid
                ? "1px solid rgba(37,211,102,.2)"
                : "1px solid rgba(245,158,11,.2)",
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  {r.logo && (
                    <img src={r.logo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                      /{r.slug} · {r.users?.[0]?.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {/* Status Badge */}
                  <span style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: r.isPaid ? "rgba(37,211,102,.15)" : isExpired ? "rgba(239,68,68,.15)" : "rgba(245,158,11,.15)",
                    color: r.isPaid ? "#25D366" : isExpired ? "#EF4444" : "#F59E0B",
                  }}>
                    {r.isPaid ? "✅ PAID" : isExpired ? "🚨 EXPIRED" : `⏳ TRIAL — ${daysLeft}d left`}
                  </span>

                  <span style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    fontWeight: 700,
                    background: r.isActive ? "rgba(37,211,102,.08)" : "rgba(239,68,68,.08)",
                    color: r.isActive ? "#25D366" : "#EF4444",
                  }}>
                    {r.isActive ? "🟢 Active" : "🔴 Disabled"}
                  </span>

                  <span style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    color: "rgba(255,255,255,.4)",
                    background: "rgba(255,255,255,.05)",
                  }}>
                    📦 {r._count?.orders || 0} orders
                  </span>

                  <span style={{
                    padding: "3px 10px",
                    borderRadius: 99,
                    fontSize: 11,
                    color: "rgba(255,255,255,.4)",
                    background: "rgba(255,255,255,.05)",
                  }}>
                    📅 Joined {new Date(r.createdAt).toLocaleDateString("en-GB")}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {!r.isPaid && (
                  <button
                    onClick={() => activatePaid(r.id)}
                    style={{
                      padding: "8px 14px",
                      background: "rgba(37,211,102,.15)",
                      border: "1px solid rgba(37,211,102,.3)",
                      borderRadius: 10,
                      color: "#25D366",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✅ Mark Paid
                  </button>
                )}
                <button
                  onClick={() => toggleActive(r.id, r.isActive)}
                  style={{
                    padding: "8px 14px",
                    background: r.isActive ? "rgba(239,68,68,.1)" : "rgba(37,211,102,.1)",
                    border: r.isActive ? "1px solid rgba(239,68,68,.3)" : "1px solid rgba(37,211,102,.3)",
                    borderRadius: 10,
                    color: r.isActive ? "#EF4444" : "#25D366",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.isActive ? "🔴 Disable" : "🟢 Enable"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}