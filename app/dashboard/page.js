"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [ordersRes, menuRes] = await Promise.all([
        fetch("/api/dashboard/orders"),
        fetch("/api/dashboard/menu"),
      ]);
      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();
      setOrders(ordersData);
      setMenuCount(menuData.length);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const newOrders = orders.filter(o => o.status === "NEW").length;
  const todayRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const quickLinks = [
    { href: "/dashboard/orders", icon: "📋", label: "Live Orders", value: `${newOrders} new`, color: newOrders > 0 ? "#EF4444" : "#25D366", urgent: newOrders > 0 },
    { href: "/dashboard/menu", icon: "🍔", label: "Menu Items", value: `${menuCount} items`, color: "#8B5CF6" },
    { href: "/dashboard/qr", icon: "📱", label: "QR Code", value: "Download", color: "#F59E0B" },
    { href: "/dashboard/settings", icon: "⚙️", label: "Settings", value: "Configure", color: "#06B6D4" },
  ];

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
          👋 Welcome back, {session?.user?.restaurantName}!
        </h1>
        <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
          Here is what is happening at your restaurant today.
        </p>
      </div>

      {/* New Order Alert */}
      {newOrders > 0 && (
        <Link href="/dashboard/orders" style={{ textDecoration: "none" }}>
          <div style={{
            background: "rgba(239,68,68,.1)",
            border: "1px solid rgba(239,68,68,.3)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            animation: "pulse 2s infinite",
          }}>
            <div style={{ fontSize: 28 }}>🔴</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#EF4444" }}>
                {newOrders} New Order{newOrders > 1 ? "s" : ""} Waiting!
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)" }}>
                Click to view and confirm
              </div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 20 }}>→</div>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
        marginBottom: 28,
      }}>
        {[
          { icon: "📦", label: "Active Orders", value: orders.length, color: "#8B5CF6" },
          { icon: "💰", label: "Today's Revenue", value: `SAR ${todayRevenue.toFixed(0)}`, color: "#25D366" },
          { icon: "🍔", label: "Menu Items", value: menuCount, color: "#F59E0B" },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: "#111416",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 12,
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginBottom: 4 }}>
              {loading ? "..." : stat.value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 14, letterSpacing: ".06em", textTransform: "uppercase" }}>
          Quick Actions
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#111416",
                border: link.urgent
                  ? "1px solid rgba(239,68,68,.3)"
                  : "1px solid rgba(255,255,255,.06)",
                borderRadius: 12,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                cursor: "pointer",
                transition: "all .15s",
              }}>
                <div style={{
                  width: 44, height: 44,
                  background: link.color + "15",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}>
                  {link.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: 12, color: link.urgent ? "#EF4444" : "rgba(255,255,255,.4)", fontWeight: link.urgent ? 700 : 400 }}>
                    {link.value}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", color: "rgba(255,255,255,.2)", fontSize: 18 }}>→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.3); }
          50% { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}