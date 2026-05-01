"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

const STEPS = [
  { id: 1, title: "Welcome! 🎉", subtitle: "Let's set up your restaurant in 4 quick steps" },
  { id: 2, title: "Upload Your Logo", subtitle: "Your logo appears on the menu customers see" },
  { id: 3, title: "Add a Cover Photo", subtitle: "A beautiful banner makes customers hungry!" },
  { id: 4, title: "Pick Your Brand Color", subtitle: "Match your restaurant's personality" },
  { id: 5, title: "You're Ready! 🚀", subtitle: "Your restaurant is live and ready for orders" },
];

const COLORS = [
  { hex: "#25D366", name: "WhatsApp Green" },
  { hex: "#FF6B35", name: "Flame Orange" },
  { hex: "#E63946", name: "Bold Red" },
  { hex: "#D4A853", name: "Gold Luxury" },
  { hex: "#06B6D4", name: "Ocean Blue" },
  { hex: "#8B5CF6", name: "Royal Purple" },
  { hex: "#EC4899", name: "Rose Pink" },
  { hex: "#10B981", name: "Emerald" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    logo: null,
    coverImage: null,
    accentColor: "#25D366",
  });

  async function saveAndFinish() {
    setSaving(true);
    try {
      await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo: form.logo,
          coverImage: form.coverImage,
          accentColor: form.accentColor,
          onboardingComplete: true,
        }),
      });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f1923 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 24,
        overflow: "hidden",
      }}>

        {/* Progress Bar */}
        <div style={{ height: 4, background: "rgba(255,255,255,.06)" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #25D366, #8B5CF6)",
            transition: "width .5s ease",
          }} />
        </div>

        <div style={{ padding: "32px 28px" }}>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {STEPS.map(s => (
              <div key={s.id} style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: s.id <= step ? "#25D366" : "rgba(255,255,255,.1)",
                transition: "background .3s",
              }} />
            ))}
          </div>

          {/* Step Header */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 8 }}>
              {STEPS[step - 1].title}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
              {STEPS[step - 1].subtitle}
            </p>
          </div>

          {/* Step Content */}

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 72, marginBottom: 24 }}>🍽️</div>
              <div style={{
                background: "rgba(37,211,102,.08)",
                border: "1px solid rgba(37,211,102,.15)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 24,
                textAlign: "left",
              }}>
                {[
                  "✅ Beautiful digital menu your customers will love",
                  "✅ Orders directly to WhatsApp — no app needed",
                  "✅ QR code for your tables — print and go",
                  "✅ AI writes your menu descriptions for you",
                ].map(item => (
                  <div key={item} style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginBottom: 10, lineHeight: 1.5 }}>
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>
                Setup takes less than 5 minutes ⏱️
              </div>
            </div>
          )}

          {/* Step 2 — Logo */}
          {step === 2 && (
            <div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <ImageUploader
                    value={form.logo}
                    onChange={url => setForm(p => ({ ...p, logo: url }))}
                    folder="logos"
                    aspectRatio="logo"
                    hint="Square image, min 200×200px"
                  />
                </div>
              </div>
              {!form.logo && (
                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "rgba(255,255,255,.3)",
                  marginTop: 12,
                }}>
                  You can skip this and add it later in Settings
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Cover */}
          {step === 3 && (
            <div>
              <ImageUploader
                value={form.coverImage}
                onChange={url => setForm(p => ({ ...p, coverImage: url }))}
                folder="covers"
                aspectRatio="banner"
                hint="Best size: 1200×400px. A great food photo works perfectly!"
              />
              {!form.coverImage && (
                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "rgba(255,255,255,.3)",
                  marginTop: 12,
                }}>
                  You can skip this and add it later in Settings
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Color */}
          {step === 4 && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setForm(p => ({ ...p, accentColor: c.hex }))}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: form.accentColor === c.hex
                        ? `2px solid ${c.hex}`
                        : "2px solid rgba(255,255,255,.06)",
                      background: form.accentColor === c.hex
                        ? `${c.hex}20`
                        : "rgba(255,255,255,.03)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      transition: "all .2s",
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28,
                      borderRadius: "50%",
                      background: c.hex,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div style={{
                marginTop: 20,
                padding: "12px 16px",
                background: "rgba(0,0,0,.3)",
                borderRadius: 12,
                display: "flex",
                gap: 10,
                alignItems: "center",
              }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Preview:</div>
                <div style={{
                  padding: "6px 16px",
                  background: form.accentColor,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#000",
                }}>
                  Order Now 💬
                </div>
                <div style={{
                  padding: "6px 16px",
                  background: form.accentColor + "20",
                  border: `1px solid ${form.accentColor}40`,
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  color: form.accentColor,
                }}>
                  View Cart
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Done */}
          {step === 5 && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: 16,
                marginBottom: 24,
              }}>
                {form.logo && (
                  <div style={{ textAlign: "center" }}>
                    <img src={form.logo} alt="" style={{
                      width: 64, height: 64,
                      borderRadius: 16,
                      objectFit: "cover",
                      border: `3px solid ${form.accentColor}`,
                      marginBottom: 6,
                    }} />
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Logo ✅</div>
                  </div>
                )}
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: 16,
                    background: form.accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    marginBottom: 6,
                    border: `3px solid ${form.accentColor}`,
                  }}>🎨</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Color ✅</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: 8 }}>
                Your menu is live! Next steps:
              </div>
              {[
                "➕ Add your menu categories",
                "🍔 Add your dishes with AI descriptions",
                "📱 Share your QR code with customers",
              ].map(item => (
                <div key={item} style={{ fontSize: 13, color: "rgba(255,255,255,.5)", marginBottom: 8 }}>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
            justifyContent: step === 1 ? "center" : "space-between",
          }}>
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  padding: "12px 24px",
                  background: "rgba(255,255,255,.06)",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 12,
                  color: "rgba(255,255,255,.6)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← Back
              </button>
            )}

            {step < 4 && (
              <button
                onClick={() => setStep(s => s + 1)}
                style={{
                  flex: step === 1 ? "0 0 200px" : 1,
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #25D366, #128C7E)",
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {step === 1 ? "Let's Start! 🚀" : "Continue →"}
              </button>
            )}

            {step === 4 && (
              <button
                onClick={() => setStep(5)}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  background: `linear-gradient(135deg, ${form.accentColor}, #8B5CF6)`,
                  border: "none",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                This looks great! ✨
              </button>
            )}

            {step === 5 && (
              <button
                onClick={saveAndFinish}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: saving
                    ? "rgba(255,255,255,.06)"
                    : "linear-gradient(135deg, #25D366, #128C7E)",
                  border: "none",
                  borderRadius: 12,
                  color: saving ? "rgba(255,255,255,.3)" : "#fff",
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving ? "Saving..." : "Go to Dashboard! 🎉"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
