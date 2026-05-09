"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import InstallPWA from "@/components/InstallPWA";
import { useLang } from "@/lib/i18n";

const navLinks = [
  { href: "/dashboard",          icon: "🏠", label: "Home"     },
  { href: "/dashboard/orders",   icon: "📋", label: "Orders"   },
  { href: "/dashboard/menu",     icon: "🍔", label: "Menu"     },
  { href: "/dashboard/analytics",icon: "📊", label: "Analytics"},
  { href: "/dashboard/settings", icon: "⚙️", label: "Settings" },
];

const PLAN_CONFIG = {
  trial:      { label: "Free Trial",  color: "#6B7280", icon: "⏳", glow: false },
  starter:    { label: "Starter",     color: "#3B82F6", icon: "🚀", glow: false },
  pro:        { label: "Pro",         color: "#D4A853", icon: "⭐", glow: true  },
  enterprise: { label: "Enterprise",  color: "#8B5CF6", icon: "👑", glow: true  },
};

export default function MobileLayout({ children, session }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const plan = session?.user?.plan || "trial";
  const planCfg = PLAN_CONFIG[plan] || PLAN_CONFIG.trial;

  const { lang } = useLang();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#0A0C0E",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <aside style={{
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
          <SidebarContent session={session} pathname={pathname} plan={plan} planCfg={planCfg} />
        </aside>
      )}

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {isMobile && sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,.7)",
              zIndex: 998,
              backdropFilter: "blur(4px)",
            }}
          />
          <aside style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            width: 280,
            background: "#111416",
            borderRight: "1px solid rgba(255,255,255,.06)",
            display: "flex",
            flexDirection: "column",
            padding: "24px 0",
            zIndex: 999,
            boxShadow: "4px 0 40px rgba(0,0,0,.5)",
          }}>
            <SidebarContent session={session} pathname={pathname} plan={plan} planCfg={planCfg} />
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        paddingBottom: isMobile ? 80 : 0,
      }}>

        {/* Mobile Top Bar */}
        {isMobile && (
          <div style={{
            position: "sticky", top: 0, zIndex: 100,
            background: "#111416",
            borderBottom: "1px solid rgba(255,255,255,.06)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "rgba(255,255,255,.08)",
                border: "none", borderRadius: 10,
                width: 40, height: 40,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 5, cursor: "pointer", padding: 10,
              }}
            >
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 1 }} />
              ))}
            </button>

            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, background: "#25D366",
                borderRadius: 8, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>💬</div>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>OrderFlow</span>
            </div>

            <NewOrderBadge />
          </div>
        )}

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
          <InstallPWA />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "#111416",
          borderTop: "1px solid rgba(255,255,255,.08)",
          display: "flex", zIndex: 100,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {navLinks.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "10px 4px", textDecoration: "none",
                position: "relative", gap: 3,
              }}>
                {active && (
                  <div style={{
                    position: "absolute", top: 0, left: "20%", right: "20%",
                    height: 2, background: "#25D366",
                    borderRadius: "0 0 4px 4px",
                  }} />
                )}
                <span style={{ fontSize: 20, filter: active ? "none" : "grayscale(0.5)", opacity: active ? 1 : 0.5 }}>
                  {link.icon}
                </span>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? "#25D366" : "rgba(255,255,255,.4)" }}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

