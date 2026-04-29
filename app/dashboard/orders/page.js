"use client";

import { useState, useEffect, useCallback } from "react";

const COLUMNS = [
  { status: "NEW", label: "🔴 New Orders", color: "#EF4444" },
  { status: "CONFIRMED", label: "✅ Confirmed", color: "#F59E0B" },
  { status: "COOKING", label: "🟡 Cooking", color: "#8B5CF6" },
  { status: "READY", label: "🟢 Ready", color: "#25D366" },
];

const NEXT_STATUS = {
  NEW: "CONFIRMED",
  CONFIRMED: "COOKING",
  COOKING: "READY",
  READY: "DONE",
};

const NEXT_LABEL = {
  NEW: "Confirm Order",
  CONFIRMED: "Start Cooking",
  COOKING: "Mark Ready",
  READY: "Complete ✓",
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [lastCount, setLastCount] = useState(0);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/dashboard/orders");
    const data = await res.json();
    
    // Sound alert for new orders
    if (data.length > lastCount && lastCount > 0) {
      try {
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...");
        audio.play();
      } catch (e) {}
    }
    
    setLastCount(data.length);
    setOrders(data);
    setLoading(false);
  }, [lastCount]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateStatus(orderId, status) {
    setUpdating(orderId);
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    });
    await fetchOrders();
    setUpdating(null);
  }

  const totalRevenue = orders
    .filter(o => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#fff", fontSize: 18 }}>
      Loading orders...
    </div>
  );

  return (
    <div style={{ padding: 28, fontFamily: "'Inter', sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>📋 Live Orders</h1>
          <p style={{ color: "rgba(255,255,255,.4)", fontSize: 14 }}>
            Auto-refreshes every 8 seconds · {orders.length} active orders
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{
            background: "rgba(37,211,102,.1)",
            border: "1px solid rgba(37,211,102,.2)",
            borderRadius: 10,
            padding: "10px 16px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>TODAY'S REVENUE</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#25D366" }}>SAR {totalRevenue.toFixed(0)}</div>
          </div>
          <button
            onClick={fetchOrders}
            style={{
              padding: "10px 16px",
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,.6)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "#111416",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,.06)",
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎯</div>
          <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>No active orders</div>
          <div style={{ color: "rgba(255,255,255,.4)", fontSize: 15 }}>
            When customers order via WhatsApp, orders will appear here instantly
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {orders.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          overflowX: "auto",
        }}>
          {COLUMNS.map((col) => {
            const colOrders = orders.filter(o => o.status === col.status);
            return (
              <div key={col.status} style={{
                background: "#111416",
                border: `1px solid ${col.color}20`,
                borderTop: `3px solid ${col.color}`,
                borderRadius: 12,
                padding: 14,
                minHeight: 400,
              }}>
                {/* Column Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{col.label}</div>
                  <div style={{
                    width: 24, height: 24,
                    borderRadius: "50%",
                    background: col.color + "20",
                    color: col.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}>
                    {colOrders.length}
                  </div>
                </div>

                {/* Order Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {colOrders.map((order) => (
                    <div key={order.id} style={{
                      background: "#0A0C0E",
                      border: "1px solid rgba(255,255,255,.06)",
                      borderRadius: 10,
                      padding: 14,
                      animation: order.status === "NEW" ? "pulse 2s infinite" : "none",
                    }}>
                      {/* Order Header */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}>
                        <div style={{
                          fontWeight: 800,
                          fontSize: 16,
                          color: col.color,
                        }}>
                          {order.orderNumber}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,.3)",
                        }}>
                          {timeAgo(order.createdAt)}
                        </div>
                      </div>

                      {/* Items */}
                      <div style={{ marginBottom: 10 }}>
                        {order.items.map((item, i) => (
                          <div key={i} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 12,
                            color: "rgba(255,255,255,.6)",
                            marginBottom: 3,
                          }}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>SAR {(item.price * item.quantity).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: 8,
                        borderTop: "1px solid rgba(255,255,255,.06)",
                        marginBottom: 10,
                      }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#25D366" }}>
                          SAR {order.total.toFixed(0)}
                        </span>
                      </div>

                      {/* Customer */}
                      {order.customerName && (
                        <div style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,.3)",
                          marginBottom: 10,
                        }}>
                          👤 {order.customerName}
                        </div>
                      )}

                      {/* Note */}
                      {order.note && (
                        <div style={{
                          fontSize: 11,
                          color: "rgba(245,200,66,.6)",
                          background: "rgba(245,200,66,.06)",
                          borderRadius: 6,
                          padding: "6px 8px",
                          marginBottom: 10,
                        }}>
                          📝 {order.note}
                        </div>
                      )}

                      {/* Action Button */}
                      {NEXT_STATUS[order.status] && (
                        <button
                          onClick={() => updateStatus(order.id, NEXT_STATUS[order.status])}
                          disabled={updating === order.id}
                          style={{
                            width: "100%",
                            padding: "8px",
                            background: updating === order.id
                              ? "rgba(255,255,255,.06)"
                              : col.color + "20",
                            border: `1px solid ${col.color}40`,
                            borderRadius: 7,
                            color: updating === order.id
                              ? "rgba(255,255,255,.3)"
                              : col.color,
                            fontWeight: 700,
                            fontSize: 12,
                            cursor: updating === order.id ? "not-allowed" : "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          {updating === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </div>
                  ))}

                  {colOrders.length === 0 && (
                    <div style={{
                      textAlign: "center",
                      padding: "30px 10px",
                      color: "rgba(255,255,255,.15)",
                      fontSize: 12,
                    }}>
                      No orders here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.4); }
          50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
        }
      `}</style>
    </div>
  );
}