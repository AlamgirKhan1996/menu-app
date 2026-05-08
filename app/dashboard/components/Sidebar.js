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

// Plan colors
const planColors = {
  trial: "#6B7280",
  starter: "#3B82F6",
  pro: "#D4A853",
  enterprise: "#8B5CF6",
};

const planLabel = {
  trial: "Free Trial",
  starter: "Starter",
  pro: "Pro ⭐",
  enterprise: "Enterprise 👑",
};

const plan = session?.user?.plan || "trial";

export default function Sidebar({ restaurant }) {
  const pathname = usePathname();

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

      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 38, height: 38,
            background: "#25D366",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}>💬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>OrderFlow</div>
            <div style={{ fontSize: 10, color: "#25D366", fontWeight: 600 }}>DASHBOARD</div>
          </div>
        </div>
        <div style={{
          background: "rgba(37,211,102,.08)",
          border: "1px solid rgba(37,211,102,.15)",
          borderRadius: 8,
          padding: "8px 10px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {restaurant.restaurantName}
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>
            {restaurant.plan} Plan
          </div>
        </div>
      </div>

      // Add this badge below the restaurant name in sidebar:
<div style={{
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  background: `${planColors[plan]}18`,
  border: `1px solid ${planColors[plan]}35`,
  borderRadius: 99,
  padding: "2px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: planColors[plan],
  marginTop: 4,
}}>
  {planLabel[plan]}
</div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
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
                marginBottom: 4,
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
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA — bottom of sidebar */}
<div style={{ marginTop: "auto", padding: "16px" }}>
  <a
    href="/dashboard/upgrade"
    style={{
      display: "block",
      padding: "12px 16px",
      background: "linear-gradient(135deg, rgba(37,211,102,.15), rgba(139,92,246,.15))",
      border: "1px solid rgba(37,211,102,.2)",
      borderRadius: 12,
      textDecoration: "none",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: 16, marginBottom: 4 }}>⚡</div>
    <div style={{ fontSize: 12, fontWeight: 800, color: "#25D366" }}>
      Upgrade Plan
    </div>
    <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>
      Start from SAR 99/month
    </div>
  </a>
</div>

      {/* Sign Out */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/restaurant-auth/signin" })}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
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
    </div>
  );
}