"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useOrderSound } from "@/components/OrderSounds";

// ─── WhatsApp message templates per status ────────────────────────────────────
function buildWhatsAppLink(phone, message) {
  if (!phone) return null;
  const clean = phone.replace(/\D/g, "");
  const num = clean.startsWith("0") ? "966" + clean.slice(1) : clean;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

function getStatusMessage(status, orderNumber, restaurantName) {
  const messages = {
    CONFIRMED: `✅ مرحباً! تم تأكيد طلبك ${orderNumber} من ${restaurantName}.\nجاري تحضير طلبك الآن 👨‍🍳\n\nHi! Your order ${orderNumber} from ${restaurantName} has been confirmed and is being prepared! 🍽️`,
    COOKING:   `👨‍🍳 طلبك ${orderNumber} من ${restaurantName} قيد التحضير الآن!\nسيكون جاهزاً قريباً ⏳\n\nYour order ${orderNumber} is now being cooked! Almost ready ⏳`,
    READY:     `🛎️ طلبك ${orderNumber} جاهز!\nيمكنك استلامه الآن 🎉\n\nYour order ${orderNumber} is READY for pickup! 🎉`,
    DONE:      `✅ شكراً لطلبك من ${restaurantName}!\nنتمنى أن تكون قد استمتعت بوجبتك 😊❤️\n\nThank you for ordering from ${restaurantName}! Hope you enjoyed your meal 😊`,
  };
  return messages[status] || null;
}

function getGreetingMessage(orderNumber, restaurantName, greetingMsg) {
  return greetingMsg ||
    `🎉 مرحباً بك عميلنا الجديد!\nوصلنا طلبك ${orderNumber} من ${restaurantName}.\nسيتم التواصل معك قريباً للتأكيد ✅\n\nWelcome! Your order ${orderNumber} has been received. We'll confirm shortly! ✅`;
}

// ─── Time formatting ──────────────────────────────────────────────────────────
function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  const dateLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (diffMins < 1) return { display: "Just now", sub: timeStr, isRecent: true };
  if (diffMins < 60) return { display: `${diffMins}m ago`, sub: timeStr, isRecent: diffMins < 10 };
  if (diffHours < 24) return { display: `${diffHours}h ago`, sub: timeStr, isRecent: false };
  return { display: dateLabel, sub: timeStr, isRecent: false };
}

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  NEW:       { label: "New",       labelAr: "جديد",      color: "#F59E0B", icon: "🆕", next: "CONFIRMED", nextLabel: "Confirm" },
  CONFIRMED: { label: "Confirmed", labelAr: "مؤكد",      color: "#3B82F6", icon: "✅", next: "COOKING",   nextLabel: "Start Cooking" },
  COOKING:   { label: "Cooking",   labelAr: "يُحضَّر",   color: "#8B5CF6", icon: "👨‍🍳", next: "READY",    nextLabel: "Mark Ready" },
  READY:     { label: "Ready",     labelAr: "جاهز",      color: "#25D366", icon: "🛎️", next: "DONE",     nextLabel: "Complete" },
  DONE:      { label: "Done",      labelAr: "منتهي",     color: "#10B981", icon: "✅", next: null,        nextLabel: null },
  CANCELLED: { label: "Cancelled", labelAr: "ملغي",      color: "#EF4444", icon: "❌", next: null,        nextLabel: null },
};

