"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

// ─── Plan config ──────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    nameAr: "المبتدئ",
    price: 99,
    priceAnnual: 89,
    color: "#64748B",
    icon: "🌱",
    badge: null,
    description: "For small restaurants getting started",
    descriptionAr: "للمطاعم الصغيرة في بداية رحلتها",
    features: [
      { text: "Digital menu (up to 30 items)", ar: "قائمة رقمية حتى 30 صنف", ok: true },
      { text: "WhatsApp ordering", ar: "طلبات عبر واتساب", ok: true },
      { text: "QR Code generator", ar: "مولد رمز QR", ok: true },
      { text: "Basic dashboard", ar: "لوحة تحكم أساسية", ok: true },
      { text: "AI Menu Writer", ar: "كاتب قائمة بالذكاء الاصطناعي", ok: false },
      { text: "Analytics & reports", ar: "التحليلات والتقارير", ok: false },
      { text: "Customer database", ar: "قاعدة بيانات العملاء", ok: false },
    ],
  },
  {
    id: "PRO",
    name: "Pro Restaurant",
    nameAr: "المطعم الاحترافي",
    price: 199,
    priceAnnual: 169,
    color: "#25D366",
    icon: "⭐",
    badge: "MOST POPULAR · الأكثر طلباً",
    description: "Everything you need to grow fast",
    descriptionAr: "كل ما تحتاجه للنمو السريع",
    features: [
      { text: "Unlimited menu items", ar: "أصناف قائمة غير محدودة", ok: true },
      { text: "WhatsApp ordering", ar: "طلبات عبر واتساب", ok: true },
      { text: "QR Code generator", ar: "مولد رمز QR", ok: true },
      { text: "🤖 AI Menu Writer", ar: "🤖 كاتب قائمة بالذكاء الاصطناعي", ok: true },
      { text: "Analytics dashboard", ar: "لوحة التحليلات", ok: true },
      { text: "Customer database", ar: "قاعدة بيانات العملاء", ok: true },
      { text: "Priority support", ar: "دعم مميز", ok: true },
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    nameAr: "المؤسسي",
    price: 399,
    priceAnnual: 339,
    color: "#D4A853",
    icon: "👑",
    badge: "FOR CHAINS · للسلاسل",
    description: "For restaurant groups & multiple branches",
    descriptionAr: "لمجموعات المطاعم والفروع المتعددة",
    features: [
      { text: "Everything in Pro", ar: "كل مميزات Pro", ok: true },
      { text: "Multiple branches", ar: "فروع متعددة", ok: true },
      { text: "WhatsApp broadcast", ar: "بث واتساب للعملاء", ok: true },
      { text: "Monthly Arabic report", ar: "تقرير شهري بالعربي", ok: true },
      { text: "Dedicated account manager", ar: "مدير حساب مخصص", ok: true },
      { text: "Custom branding", ar: "تخصيص العلامة التجارية", ok: true },
      { text: "API access", ar: "وصول API", ok: true },
    ],
  },
];

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "barq",
    name: "Barq",
    nameAr: "برق",
    icon: "⚡",
    gradient: "linear-gradient(135deg, #0a1628, #0d2045)",
    border: "rgba(251,191,36,.3)",
    glow: "rgba(251,191,36,.12)",
    tagline: "ادفع عبر برق · Pay via Barq",
    color: "#FBBF24",
    bankDetails: [
      { label: "Bank · البنك",         value: "Arab National Bank (ANB)" },
      { label: "Name · الاسم",          value: "ALAMGIR KHAN MUHTAJ" },
      { label: "IBAN · آيبان",          value: "SA7030100991109106066485" },
      { label: "Account · رقم الحساب", value: "991109106066485" },
    ],
  },
  {
    id: "bank",
    name: "Bank Transfer",
    nameAr: "تحويل بنكي",
    icon: "🏦",
    gradient: "linear-gradient(135deg, #0a1a0a, #0d200d)",
    border: "rgba(37,211,102,.2)",
    glow: "rgba(37,211,102,.08)",
    tagline: "تحويل بنكي مباشر · Direct bank transfer",
    color: "#25D366",
    bankDetails: [
      { label: "Bank · البنك",         value: "Arab National Bank (ANB)" },
      { label: "Name · الاسم",          value: "ALAMGIR KHAN MUHTAJ" },
      { label: "IBAN · آيبان",          value: "SA7030100991109106066485" },
      { label: "Account · رقم الحساب", value: "991109106066485" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function PlanCard({ plan, selected, onSelect, billing }) {
  const price = billing === "annual" ? plan.priceAnnual : plan.price;
  const saving = plan.price - plan.priceAnnual;

  return (
    <div
      onClick={() => onSelect(plan.id)}
      style={{
        background: selected ? `${plan.color}0d` : "rgba(255,255,255,.025)",
        border: selected ? `2px solid ${plan.color}` : "2px solid rgba(255,255,255,.07)",
        borderRadius: 20,
        padding: "24px 20px",
        cursor: "pointer",
        transition: "all .25s ease",
        position: "relative",
        boxShadow: selected ? `0 0 40px ${plan.color}20, inset 0 1px 0 ${plan.color}20` : "none",
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div style={{
          position: "absolute",
          top: -13,
          left: "50%",
          transform: "translateX(-50%)",
          background: plan.color,
          color: plan.id === "PRO" ? "#000" : "#fff",
          fontSize: 10,
          fontWeight: 900,
          padding: "4px 14px",
          borderRadius: 99,
          whiteSpace: "nowrap",
          letterSpacing: ".04em",
        }}>
          {plan.badge}
        </div>
      )}

      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{plan.icon}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{plan.name}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", direction: "rtl", textAlign: "left" }}>{plan.nameAr}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 2, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 2 }}>SAR</span>
            <span style={{ fontSize: 30, fontWeight: 900, color: plan.color, lineHeight: 1 }}>{price}</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>/month · شهرياً</div>
          {billing === "annual" && (
            <div style={{
              fontSize: 10, fontWeight: 700,
              color: "#25D366",
              background: "rgba(37,211,102,.12)",
              borderRadius: 99,
              padding: "2px 8px",
              marginTop: 4,
            }}>
              Save SAR {saving * 12}/yr
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16, lineHeight: 1.5 }}>
        {plan.description} · {plan.descriptionAr}
      </div>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontSize: 12,
          }}>
            <span style={{
              color: f.ok ? plan.color : "rgba(255,255,255,.2)",
              flexShrink: 0,
              fontWeight: 900,
              fontSize: 13,
            }}>
              {f.ok ? "✓" : "✕"}
            </span>
            <span style={{ color: f.ok ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.2)" }}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* Selected indicator */}
      {selected && (
        <div style={{
          marginTop: 16,
          padding: "8px",
          background: plan.color,
          borderRadius: 10,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 900,
          color: plan.id === "PRO" ? "#000" : "#fff",
          letterSpacing: ".02em",
        }}>
          ✓ Selected · محدد
        </div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const { data: session } = useSession();
  const [trial, setTrial] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [billing, setBilling] = useState("monthly"); // monthly | annual
  const [step, setStep] = useState(1); // 1=plans, 2=payment
  const [selectedMethod, setSelectedMethod] = useState("barq");
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    (async () => {
      try {
        const res = await fetch("/api/dashboard/trial");
        const text = await res.text();
        if (!text) return;
        setTrial(JSON.parse(text));
      } catch (e) {}
    })();
  }, []);

  const plan = PLANS.find(p => p.id === selectedPlan);
  const method = PAYMENT_METHODS.find(m => m.id === selectedMethod);
  const price = billing === "annual" ? plan.priceAnnual : plan.price;

  function copyNumber() {
    if (!method?.number) return;
    navigator.clipboard.writeText(method.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "receipts");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setReceipt(data.url);
    setUploading(false);
  }

  async function submitConfirmation() {
    const billingLabel = billing === "annual" ? "Annual" : "Monthly";
    const message = encodeURIComponent(
      `💰 NEW PAYMENT — OrderFlow\n\n` +
      `🏪 Restaurant: ${session?.user?.restaurantName || "Unknown"}\n` +
      `📧 Email: ${session?.user?.email}\n` +
      `📦 Plan: ${plan.name} ${billingLabel} — SAR ${price}/month\n` +
      `💳 Method: ${method.name}\n` +
      `🧾 Receipt: ${receipt || "Not uploaded"}\n\n` +
      `Please activate their account in /admin 🚀`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    setSubmitted(true);
  }

  if (!mounted) return null;

  // ── SUBMITTED ──
  if (submitted) {
    return (
      <div style={pageWrap}>
        <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: 80, height: 80,
            borderRadius: "50%",
            background: "rgba(37,211,102,.15)",
            border: "2px solid rgba(37,211,102,.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40,
            margin: "0 auto 24px",
            boxShadow: "0 0 40px rgba(37,211,102,.2)",
          }}>🎉</div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
            Payment Submitted!
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>
            تم إرسال تأكيد الدفع بنجاح
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 28, marginTop: 16 }}>
            Your account will be activated within{" "}
            <strong style={{ color: "#25D366" }}>2 hours</strong> during business hours.
          </p>

          <div style={{
            background: "rgba(37,211,102,.06)",
            border: "1px solid rgba(37,211,102,.15)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 24,
            textAlign: "left",
          }}>
            {[
              { icon: "✅", en: "Payment confirmation received", ar: "تم استلام تأكيد الدفع" },
              { icon: "⏳", en: "Account activation in progress", ar: "جاري تفعيل الحساب" },
              { icon: "📱", en: "WhatsApp confirmation coming", ar: "سيصلك تأكيد عبر واتساب" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                marginBottom: i < 2 ? 12 : 0,
              }}>
                <span>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{item.en}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", direction: "rtl", textAlign: "left" }}>{item.ar}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)" }}>
            Questions? WhatsApp: +966 59 563 2609
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrap}>
      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes glow { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        .method-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: 36, animation: "slideUp .5s ease" }}>
        {/* Trial status pill */}
        {trial && trial.status !== "PAID" && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: trial.status === "EXPIRED"
              ? "rgba(239,68,68,.12)"
              : "rgba(245,158,11,.12)",
            border: `1px solid ${trial.status === "EXPIRED" ? "rgba(239,68,68,.25)" : "rgba(245,158,11,.25)"}`,
            borderRadius: 99,
            padding: "6px 16px",
            fontSize: 12,
            fontWeight: 700,
            color: trial.status === "EXPIRED" ? "#EF4444" : "#F59E0B",
            marginBottom: 20,
          }}>
            {trial.status === "EXPIRED" ? "🚨 Trial Expired · انتهت التجربة" : `⏳ ${trial.daysLeft} days left · ${trial.daysLeft} أيام متبقية`}
          </div>
        )}

        <h1 style={{
          fontSize: "clamp(24px, 5vw, 36px)",
          fontWeight: 900,
          color: "#fff",
          marginBottom: 8,
          letterSpacing: "-.02em",
          lineHeight: 1.15,
        }}>
          {trial?.status === "EXPIRED" ? "Keep Your Restaurant Live" : "Upgrade Your Plan"}
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,.35)", direction: "rtl", marginBottom: 4 }}>
          {trial?.status === "EXPIRED" ? "احتفظ بمطعمك نشطاً وابدأ استقبال الطلبات" : "ارقِّ خطتك واستمر في النمو"}
        </p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", maxWidth: 420, margin: "0 auto" }}>
          Join restaurants across Saudi Arabia using OrderFlow every day
        </p>
      </div>

      {/* ── STEP 1: PLANS ── */}
      {step === 1 && (
        <div style={{ animation: "slideUp .4s ease" }}>

          {/* Billing toggle */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 14,
            padding: 4,
            width: "fit-content",
            margin: "0 auto 32px",
          }}>
            {["monthly", "annual"].map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: billing === b ? "rgba(255,255,255,.12)" : "transparent",
                  color: billing === b ? "#fff" : "rgba(255,255,255,.4)",
                  fontSize: 13, fontWeight: billing === b ? 700 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all .2s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {b === "monthly" ? "Monthly · شهري" : (
                  <>
                    Annual · سنوي
                    <span style={{
                      background: "#25D366",
                      color: "#000",
                      fontSize: 9, fontWeight: 900,
                      padding: "2px 6px", borderRadius: 99,
                    }}>-20%</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Plan cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            maxWidth: 940,
            margin: "0 auto 32px",
          }}>
            {PLANS.map(p => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selectedPlan === p.id}
                onSelect={setSelectedPlan}
                billing={billing}
              />
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: "16px 52px",
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}bb)`,
                border: "none", borderRadius: 16,
                color: selectedPlan === "PRO" ? "#000" : "#fff",
                fontSize: 16, fontWeight: 900,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 12px 40px ${plan.color}40`,
                marginBottom: 14,
                transition: "all .3s",
                letterSpacing: "-.01em",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = `0 18px 48px ${plan.color}55`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 12px 40px ${plan.color}40`;
              }}
            >
              Continue with {plan.name} — SAR {price}/mo →
            </button>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.25)", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <span>✓ No automatic charges</span>
              <span>✓ Manual activation</span>
              <span>✓ WhatsApp support 24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2: PAYMENT ── */}
      {step === 2 && (
        <div style={{ maxWidth: 520, margin: "0 auto", animation: "slideUp .4s ease" }}>

          {/* Order summary card */}
          <div style={{
            background: `${plan.color}0d`,
            border: `1px solid ${plan.color}30`,
            borderRadius: 16,
            padding: "18px 20px",
            marginBottom: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>
                Order Summary · ملخص الطلب
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
                {plan.icon} {plan.name} · {plan.nameAr}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 2 }}>
                {billing === "annual" ? "Annual billing · فوترة سنوية" : "Monthly billing · فوترة شهرية"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: plan.color }}>SAR {price}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)" }}>/month</div>
            </div>
          </div>

          {/* Payment method selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 12 }}>
              💳 Choose Payment Method · اختر طريقة الدفع
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PAYMENT_METHODS.map(m => (
                <div
                  key={m.id}
                  className="method-card"
                  onClick={() => setSelectedMethod(m.id)}
                  style={{
                    background: selectedMethod === m.id ? m.gradient : "rgba(255,255,255,.03)",
                    border: selectedMethod === m.id ? `2px solid ${m.border.replace(".3)", ".6)")}` : `1px solid ${m.border}`,
                    borderRadius: 14,
                    padding: "16px 18px",
                    cursor: "pointer",
                    transition: "all .25s ease",
                    boxShadow: selectedMethod === m.id ? `0 8px 32px ${m.glow}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: selectedMethod === m.id ? `${m.color}20` : "rgba(255,255,255,.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                    transition: "all .25s",
                    border: `1px solid ${selectedMethod === m.id ? m.color + "30" : "rgba(255,255,255,.06)"}`,
                  }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>
                      {m.name} · {m.nameAr}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{m.tagline}</div>
                  </div>
                  <div style={{
                    width: 20, height: 20,
                    borderRadius: "50%",
                    border: `2px solid ${selectedMethod === m.id ? m.color : "rgba(255,255,255,.2)"}`,
                    background: selectedMethod === m.id ? m.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "all .2s",
                  }}>
                    {selectedMethod === m.id && (
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#000" }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment details */}
          {/* Payment Details — works for both Barq and Bank */}
<div style={{
  background: method.gradient,
  border: `1px solid ${method.border}`,
  borderRadius: 16,
  padding: "20px",
  marginBottom: 20,
  boxShadow: `0 8px 32px ${method.glow}`,
}}>
  <div style={{
    fontSize: 12, fontWeight: 700,
    color: "rgba(255,255,255,.4)",
    marginBottom: 14,
    letterSpacing: ".06em",
    textTransform: "uppercase",
  }}>
    {selectedMethod === "barq"
      ? "⚡ أرسل المبلغ عبر برق لهذا الحساب · Send via Barq to this account"
      : "🏦 حوّل المبلغ لهذا الحساب · Transfer to this account"}
  </div>

  {/* Account details */}
  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
    {method.bankDetails.map(({ label, value }) => {
      const isIban = label.includes("IBAN") || label.includes("Account");
      return (
        <div key={label} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          background: "rgba(0,0,0,.25)",
          borderRadius: 10,
          gap: 12,
          flexWrap: "wrap",
        }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
            {label}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              fontSize: isIban ? 12 : 13,
              fontWeight: 700,
              color: "#fff",
              fontFamily: isIban ? "monospace" : "inherit",
              letterSpacing: isIban ? 1 : 0,
            }}>
              {value}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(value);
              }}
              style={{
                padding: "3px 8px",
                background: `${method.color}20`,
                border: `1px solid ${method.color}30`,
                borderRadius: 6,
                color: method.color,
                fontSize: 10, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              📋
            </button>
          </div>
        </div>
      );
    })}
  </div>

  {/* Amount to send */}
  <div style={{
    background: `${method.color}15`,
    border: `1px solid ${method.color}30`,
    borderRadius: 12,
    padding: "14px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  }}>
    <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>
      Amount to send · المبلغ المطلوب
    </div>
    <div style={{ fontSize: 22, fontWeight: 900, color: method.color }}>
      SAR {price}
    </div>
  </div>

  {/* Steps */}
  <div style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  }}>
    {(selectedMethod === "barq" ? [
      "افتح تطبيق برق · Open Barq",
      "اختار تحويل · Choose Transfer",
      "أدخل تفاصيل الحساب · Enter details",
      "ارفع الإيصال أدناه ↓ · Upload receipt",
    ] : [
      "افتح تطبيقك البنكي · Open banking app",
      "اختار تحويل آيبان · Choose IBAN transfer",
      "أدخل تفاصيل الحساب · Enter details",
      "ارفع الإيصال أدناه ↓ · Upload receipt",
    ]).map((step, i) => (
      <div key={i} style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        fontSize: 11,
        color: "rgba(255,255,255,.55)",
        lineHeight: 1.5,
      }}>
        <span style={{
          width: 18, height: 18, flexShrink: 0,
          borderRadius: "50%",
          background: `${method.color}20`,
          border: `1px solid ${method.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, fontWeight: 900, color: method.color,
        }}>
          {i + 1}
        </span>
        {step}
      </div>
    ))}
  </div>
</div>

{/* Receipt upload — show for both methods */}
<div style={{ marginBottom: 20 }}>
  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 10 }}>
    📸 Upload Payment Receipt · ارفع إيصال الدفع
  </div>
  <label style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: receipt
      ? "2px solid rgba(37,211,102,.4)"
      : "2px dashed rgba(255,255,255,.12)",
    borderRadius: 14,
    padding: "28px 20px",
    cursor: "pointer",
    background: receipt ? "rgba(37,211,102,.05)" : "rgba(255,255,255,.02)",
    transition: "all .25s",
    gap: 8,
  }}>
    {uploading ? (
      <>
        <div style={{ fontSize: 32 }}>⏳</div>
        <div style={{ fontSize: 13, color: "#25D366", fontWeight: 700 }}>Uploading...</div>
      </>
    ) : receipt ? (
      <>
        <div style={{ fontSize: 32 }}>✅</div>
        <div style={{ fontSize: 13, color: "#25D366", fontWeight: 700 }}>Receipt uploaded!</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>Tap to change · اضغط للتغيير</div>
      </>
    ) : (
      <>
        <div style={{ fontSize: 32 }}>📸</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
          Upload receipt screenshot · ارفع لقطة الإيصال
        </div>
      </>
    )}
    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleReceiptUpload} />
  </label>
</div>

{/* Submit */}
<button
  onClick={submitConfirmation}
  disabled={!receipt}
  style={{
    width: "100%",
    padding: "16px",
    background: receipt
      ? "linear-gradient(135deg, #25D366, #128C7E)"
      : "rgba(255,255,255,.06)",
    border: "none",
    borderRadius: 14,
    color: receipt ? "#fff" : "rgba(255,255,255,.25)",
    fontSize: 15, fontWeight: 900,
    cursor: receipt ? "pointer" : "not-allowed",
    fontFamily: "inherit",
    marginBottom: 10,
    transition: "all .3s",
    boxShadow: receipt ? "0 8px 32px rgba(37,211,102,.3)" : "none",
  }}
>
  💬 Confirm Payment via WhatsApp · تأكيد الدفع
</button>
          <button
            onClick={() => setStep(1)}
            style={{
              width: "100%",
              padding: "12px",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,.25)",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Back to plans · العودة للخطط
          </button>

          <div style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(255,255,255,.2)",
            marginTop: 16,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <span>✓ Activated within 2 hours</span>
            <span>✓ WhatsApp support 24/7</span>
            <span>✓ No auto-charges ever</span>
          </div>
        </div>
      )}
    </div>
  );
}

const pageWrap = {
  minHeight: "100vh",
  background: "#080c10",
  padding: "32px 20px 60px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  color: "#fff",
};
