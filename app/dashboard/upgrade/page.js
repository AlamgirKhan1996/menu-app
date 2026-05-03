"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    nameAr: "المبتدئ",
    price: 99,
    color: "#6B7280",
    icon: "🌱",
    description: "Perfect for small restaurants just getting started",
    features: [
      "✅ Digital menu (up to 30 items)",
      "✅ WhatsApp ordering",
      "✅ QR Code generator",
      "✅ Basic dashboard",
      "❌ AI Menu Writer",
      "❌ Analytics",
      "❌ Customer database",
    ],
  },
  {
    id: "PRO",
    name: "Pro Restaurant",
    nameAr: "المطعم الاحترافي",
    price: 199,
    color: "#25D366",
    icon: "⭐",
    popular: true,
    description: "Everything you need to grow your restaurant",
    features: [
      "✅ Unlimited menu items",
      "✅ WhatsApp ordering",
      "✅ QR Code generator",
      "✅ 🤖 AI Menu Writer",
      "✅ Analytics dashboard",
      "✅ Customer database",
      "✅ Priority support",
    ],
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    nameAr: "المؤسسي",
    price: 399,
    color: "#D4A853",
    icon: "👑",
    description: "For restaurant groups and multiple branches",
    features: [
      "✅ Everything in Pro",
      "✅ Multiple branches",
      "✅ WhatsApp broadcast campaigns",
      "✅ Monthly Arabic analytics report",
      "✅ Dedicated account manager",
      "✅ Custom branding",
    ],
  },
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const [trial, setTrial] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("PRO");
  const [step, setStep] = useState(1); // 1=plans, 2=payment, 3=confirm
  const [receipt, setReceipt] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const STC_PAY_NUMBER = "0595632609"; // YOUR number
  const WHATSAPP_NUMBER = "966595632609";

  useEffect(() => {
    fetch("/api/dashboard/trial")
      .then(r => r.json())
      .then(setTrial);
  }, []);

  function copySTCNumber() {
    navigator.clipboard.writeText(STC_PAY_NUMBER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  async function submitPaymentConfirmation() {
    const plan = PLANS.find(p => p.id === selectedPlan);

    // Notify YOU via WhatsApp
    const message = encodeURIComponent(
      `💰 NEW PAYMENT CONFIRMATION\n\n` +
      `Restaurant: ${session?.user?.restaurantName || "Unknown"}\n` +
      `Email: ${session?.user?.email}\n` +
      `Plan: ${plan.name} — SAR ${plan.price}/month\n` +
      `Receipt: ${receipt || "Not uploaded"}\n\n` +
      `Please activate their account in /admin`
    );

    // Open WhatsApp to notify you
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    setSubmitted(true);
  }

  const plan = PLANS.find(p => p.id === selectedPlan);

  // Step 3 — Submitted
  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 12 }}>
              Payment Submitted!
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.7, marginBottom: 24 }}>
              We received your payment confirmation. Your account will be activated within <strong style={{ color: "#25D366" }}>2 hours</strong> during business hours.
            </p>
            <div style={{
              background: "rgba(37,211,102,.08)",
              border: "1px solid rgba(37,211,102,.15)",
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
            }}>
              {[
                "✅ Payment confirmation received",
                "⏳ Account activation in progress",
                "📱 You'll get a WhatsApp confirmation",
              ].map(item => (
                <div key={item} style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 8 }}>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
              Questions? WhatsApp us: +966 59 563 2609
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        {trial?.status === "EXPIRED" ? (
          <>
            <div style={{
              display: "inline-block",
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.2)",
              borderRadius: 99,
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 700,
              color: "#EF4444",
              marginBottom: 16,
            }}>
              🚨 Trial Expired
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              Keep Your Restaurant Live
            </h1>
          </>
        ) : (
          <>
            <div style={{
              display: "inline-block",
              background: "rgba(245,158,11,.1)",
              border: "1px solid rgba(245,158,11,.2)",
              borderRadius: 99,
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 700,
              color: "#F59E0B",
              marginBottom: 16,
            }}>
              ⏳ {trial?.daysLeft} days left in your trial
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginBottom: 8 }}>
              Upgrade Your Plan
            </h1>
          </>
        )}
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.4)", maxWidth: 400, margin: "0 auto" }}>
          Join restaurants in Riyadh already using OrderFlow to get more orders every day
        </p>
      </div>

      {step === 1 && (
        <>
          {/* Plans */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 28,
            maxWidth: 900,
            margin: "0 auto 28px",
          }}>
            {PLANS.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                style={{
                  background: selectedPlan === p.id
                    ? `${p.color}10`
                    : "rgba(255,255,255,.03)",
                  border: selectedPlan === p.id
                    ? `2px solid ${p.color}`
                    : "2px solid rgba(255,255,255,.06)",
                  borderRadius: 18,
                  padding: "24px 20px",
                  cursor: "pointer",
                  transition: "all .2s",
                  position: "relative",
                }}
              >
                {p.popular && (
                  <div style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: p.color,
                    color: "#000",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "4px 16px",
                    borderRadius: 99,
                    whiteSpace: "nowrap",
                  }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>{p.icon}</div>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>{p.nameAr}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: p.color }}>
                      {p.price}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>SAR/month</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 16, lineHeight: 1.5 }}>
                  {p.description}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {p.features.map(f => (
                    <div key={f} style={{
                      fontSize: 12,
                      color: f.startsWith("❌") ? "rgba(255,255,255,.25)" : "rgba(255,255,255,.7)",
                    }}>
                      {f}
                    </div>
                  ))}
                </div>

                {selectedPlan === p.id && (
                  <div style={{
                    marginTop: 16,
                    padding: "8px",
                    background: p.color,
                    borderRadius: 10,
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#000",
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center" }}>
            <button
              onClick={() => setStep(2)}
              style={{
                padding: "16px 48px",
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                border: "none",
                borderRadius: 14,
                color: "#000",
                fontSize: 16,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: `0 8px 30px ${plan.color}40`,
                marginBottom: 16,
              }}
            >
              Continue with {plan.name} — SAR {plan.price}/mo →
            </button>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>
              No automatic charges · Cancel anytime · WhatsApp support
            </div>
          </div>
        </>
      )}

      {step === 2 && (
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={cardStyle}>

            {/* Order Summary */}
            <div style={{
              background: `${plan.color}10`,
              border: `1px solid ${plan.color}30`,
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginBottom: 8 }}>Order Summary</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>
                    {plan.icon} {plan.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>Monthly subscription</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: plan.color }}>
                  SAR {plan.price}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
                💳 Payment Method
              </div>

              {/* STC Pay */}
              <div style={{
                background: "rgba(255,255,255,.04)",
                border: "2px solid rgba(109,40,217,.4)",
                borderRadius: 14,
                padding: 20,
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #6D28D9, #4C1D95)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}>💜</div>
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>STC Pay</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>
                      Instant transfer — most popular in Saudi
                    </div>
                  </div>
                </div>

                <div style={{
                  background: "rgba(0,0,0,.3)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginBottom: 4 }}>
                      STC Pay Number
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>
                      {STC_PAY_NUMBER}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>
                      Alamgir Khan — OrderFlow
                    </div>
                  </div>
                  <button
                    onClick={copySTCNumber}
                    style={{
                      padding: "10px 18px",
                      background: copied ? "rgba(37,211,102,.2)" : "rgba(109,40,217,.3)",
                      border: copied ? "1px solid rgba(37,211,102,.4)" : "1px solid rgba(109,40,217,.4)",
                      borderRadius: 10,
                      color: copied ? "#25D366" : "#fff",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all .2s",
                    }}
                  >
                    {copied ? "✅ Copied!" : "📋 Copy"}
                  </button>
                </div>

                <div style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.4)",
                  lineHeight: 1.7,
                  background: "rgba(255,255,255,.03)",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}>
                  1. Open STC Pay app<br />
                  2. Send <strong style={{ color: "#fff" }}>SAR {plan.price}</strong> to {STC_PAY_NUMBER}<br />
                  3. Take screenshot of receipt<br />
                  4. Upload below ↓
                </div>
              </div>

              {/* Bank Transfer */}
              <div style={{
                background: "rgba(255,255,255,.02)",
                border: "1px solid rgba(255,255,255,.08)",
                borderRadius: 14,
                padding: 16,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🏦</span>
                  <div>
                    <div style={{ fontWeight: 700, color: "rgba(255,255,255,.6)", fontSize: 13 }}>
                      Bank Transfer (IBAN)
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
                      Contact us on WhatsApp for bank details
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=أريد الدفع عن طريق التحويل البنكي لخطة ${plan.name} - ${plan.price} ريال`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      marginLeft: "auto",
                      padding: "7px 14px",
                      background: "rgba(37,211,102,.1)",
                      border: "1px solid rgba(37,211,102,.2)",
                      borderRadius: 8,
                      color: "#25D366",
                      fontSize: 11,
                      fontWeight: 700,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Receipt Upload */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                📸 Upload Payment Receipt
              </div>

              <label style={{
                display: "block",
                border: receipt
                  ? "2px solid rgba(37,211,102,.4)"
                  : "2px dashed rgba(255,255,255,.15)",
                borderRadius: 12,
                padding: 24,
                textAlign: "center",
                cursor: "pointer",
                background: receipt ? "rgba(37,211,102,.05)" : "rgba(255,255,255,.02)",
                transition: "all .2s",
              }}>
                {uploading ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontSize: 13, color: "#25D366", fontWeight: 700 }}>Uploading...</div>
                  </div>
                ) : receipt ? (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 13, color: "#25D366", fontWeight: 700 }}>Receipt uploaded!</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
                      Click to change
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
                      Upload STC Pay screenshot
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
                      Tap to select from camera or gallery
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleReceiptUpload}
                />
              </label>
            </div>
            {/* Submit */}
            <button
              onClick={submitPaymentConfirmation}
              disabled={!receipt}
              style={{
                width: "100%",
                padding: "16px",
                background: receipt
                  ? "linear-gradient(135deg, #25D366, #128C7E)"
                  : "rgba(255,255,255,.06)",
                border: "none",
                borderRadius: 14,
                color: receipt ? "#fff" : "rgba(255,255,255,.3)",
                fontSize: 15,
                fontWeight: 800,
                cursor: receipt ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                marginBottom: 12,
              }}
            >
              💬 Confirm Payment via WhatsApp
            </button>

            <button
              onClick={() => setStep(1)}
              style={{
                width: "100%",
                padding: "12px",
                background: "none",
                border: "none",
                color: "rgba(255,255,255,.3)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              ← Back to plans
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 12 }}>
              Account activated within 2 hours · WhatsApp support 24/7
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#0a0a0f",
  padding: "32px 20px",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const cardStyle = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 20,
  padding: "28px 24px",
};