"use client";
// ─────────────────────────────────────────────────────────
// <PlanGate requiredPlan="pro" currentPlan={restaurant.plan}>
//   <AnalyticsPage />
// </PlanGate>
//
// Wraps any feature — shows a locked overlay if plan too low
// ─────────────────────────────────────────────────────────
import { isAtLeast, PLANS } from "@/lib/planAccess";

export default function PlanGate({ requiredPlan, currentPlan, children, featureName }) {
  const hasAccess = isAtLeast(currentPlan, requiredPlan);

  if (hasAccess) return <>{children}</>;

  const required = PLANS[requiredPlan];

  return (
    <div style={{ position: "relative" }}>
      {/* Blurred background — the actual content */}
      <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.4 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(8,12,16,0.85)",
        backdropFilter: "blur(2px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,.1)",
        padding: 32,
        textAlign: "center",
        zIndex: 10,
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <div style={{
          fontSize: 18,
          fontWeight: 800,
          color: "#fff",
          marginBottom: 8,
        }}>
          {featureName || "This Feature"} is Locked
        </div>
        <div style={{
          fontSize: 13,
          color: "rgba(255,255,255,.5)",
          marginBottom: 20,
          maxWidth: 280,
          lineHeight: 1.6,
        }}>
          Upgrade to <strong style={{ color: required.color }}>{required.label}</strong> ({required.priceLabel}/mo)
          to unlock this feature.
        </div>

        <a
          href="/dashboard/upgrade"
          style={{
            display: "inline-block",
            background: required.color,
            color: required.label === "Starter" ? "#fff" : "#0a0a0a",
            padding: "10px 24px",
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Upgrade to {required.label} →
        </a>
      </div>
    </div>
  );
}