// ─── WhatsApp Prompt Modal ────────────────────────────────────────────────────
function WhatsAppModal({ message, phone, onSend, onSkip }) {
  const link = buildWhatsAppLink(phone, message);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,.85)",
      backdropFilter: "blur(8px)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      animation: "fadeIn .2s ease",
    }}>
      <div style={{
        background: "#0d1f17",
        border: "1px solid rgba(37,211,102,.25)",
        borderRadius: 20,
        padding: "28px 24px",
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 32px 64px rgba(0,0,0,.6), 0 0 0 1px rgba(37,211,102,.1)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44,
            background: "rgba(37,211,102,.15)",
            border: "1px solid rgba(37,211,102,.3)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>💬</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>Send WhatsApp Update?</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Notify customer about their order</div>
          </div>
        </div>

        {/* Message preview */}
        <div style={{
          background: "#0b141a",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 20,
          border: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginBottom: 8, letterSpacing: ".06em", textTransform: "uppercase" }}>
            Message Preview
          </div>
          <div style={{
            background: "#005c4b",
            borderRadius: "12px 12px 4px 12px",
            padding: "10px 14px",
            fontSize: 12,
            color: "#e9edef",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            maxWidth: "85%",
            marginLeft: "auto",
          }}>
            {message}
          </div>
        </div>

        {/* Phone */}
        {phone && (
          <div style={{
            fontSize: 12,
            color: "rgba(255,255,255,.4)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span>📱</span>
            <span>To: {phone}</span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSkip}
            style={{
              flex: 1, padding: "12px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 12,
              color: "rgba(255,255,255,.6)",
              fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Skip
          </button>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSend}
              style={{
                flex: 2, padding: "12px",
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                border: "none", borderRadius: 12,
                color: "#fff", fontSize: 13,
                fontWeight: 800, cursor: "pointer",
                textDecoration: "none",
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}
            >
              <span>💬</span> Send via WhatsApp
            </a>
          ) : (
            <button
              onClick={onSkip}
              style={{
                flex: 2, padding: "12px",
                background: "rgba(255,255,255,.08)",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 12,
                color: "rgba(255,255,255,.5)",
                fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              No phone number
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusUpdate, restaurantName, greetingMessage, isNew }) {
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.NEW;
  const time = formatTime(order.createdAt);
  const today = isToday(order.createdAt);

  return (
    <div style={{
      background: "rgba(255,255,255,.04)",
      border: `1px solid ${isNew ? cfg.color + "40" : "rgba(255,255,255,.07)"}`,
      borderRadius: 14,
      overflow: "hidden",
      borderLeft: `3px solid ${cfg.color}`,
      transition: "all .3s ease",
      position: "relative",
    }}>
      {/* New badge pulse */}
      {isNew && (
        <div style={{
          position: "absolute",
          top: 10, right: 10,
          width: 8, height: 8,
          borderRadius: "50%",
          background: cfg.color,
          boxShadow: `0 0 0 0 ${cfg.color}`,
          animation: "ping 1.5s ease-out infinite",
        }} />
      )}

      <div style={{ padding: "14px 16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 900, fontSize: 15, color: "#fff" }}>
              #{order.orderNumber}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 800,
              padding: "2px 8px", borderRadius: 99,
              background: `${cfg.color}20`,
              color: cfg.color,
              border: `1px solid ${cfg.color}30`,
            }}>
              {cfg.icon} {cfg.labelAr}
            </span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 900, color: "#25D366" }}>
            SAR {order.total?.toFixed(2)}
          </span>
        </div>

        {/* Date/Time row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 10,
          padding: "6px 10px",
          background: "rgba(255,255,255,.04)",
          borderRadius: 8,
          width: "fit-content",
        }}>
          <span style={{ fontSize: 11 }}>🕐</span>
          <span style={{
            fontSize: 11,
            color: time.isRecent ? "#F59E0B" : "rgba(255,255,255,.4)",
            fontWeight: time.isRecent ? 700 : 400,
          }}>
            {time.display}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>·</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>{time.sub}</span>
          {!today && (
            <>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>·</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.25)" }}>
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </>
          )}
        </div>

        {/* Items */}
        <div style={{ marginBottom: 10 }}>
          {order.items?.slice(0, 3).map((item, i) => (
            <div key={i} style={{
              fontSize: 12,
              color: "rgba(255,255,255,.55)",
              marginBottom: 3,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ color: cfg.color, fontWeight: 700 }}>×{item.quantity}</span>
              <span>{item.name}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,255,255,.3)", fontSize: 11 }}>
                SAR {(item.price * item.quantity).toFixed(0)}
              </span>
            </div>
          ))}
          {order.items?.length > 3 && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", paddingLeft: 4 }}>
              +{order.items.length - 3} more items
            </div>
          )}
        </div>

        {/* Customer */}
        {(order.customerName || order.customerPhone) && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            padding: "6px 10px",
            background: "rgba(255,255,255,.03)",
            borderRadius: 8,
          }}>
            <span style={{ fontSize: 14 }}>👤</span>
            <div>
              {order.customerName && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 600 }}>
                  {order.customerName}
                </div>
              )}
              {order.customerPhone && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>
                  {order.customerPhone}
                </div>
              )}
            </div>
            {order.customerPhone && (
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: "auto",
                  padding: "4px 10px",
                  background: "rgba(37,211,102,.12)",
                  border: "1px solid rgba(37,211,102,.2)",
                  borderRadius: 8,
                  fontSize: 10, fontWeight: 700,
                  color: "#25D366",
                  textDecoration: "none",
                }}
              >
                💬 Chat
              </a>
            )}
          </div>
        )}

        {/* Note */}
        {order.note && (
          <div style={{
            fontSize: 11,
            color: "#F59E0B",
            background: "rgba(245,158,11,.08)",
            border: "1px solid rgba(245,158,11,.15)",
            borderRadius: 8,
            padding: "6px 10px",
            marginBottom: 10,
          }}>
            📝 {order.note}
          </div>
        )}

        {/* Action button */}
        {cfg.next && (
          <button
            onClick={() => onStatusUpdate(order, cfg.next)}
            style={{
              width: "100%",
              padding: "9px",
              background: `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}15)`,
              border: `1px solid ${cfg.color}40`,
              borderRadius: 10,
              color: cfg.color,
              fontSize: 12, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6,
              transition: "all .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${cfg.color}30`}
            onMouseLeave={e => e.currentTarget.style.background = `linear-gradient(135deg, ${cfg.color}25, ${cfg.color}15)`}
          >
            {STATUS_CONFIG[cfg.next]?.icon} {cfg.nextLabel} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderIds, setLastOrderIds] = useState(new Set());
  const [newFlash, setNewFlash] = useState(false);
  const [waModal, setWaModal] = useState(null); // { message, phone, onDone }
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "history"
  const [updatingId, setUpdatingId] = useState(null);
  const { playAlert } = useOrderSound();
  const isFirstLoad = useRef(true);
  const seenFirstOrders = useRef(new Set()); // track which customers already got greeting

  // Fetch settings once
  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then(r => r.json())
      .then(d => setSettings(d));
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/orders?includeRecent=true");
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const currentIds = new Set(data.map(o => o.id));
      const newIds = [...currentIds].filter(id => !lastOrderIds.has(id));

      if (!isFirstLoad.current && newIds.length > 0) {
        playAlert();
        setNewFlash(true);
        setTimeout(() => setNewFlash(false), 4000);
      }

      isFirstLoad.current = false;
      setLastOrderIds(currentIds);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lastOrderIds, playAlert]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Handle status update with WhatsApp prompt
  async function handleStatusUpdate(order, newStatus) {
    setUpdatingId(order.id);

    // Optimistic UI update
    setOrders(prev => prev.map(o =>
      o.id === order.id ? { ...o, status: newStatus } : o
    ));

    // Call API
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status: newStatus }),
    });

    setUpdatingId(null);
    await fetchOrders();

    const restaurantName = settings?.name || "Our Restaurant";
    const phone = order.customerPhone;
    const isFirstOrder = !seenFirstOrders.current.has(order.customerPhone || order.id);

    // Show greeting modal for first-time customer on CONFIRMED
    if (newStatus === "CONFIRMED" && phone && isFirstOrder) {
      seenFirstOrders.current.add(phone);
      const greetMsg = getGreetingMessage(order.orderNumber, restaurantName, settings?.settings?.greetingMessage);
      setWaModal({
        message: greetMsg,
        phone,
        onDone: () => {
          setWaModal(null);
          // Then show status update modal
          const statusMsg = getStatusMessage(newStatus, order.orderNumber, restaurantName);
          if (statusMsg) {
            setTimeout(() => setWaModal({ message: statusMsg, phone, onDone: () => setWaModal(null) }), 300);
          }
        },
      });
      return;
    }

    // Show status update WhatsApp modal
    const statusMsg = getStatusMessage(newStatus, order.orderNumber, restaurantName);
    if (statusMsg && phone) {
      setWaModal({
        message: statusMsg,
        phone,
        onDone: () => setWaModal(null),
      });
    }
  }

  // Separate active vs history
  const activeStatuses = ["NEW", "CONFIRMED", "COOKING", "READY"];
  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const historyOrders = orders.filter(o => !activeStatuses.includes(o.status));

  // New orders = arrived in last 15 mins
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
  const brandNewOrders = activeOrders.filter(o =>
    o.status === "NEW" && new Date(o.createdAt) > fifteenMinsAgo
  );
  const olderActiveOrders = activeOrders.filter(o =>
    !(o.status === "NEW" && new Date(o.createdAt) > fifteenMinsAgo)
  );

  const restaurantName = settings?.name || "Our Restaurant";

  const tabStyle = (id) => ({
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
    background: activeTab === id ? "rgba(255,255,255,.1)" : "transparent",
    color: activeTab === id ? "#fff" : "rgba(255,255,255,.4)",
    fontSize: 13,
    fontWeight: activeTab === id ? 700 : 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .2s",
    position: "relative",
  });

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>⚙️</div>
      <div style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>Loading orders...</div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes ping {
          0% { box-shadow: 0 0 0 0 currentColor; opacity: 1; }
          70% { box-shadow: 0 0 0 8px transparent; opacity: 0; }
          100% { box-shadow: 0 0 0 0 transparent; opacity: 0; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes flashBorder {
          0%, 100% { border-color: rgba(245,158,11,.3); }
          50% { border-color: rgba(245,158,11,.8); }
        }
      `}</style>

      {/* WhatsApp Modal */}
      {waModal && (
        <WhatsAppModal
          message={waModal.message}
          phone={waModal.phone}
          onSend={waModal.onDone}
          onSkip={waModal.onDone}
        />
      )}

      <div style={{ padding: "20px 16px", maxWidth: 1200, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
              📋 Live Orders
            </h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.35)" }}>
              🔄 Auto-refreshes every 8 seconds
            </div>
          </div>
          {/* Stats pills */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { label: "Active", value: activeOrders.length, color: "#F59E0B" },
              { label: "New 🆕", value: brandNewOrders.length, color: "#EF4444" },
              { label: "Today", value: orders.filter(o => isToday(o.createdAt)).length, color: "#25D366" },
            ].map(s => (
              <div key={s.label} style={{
                padding: "5px 12px",
                background: `${s.color}15`,
                border: `1px solid ${s.color}30`,
                borderRadius: 99,
                fontSize: 12, fontWeight: 700,
                color: s.color,
                display: "flex", gap: 6, alignItems: "center",
              }}>
                <span style={{
                  background: s.color,
                  color: "#000",
                  borderRadius: "50%",
                  width: 18, height: 18,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 900,
                }}>{s.value}</span>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* New Order Flash Banner */}
        {newFlash && (
          <div style={{
            background: "linear-gradient(135deg, rgba(245,158,11,.15), rgba(239,68,68,.1))",
            border: "1px solid rgba(245,158,11,.4)",
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
            animation: "flashBorder 1s ease infinite",
          }}>
            <div style={{ fontSize: 28, animation: "ping 1s ease-out infinite", color: "#F59E0B" }}>🔔</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: "#F59E0B" }}>New Order Received! طلب جديد!</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)" }}>Check the New Orders section below</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 4,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 14,
          padding: 4,
          marginBottom: 24,
          width: "fit-content",
        }}>
          <button style={tabStyle("active")} onClick={() => setActiveTab("active")}>
            Active Orders
            {activeOrders.length > 0 && (
              <span style={{
                marginLeft: 6,
                background: "#F59E0B",
                color: "#000",
                borderRadius: 99,
                padding: "1px 7px",
                fontSize: 10,
                fontWeight: 900,
              }}>{activeOrders.length}</span>
            )}
          </button>
          <button style={tabStyle("history")} onClick={() => setActiveTab("history")}>
            History
            {historyOrders.length > 0 && (
              <span style={{
                marginLeft: 6,
                background: "rgba(255,255,255,.15)",
                color: "rgba(255,255,255,.6)",
                borderRadius: 99,
                padding: "1px 7px",
                fontSize: 10,
                fontWeight: 700,
              }}>{historyOrders.length}</span>
            )}
          </button>
        </div>

        {/* ── ACTIVE TAB ── */}
        {activeTab === "active" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* 🆕 Brand New Orders Section */}
            {brandNewOrders.length > 0 && (
              <div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}>
                  <div style={{
                    width: 8, height: 8,
                    borderRadius: "50%",
                    background: "#EF4444",
                    boxShadow: "0 0 8px #EF4444",
                    animation: "ping 1.5s ease-out infinite",
                    color: "#EF4444",
                  }} />
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: "#EF4444", letterSpacing: ".04em", textTransform: "uppercase" }}>
                    🆕 New Orders — طلبات جديدة ({brandNewOrders.length})
                  </h2>
                  <div style={{ flex: 1, height: 1, background: "rgba(239,68,68,.2)" }} />
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 12,
                }}>
                  {brandNewOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      restaurantName={restaurantName}
                      greetingMessage={settings?.settings?.greetingMessage}
                      isNew={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Orders */}
            {olderActiveOrders.length > 0 && (
              <div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 14,
                }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: ".04em", textTransform: "uppercase" }}>
                    ⚡ In Progress — قيد التنفيذ ({olderActiveOrders.length})
                  </h2>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.08)" }} />
                </div>

                {/* Kanban by status */}
                {["CONFIRMED", "COOKING", "READY", "NEW"].map(status => {
                  const statusOrders = olderActiveOrders.filter(o => o.status === status);
                  if (statusOrders.length === 0) return null;
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={status} style={{ marginBottom: 20 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}>
                        <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>
                          {cfg.label} · {cfg.labelAr}
                        </span>
                        <span style={{
                          background: `${cfg.color}20`,
                          color: cfg.color,
                          borderRadius: 99,
                          padding: "1px 8px",
                          fontSize: 10,
                          fontWeight: 800,
                        }}>{statusOrders.length}</span>
                      </div>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 10,
                      }}>
                        {statusOrders.map(order => (
                          <OrderCard
                            key={order.id}
                            order={order}
                            onStatusUpdate={handleStatusUpdate}
                            restaurantName={restaurantName}
                            greetingMessage={settings?.settings?.greetingMessage}
                            isNew={false}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {activeOrders.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255,255,255,.02)",
                border: "2px dashed rgba(255,255,255,.06)",
                borderRadius: 20,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>
                  No active orders
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>
                  New orders will appear here automatically · ستظهر الطلبات الجديدة هنا تلقائياً
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div>
            {historyOrders.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "rgba(255,255,255,.02)",
                border: "2px dashed rgba(255,255,255,.06)",
                borderRadius: 20,
              }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>📜</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,.4)" }}>
                  No completed orders yet
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {historyOrders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.DONE;
                  const time = formatTime(order.createdAt);
                  return (
                    <div key={order.id} style={{
                      background: "rgba(255,255,255,.03)",
                      border: "1px solid rgba(255,255,255,.06)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      borderLeft: `3px solid ${cfg.color}60`,
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,.7)" }}>
                            #{order.orderNumber}
                          </span>
                          <span style={{
                            fontSize: 10, padding: "1px 7px",
                            background: `${cfg.color}15`,
                            color: cfg.color,
                            borderRadius: 99,
                            fontWeight: 700,
                          }}>
                            {cfg.icon} {cfg.label}
                          </span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginLeft: "auto" }}>
                            {time.display} · {time.sub}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                          {order.items?.map(i => `${i.quantity}× ${i.name}`).join(", ")}
                        </div>
                        {order.customerName && (
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 2 }}>
                            👤 {order.customerName}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#25D366", flexShrink: 0 }}>
                        SAR {order.total?.toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
