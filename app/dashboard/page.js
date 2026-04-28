"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/restaurant-auth/signin");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0A0C0E",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 18,
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0C0E",
      color: "#fff",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Header */}
      <div style={{
        background: "#111416",
        borderBottom: "1px solid rgba(255,255,255,.08)",
        padding: "16px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: "#25D366",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}>💬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>OrderFlow</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
              {session?.user?.restaurantName}
            </div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/restaurant-auth/signin" })}
          style={{
            background: "rgba(255,255,255,.06)",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 8,
            padding: "8px 16px",
            color: "rgba(255,255,255,.6)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Welcome */}
      <div style={{ padding: "40px 28px" }}>
        <div style={{
          background: "linear-gradient(135deg, #1a2a1a, #0d1f0d)",
          border: "1px solid rgba(37,211,102,.2)",
          borderRadius: 16,
          padding: "32px",
          marginBottom: 28,
        }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
            Welcome, {session?.user?.restaurantName}!
          </div>
          <div style={{ color: "rgba(255,255,255,.6)", fontSize: 15, lineHeight: 1.7 }}>
            Your restaurant is live on OrderFlow. Your dashboard is being built — 
            more features coming very soon!
          </div>
          <div style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}>
            {[
              { label: "Plan", value: session?.user?.plan || "FREE" },
              { label: "Role", value: session?.user?.role || "OWNER" },
              { label: "Status", value: "🟢 Active" },
            ].map((item) => (
              <div key={item.label} style={{
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                padding: "8px 16px",
                fontSize: 13,
              }}>
                <span style={{ color: "rgba(255,255,255,.4)" }}>{item.label}: </span>
                <span style={{ fontWeight: 700, color: "#25D366" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}>
          {[
            { icon: "📋", title: "Live Orders", desc: "See orders in real time", soon: true },
            { icon: "🍔", title: "Menu Manager", desc: "Add and edit your menu", soon: true },
            { icon: "👥", title: "Customers", desc: "View your customer list", soon: true },
            { icon: "📊", title: "Analytics", desc: "Track your performance", soon: true },
            { icon: "📱", title: "WhatsApp Setup", desc: "Configure auto-replies", soon: true },
            { icon: "🤖", title: "AI Posts", desc: "Generate Instagram content", soon: true },
          ].map((card) => (
            <div key={card.title} style={{
              background: "#111416",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 12,
              padding: "20px",
              opacity: 0.6,
            }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 10 }}>{card.desc}</div>
              <div style={{
                display: "inline-block",
                background: "rgba(255,255,255,.06)",
                borderRadius: 99,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,.3)",
                letterSpacing: ".05em",
              }}>COMING SOON</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}