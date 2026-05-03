"use client";

import { useState, useEffect } from "react";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, color: "rgba(255,255,255,.4)", fontSize: 14 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
        Loading analytics...
      </div>
    </div>
  );

  const { revenue, orders, customers, trend, topItems, hourCounts, statusBreakdown } = data;

  // Chart helpers
  const maxRevenue = Math.max(...trend.map(d => d.revenue), 1);
  const maxHour = Math.max(...hourCounts, 1);
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  const statCard = (icon, label, value, sub, color, growth) => (
    <div style={{
      background: "rgba(255,255,255,.04)",
      border: `1px solid ${color}20`,
      borderRadius: 16,
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}15, transparent)`,
      }} />
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{sub}</div>}
      {growth !== undefined && (
        <div style={{
          position: "absolute", top: 16, right: 16,
          fontSize: 11, fontWeight: 700,
          color: growth >= 0 ? "#25D366" : "#EF4444",
          background: growth >= 0 ? "rgba(37,211,102,.1)" : "rgba(239,68,68,.1)",
          padding: "3px 8px", borderRadius: 99,
        }}>
          {growth >= 0 ? "↑" : "↓"} {Math.abs(growth)}%
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: "24px 20px", maxWidth: 1100, margin: "0 auto", color: "#fff", fontFamily: "-apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 4 }}>📊 Analytics</h1>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          Last 30 days performance overview
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {statCard("💰", "Today's Revenue", `SAR ${revenue.today}`, `Yesterday: SAR ${revenue.yesterday}`, "#25D366", revenue.growth)}
        {statCard("📅", "This Week", `SAR ${revenue.week}`, `${orders.week} orders`, "#8B5CF6")}
        {statCard("📦", "Total Orders", orders.month, `This month`, "#F59E0B")}
        {statCard("🧾", "Avg Order Value", `SAR ${orders.avgValue}`, `Per order`, "#06B6D4")}
        {statCard("👥", "Total Customers", customers.total, `${customers.repeat} repeat (${customers.repeatRate}%)`, "#EC4899")}
        {statCard("🏆", "Monthly Revenue", `SAR ${revenue.month}`, `30 days`, "#D4A853")}
      </div>

      {/* Revenue Chart + Top Items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Revenue Trend Chart */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16, padding: "20px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📈 Revenue Trend</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>Last 7 days</div>

          {/* Bar Chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 8 }}>
            {trend.map((d, i) => {
              const height = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 4) : 4;
              const isToday = i === 6;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.4)", fontWeight: 600 }}>
                    {d.revenue > 0 ? d.revenue : ""}
                  </div>
                  <div style={{
                    width: "100%",
                    height: `${height}%`,
                    background: isToday
                      ? "linear-gradient(to top, #25D366, #128C7E)"
                      : "rgba(37,211,102,.25)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height .3s ease",
                    position: "relative",
                    minHeight: 4,
                  }} />
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div style={{ display: "flex", gap: 8 }}>
            {trend.map((d, i) => (
              <div key={i} style={{
                flex: 1, textAlign: "center",
                fontSize: 9, color: i === 6 ? "#25D366" : "rgba(255,255,255,.3)",
                fontWeight: i === 6 ? 700 : 400,
              }}>
                {d.day}
              </div>
            ))}
          </div>

          {/* Orders line below */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Orders per day</div>
            <div style={{ display: "flex", gap: 8 }}>
              {trend.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700,
                    color: d.orders > 0 ? "#F59E0B" : "rgba(255,255,255,.2)",
                  }}>
                    {d.orders}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Items */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16, padding: "20px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🔥 Top Selling Items</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>By order count this month</div>

          {topItems.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)", padding: "40px 0", fontSize: 13 }}>
              No orders yet this month
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {topItems.map((item, i) => {
                const maxCount = topItems[0]?.count || 1;
                const pct = Math.round((item.count / maxCount) * 100);
                const colors = ["#25D366", "#8B5CF6", "#F59E0B", "#06B6D4", "#EC4899"];
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 22, height: 22,
                          borderRadius: "50%",
                          background: colors[i],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 900, color: "#000",
                          flexShrink: 0,
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: colors[i] }}>{item.count}x</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>SAR {Math.round(item.revenue)}</div>
                      </div>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: colors[i], borderRadius: 2,
                        transition: "width .5s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Busiest Hours + Customers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Busiest Hours Heatmap */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16, padding: "20px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🕐 Busiest Hours</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>
            Peak: {peakHour}:00 – {peakHour + 1}:00
          </div>
          <div style={{ fontSize: 11, color: "#25D366", marginBottom: 16, fontWeight: 700 }}>
            {hourCounts[peakHour]} orders at peak hour
          </div>

          {/* 24-hour heatmap */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3, marginBottom: 8 }}>
            {hourCounts.map((count, hour) => {
              const intensity = maxHour > 0 ? count / maxHour : 0;
              const isPeak = hour === peakHour;
              return (
                <div
                  key={hour}
                  title={`${hour}:00 — ${count} orders`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 4,
                    background: isPeak
                      ? "#25D366"
                      : intensity > 0
                      ? `rgba(37,211,102,${0.1 + intensity * 0.7})`
                      : "rgba(255,255,255,.06)",
                    border: isPeak ? "1px solid #25D366" : "1px solid transparent",
                    cursor: "pointer",
                    position: "relative",
                  }}
                />
              );
            })}
          </div>

          {/* Hour labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
            {[0,2,4,6,8,10,12,14,16,18,20,22].map(h => (
              <div key={h} style={{ fontSize: 8, color: "rgba(255,255,255,.3)", textAlign: "center" }}>
                {h}h
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>Low</div>
            {[0.1, 0.3, 0.5, 0.7, 1].map(v => (
              <div key={v} style={{
                width: 14, height: 14,
                borderRadius: 3,
                background: `rgba(37,211,102,${v})`,
              }} />
            ))}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)" }}>High</div>
          </div>
        </div>

        {/* Top Customers */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 16, padding: "20px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>👑 Top Customers</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>By total spent</div>

          {customers.top.length === 0 ? (
            <div style={{ textAlign: "center", color: "rgba(255,255,255,.3)", padding: "40px 0", fontSize: 13 }}>
              No customers yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {customers.top.map((c, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  gap: 12, padding: "10px 12px",
                  background: "rgba(255,255,255,.04)",
                  borderRadius: 10,
                  border: i === 0 ? "1px solid rgba(212,168,83,.3)" : "1px solid rgba(255,255,255,.06)",
                }}>
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: i === 0 ? "#D4A853" : "rgba(255,255,255,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: i === 0 ? 18 : 14,
                    fontWeight: 900,
                    color: i === 0 ? "#000" : "rgba(255,255,255,.6)",
                    flexShrink: 0,
                  }}>
                    {i === 0 ? "👑" : i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
                      {c.name || c.phone}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                      {c.orderCount} orders
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#25D366" }}>
                    SAR {Math.round(c.totalSpent)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Customer stats */}
          <div style={{
            marginTop: 16,
            padding: "12px",
            background: "rgba(255,255,255,.03)",
            borderRadius: 10,
            display: "flex", justifyContent: "space-around",
          }}>
            {[
              { label: "Total", value: customers.total, icon: "👥" },
              { label: "Repeat", value: customers.repeat, icon: "🔄" },
              { label: "Rate", value: `${customers.repeatRate}%`, icon: "📈" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div style={{
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16, padding: "20px",
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📋 Order Status Breakdown</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 20 }}>This month</div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { status: "NEW", label: "New", color: "#F59E0B", icon: "🆕" },
            { status: "CONFIRMED", label: "Confirmed", color: "#3B82F6", icon: "✅" },
            { status: "COOKING", label: "Cooking", color: "#8B5CF6", icon: "👨‍🍳" },
            { status: "READY", label: "Ready", color: "#25D366", icon: "🛎️" },
            { status: "DONE", label: "Completed", color: "#10B981", icon: "🏁" },
            { status: "CANCELLED", label: "Cancelled", color: "#EF4444", icon: "❌" },
          ].map(({ status, label, color, icon }) => {
            const count = statusBreakdown[status] || 0;
            const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} style={{
                flex: "1 1 140px",
                background: `${color}10`,
                border: `1px solid ${color}25`,
                borderRadius: 12,
                padding: "14px 16px",
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color }}>{count}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginBottom: 6 }}>{label}</div>
                <div style={{ height: 3, background: "rgba(255,255,255,.08)", borderRadius: 2 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}