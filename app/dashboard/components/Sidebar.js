"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", icon: "🏠", label: "Home" },
  { href: "/dashboard/menu", icon: "🍔", label: "Menu Manager" },
  { href: "/dashboard/orders", icon: "📋", label: "Live Orders" },
  { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
  { href: "/dashboard/qr", icon: "📱", label: "QR Code" },
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

const PLAN_CONFIG = {
  trial:      { label: "Free Trial",    color: "#6B7280", icon: "⏳", glow: false },
  starter:    { label: "Starter",       color: "#3B82F6", icon: "🚀", glow: false },
  pro:        { label: "Pro",           color: "#D4A853", icon: "⭐", glow: true  },
  enterprise: { label: "Enterprise",    color: "#8B5CF6", icon: "👑", glow: true  },
};

export default function Sidebar({ restaurant }) {
  const pathname = usePathname();

  // ✅ get plan safely from restaurant prop
  const plan = restaurant?.plan || "trial";
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial;

  return (
    <div style={{
      width: 240,
      background: "#111416",
      borderRight: "1px solid rgba(255,255,255,.06)",
      display: "flex",
      flexDirection: "column",
      padding: "24px 0",
      position: "sticky",
      top: 0,
      height: "100vh",
      flexShrink: 0,
    }}>

      {/* ── Logo + Restaurant Info ── */}
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>

        {/* OrderFlow Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38,
            background: "#25D366",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>💬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>OrderFlow</div>
            <div style={{ fontSize: 10, color: "#25D366", fontWeight: 600, letterSpacing: ".06em" }}>DASHBOARD</div>
          </div>
        </div>

        {/* Restaurant Card */}
        <div style={{
          background: "rgba(37,211,102,.06)",
          border: "1px solid rgba(37,211,102,.12)",
          borderRadius: 10,
          padding: "10px 12px",
          marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {restaurant?.restaurantName || "My Restaurant"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
            {restaurant?.email || ""}
          </div>
        </div>

        {/* ✅ PROFESSIONAL PLAN BADGE */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: `${planCfg.color}15`,
          border: `1px solid ${planCfg.color}35`,
          borderRadius: 99,
          padding: "5px 12px",
          boxShadow: planCfg.glow ? `0 0 12px ${planCfg.color}25` : "none",
          width: "fit-content",
        }}>
          <span style={{ fontSize: 12 }}>{planCfg.icon}</span>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: planCfg.color,
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}>
            {planCfg.label}
          </span>
          {planCfg.glow && (
            <div style={{
              width: 6, height: 6,
              borderRadius: "50%",
              background: planCfg.color,
              boxShadow: `0 0 6px ${planCfg.color}`,
              animation: "pulse 2s ease infinite",
            }} />
          )}
        </div>
      </div>

      {/* ── Nav Links ── */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                marginBottom: 2,
                background: active ? "rgba(37,211,102,.12)" : "transparent",
                border: active ? "1px solid rgba(37,211,102,.2)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all .15s",
              }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#25D366" : "rgba(255,255,255,.6)",
                }}>
                  {link.label}
                </span>
                {active && (
                  <div style={{
                    marginLeft: "auto",
                    width: 6, height: 6,
                    borderRadius: "50%",
                    background: "#25D366",
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade CTA ── */}
      {(plan === "trial" || plan === "starter") && (
        <div style={{ padding: "0 12px 12px" }}>
          <a href="/dashboard/upgrade" style={{
            display: "block",
            padding: "12px 16px",
            background: "linear-gradient(135deg, rgba(212,168,83,.15), rgba(139,92,246,.1))",
            border: "1px solid rgba(212,168,83,.25)",
            borderRadius: 12,
            textDecoration: "none",
            textAlign: "center",
            transition: "all .2s",
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>⚡</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#D4A853" }}>
              Upgrade to Pro
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>
              From SAR 99/month
            </div>
          </a>
        </div>
      )}

      {/* ── Sign Out ── */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/restaurant-auth/signin" })}
          style={{
            width: "100%",
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,.08)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>
            Sign Out
          </span>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}