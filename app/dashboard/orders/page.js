"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import  useOrderSound  from "@/components/OrderSound";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(null);
  const [newOrderFlash, setNewOrderFlash] = useState(false);
  const { playAlert } = useOrderSound();
  const isFirstLoad = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/orders");
      const data = await res.json();
      const active = data.filter(o => o.status !== "DONE" && o.status !== "CANCELLED");

      // Detect new orders after first load
      if (!isFirstLoad.current && lastCount !== null && active.length > lastCount) {
        playAlert();
        setNewOrderFlash(true);
        setTimeout(() => setNewOrderFlash(false), 3000);
      }

      isFirstLoad.current = false;
      setLastCount(active.length);
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lastCount, playAlert]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateStatus(orderId, status) {
    await fetch(`/api/dashboard/orders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    fetchOrders();
  }

  const columns = [
    { id: "NEW", label: "🆕 New", color: "#F59E0B", next: "CONFIRMED" },
    { id: "CONFIRMED", label: "✅ Confirmed", color: "#3B82F6", next: "COOKING" },
    { id: "COOKING", label: "👨‍🍳 Cooking", color: "#8B5CF6", next: "READY" },
    { id: "READY", label: "🛎️ Ready", color: "#25D366", next: "DONE" },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "rgba(255,255,255,.4)", fontSize: 14 }}>
      Loading orders...
    </div>
  );

  return (
    <div style={{ padding: "24px 20px" }}>

      {/* New Order Flash Banner */}
      {newOrderFlash && (
        <div style={{
          background: "linear-gradient(135deg, #F59E0B, #EF4444)",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          animation: "pulse 0.5s ease",
        }}>
          <span style={{ fontSize: 28 }}>🔔</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>New Order Received!</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>Check the NEW column below</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>Live Orders</h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
            🔄 Auto-refreshes every 8 seconds
          </div>
        </div>
        <div style={{
          background: orders.filter(o => o.status === "NEW").length > 0
            ? "rgba(245,158,11,.15)"
            : "rgba(255,255,255,.05)",
          border: orders.filter(o => o.status === "NEW").length > 0
            ? "1px solid rgba(245,158,11,.3)"
            : "1px solid rgba(255,255,255,.08)",
          borderRadius: 20,
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 700,
          color: orders.filter(o => o.status === "NEW").length > 0 ? "#F59E0B" : "rgba(255,255,255,.4)",
        }}>
          {orders.filter(o => o.status === "NEW").length} pending
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}>
        {columns.map(col => {
          const colOrders = orders.filter(o => o.status === col.id);
          return (
            <div key={col.id} style={{
              background: "rgba(255,255,255,.03)",
              border: `1px solid ${col.color}20`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              {/* Column Header */}
              <div style={{
                padding: "12px 16px",
                background: `${col.color}12`,
                borderBottom: `1px solid ${col.color}20`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>{col.label}</span>
                <span style={{
                  background: col.color,
                  color: "#000",
                  borderRadius: 99,
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {colOrders.length}
                </span>
              </div>

              {/* Orders */}
              <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, minHeight: 120 }}>
                {colOrders.length === 0 && (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,.2)", fontSize: 12, padding: "20px 0" }}>
                    No orders
                  </div>
                )}
                {colOrders.map(order => (
                  <div key={order.id} style={{
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 10,
                    padding: "12px",
                    borderLeft: `3px solid ${col.color}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>
                        #{order.orderNumber}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#25D366" }}>
                        SAR {order.total?.toFixed(2)}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: 8 }}>
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 2 }}>
                          {item.quantity}× {item.name}
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>

                    {order.customerName && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>
                        👤 {order.customerName}
                      </div>
                    )}

                    {/* Action Button */}
                    {col.next && (
                      <button
                        onClick={() => updateStatus(order.id, col.next)}
                        style={{
                          width: "100%",
                          padding: "7px",
                          background: `${col.color}20`,
                          border: `1px solid ${col.color}40`,
                          borderRadius: 8,
                          color: col.color,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        Move to {columns.find(c => c.id === col.next)?.label.split(" ").slice(1).join(" ")} →
                      </button>
                    )}
                    {col.id === "READY" && (
                      <button
                        onClick={() => updateStatus(order.id, "DONE")}
                        style={{
                          width: "100%",
                          padding: "7px",
                          background: "rgba(37,211,102,.15)",
                          border: "1px solid rgba(37,211,102,.3)",
                          borderRadius: 8,
                          color: "#25D366",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        ✅ Mark Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