// ── SIDEBAR CONTENT ──────────────────────────────────────────────────────────
function SidebarContent({ session, pathname, plan, planCfg }) {
  const { lang, toggleLang } = useLang();
  return (
    <>
      {/* Logo + Restaurant + Badge */}
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>

        {/* OrderFlow Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, background: "#25D366",
            borderRadius: 10, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>💬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>OrderFlow</div>
            <div style={{ fontSize: 10, color: "#25D366", fontWeight: 600, letterSpacing: ".06em" }}>DASHBOARD</div>
          </div>
        </div>

        {/* Restaurant name card */}
        <div style={{
          background: "rgba(37,211,102,.06)",
          border: "1px solid rgba(37,211,102,.12)",
          borderRadius: 10, padding: "10px 12px", marginBottom: 10,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {session?.user?.restaurantName || "My Restaurant"}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
            {session?.user?.email || ""}
          </div>
        </div>

        {/* ✅ PROFESSIONAL PLAN BADGE */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          background: `${planCfg.color}15`,
          border: `1px solid ${planCfg.color}35`,
          borderRadius: 99,
          padding: "5px 14px",
          boxShadow: planCfg.glow ? `0 0 14px ${planCfg.color}30` : "none",
        }}>
          <span style={{ fontSize: 12 }}>{planCfg.icon}</span>
          <span style={{
            fontSize: 11, fontWeight: 800,
            color: planCfg.color,
            letterSpacing: ".05em",
            textTransform: "uppercase",
          }}>
            {planCfg.label}
          </span>
          {planCfg.glow && (
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: planCfg.color,
              boxShadow: `0 0 6px ${planCfg.color}`,
              animation: "pulse 2s ease infinite",
            }} />
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        {[
          { href: "/dashboard",          icon: "🏠", label: "Home"         },
          { href: "/dashboard/menu",     icon: "🍔", label: "Menu Manager" },
          { href: "/dashboard/orders",   icon: "📋", label: "Live Orders"  },
          { href: "/dashboard/analytics",icon: "📊", label: "Analytics"    },
          { href: "/dashboard/qr",       icon: "📱", label: "QR Code"      },
          { href: "/dashboard/settings", icon: "⚙️", label: "Settings"     },
          { href: "/dashboard/upgrade",  icon: "⚡", label: "Upgrade Plan" },
        ].map(link => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, marginBottom: 2,
                background: active ? "rgba(37,211,102,.12)" : "transparent",
                border: active ? "1px solid rgba(37,211,102,.2)" : "1px solid transparent",
                cursor: "pointer", transition: "all .15s",
              }}>
                <span style={{ fontSize: 18 }}>{link.icon}</span>
                <span style={{
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  color: active ? "#25D366" : "rgba(255,255,255,.6)",
                }}>
                  {link.label}
                </span>
                {active && (
                  <div style={{
                    marginLeft: "auto", width: 6, height: 6,
                    borderRadius: "50%", background: "#25D366",
                  }} />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA — only show for trial/starter */}
      {(plan === "trial" || plan === "starter") && (
        <div style={{ padding: "0 12px 12px" }}>
          <a href="/dashboard/upgrade" style={{
            display: "block", padding: "12px 16px",
            background: "linear-gradient(135deg, rgba(212,168,83,.15), rgba(139,92,246,.1))",
            border: "1px solid rgba(212,168,83,.25)",
            borderRadius: 12, textDecoration: "none", textAlign: "center",
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>⚡</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#D4A853" }}>Upgrade to Pro</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", marginTop: 2 }}>From SAR 99/month</div>
          </a>
        </div>
      )}

      {/* Sign Out */}
      {/* Language Toggle */}
      <div style={{ padding: "0 12px 8px" }}>
        <button
          onClick={toggleLang}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.08)",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.08)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.04)"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🌐</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,.7)" }}>
              {lang === "ar" ? "اللغة" : "Language"}
            </span>
          </div>
          <div style={{
            background: "rgba(37,211,102,.12)",
            border: "1px solid rgba(37,211,102,.2)",
            borderRadius: 99,
            padding: "3px 10px",
            fontSize: 11,
            fontWeight: 800,
            color: "#25D366",
          }}>
            {lang === "ar" ? "🇸🇦 عربي" : "🇬🇧 EN"}
          </div>
        </button>
      </div>

      {/* Sign Out */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/restaurant-auth/signin" })}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 8,
            background: "transparent", border: "1px solid transparent",
            cursor: "pointer", fontFamily: "inherit", transition: "all .15s",
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
          <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.4)" }}>Sign Out</span>
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}

// ── NEW ORDER BADGE ──────────────────────────────────────────────────────────
function NewOrderBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/dashboard/orders");
        const data = await res.json();
        const orders = data.orders || [];
        setCount(orders.filter(o => o.status === "NEW").length);
      } catch (e) {}
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/dashboard/orders" style={{ textDecoration: "none" }}>
      <div style={{
        width: 40, height: 40,
        background: count > 0 ? "rgba(239,68,68,.15)" : "rgba(255,255,255,.06)",
        border: count > 0 ? "1px solid rgba(239,68,68,.3)" : "1px solid rgba(255,255,255,.1)",
        borderRadius: 10, display: "flex",
        alignItems: "center", justifyContent: "center",
        position: "relative", cursor: "pointer",
      }}>
        <span style={{ fontSize: 18 }}>📋</span>
        {count > 0 && (
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 18, height: 18, background: "#EF4444",
            borderRadius: "50%", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 900, color: "#fff",
            border: "2px solid #111416",
          }}>
            {count}
          </div>
        )}
      </div>
    </Link>
  );
}