"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";

const COLORS = [
  { hex: "#25D366", name: "WhatsApp Green", label: "الأخضر" },
  { hex: "#FF6B35", name: "Flame Orange", label: "البرتقالي" },
  { hex: "#E63946", name: "Bold Red", label: "الأحمر" },
  { hex: "#D4A853", name: "Gold Luxury", label: "الذهبي" },
  { hex: "#06B6D4", name: "Ocean Blue", label: "الأزرق" },
  { hex: "#8B5CF6", name: "Royal Purple", label: "البنفسجي" },
  { hex: "#EC4899", name: "Rose Pink", label: "الوردي" },
  { hex: "#10B981", name: "Emerald", label: "الزمردي" },
];

const STEPS = [
  {
    id: 1,
    icon: "👋",
    title: "Welcome to OrderFlow",
    titleAr: "مرحباً في OrderFlow",
    subtitle: "Your restaurant's digital transformation starts here",
    subtitleAr: "ابدأ رحلة مطعمك الرقمية من هنا",
  },
  {
    id: 2,
    icon: "🖼️",
    title: "Upload Your Logo",
    titleAr: "أضف شعار مطعمك",
    subtitle: "Your logo is the face of your brand",
    subtitleAr: "الشعار هو هوية مطعمك البصرية",
  },
  {
    id: 3,
    icon: "🌅",
    title: "Set a Cover Photo",
    titleAr: "أضف صورة الغلاف",
    subtitle: "A stunning banner makes customers hungry",
    subtitleAr: "صورة جميلة تجعل العملاء يشتهون طعامك",
  },
  {
    id: 4,
    icon: "🎨",
    title: "Choose Your Brand Color",
    titleAr: "اختر لون علامتك التجارية",
    subtitle: "Your color sets the mood of your menu",
    subtitleAr: "لونك يعكس شخصية مطعمك",
  },
  {
    id: 5,
    icon: "🚀",
    title: "You're All Set!",
    titleAr: "كل شيء جاهز!",
    subtitle: "Your restaurant is live and ready for orders",
    subtitleAr: "مطعمك الآن حي وجاهز لاستقبال الطلبات",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({
    logo: null,
    coverImage: null,
    accentColor: "#25D366",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

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

  async function skipOnboarding() {
    try {
      await fetch("/api/dashboard/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      router.push("/dashboard");
    } catch (e) {
      router.push("/dashboard");
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const currentStep = STEPS[step - 1];
  const accentColor = form.accentColor;

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'Segoe UI', -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)`,
          transition: "background 0.8s ease",
          animation: "orb1 12s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
          transition: "background 0.8s ease",
          animation: "orb2 15s ease-in-out infinite",
        }} />
        {/* Grid texture */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.015) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <style>{`
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.03); }
          66% { transform: translate(15px, -10px) scale(0.98); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      {/* Main card */}
      <div style={{
        width: "100%",
        maxWidth: 500,
        position: "relative",
        zIndex: 1,
        animation: "slideUp 0.6s ease both",
      }}>

        {/* Top bar — step indicators + skip */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 24,
        }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: s.id <= step
                ? accentColor
                : "rgba(255,255,255,.1)",
              transition: "background 0.4s ease, width 0.4s ease",
              cursor: s.id < step ? "pointer" : "default",
            }}
              onClick={() => s.id < step && setStep(s.id)}
            />
          ))}
          <button
            onClick={skipOnboarding}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 99,
              color: "rgba(255,255,255,.4)",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 14px",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              transition: "all .2s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.3)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgba(255,255,255,.4)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.1)";
            }}
          >
            Skip →
          </button>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: `0 32px 64px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.05), inset 0 1px 0 rgba(255,255,255,.1)`,
        }}>

          {/* Accent top border */}
          <div style={{
            height: 2,
            background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
            transition: "background 0.8s ease",
          }} />

          <div style={{ padding: "36px 32px 32px" }}>

            {/* Step header */}
            <div style={{
              textAlign: "center",
              marginBottom: 32,
              animation: "slideUp 0.4s ease both",
              key: step,
            }}>
              {/* Icon with pulse ring */}
              <div style={{
                position: "relative",
                display: "inline-block",
                marginBottom: 20,
              }}>
                <div style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: "50%",
                  border: `2px solid ${accentColor}`,
                  animation: "pulse-ring 2s ease-out infinite",
                  opacity: step === 5 ? 1 : 0,
                  transition: "opacity 0.4s",
                }} />
                <div style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `${accentColor}18`,
                  border: `1.5px solid ${accentColor}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  transition: "background 0.8s ease, border-color 0.8s ease",
                }}>
                  {currentStep.icon}
                </div>
              </div>

              <h2 style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 8,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}>
                {currentStep.title}
              </h2>
              <p style={{
                fontSize: 13,
                color: "rgba(255,255,255,.45)",
                lineHeight: 1.6,
                direction: "rtl",
                marginBottom: 4,
              }}>
                {currentStep.subtitleAr}
              </p>
              <p style={{
                fontSize: 13,
                color: "rgba(255,255,255,.35)",
                lineHeight: 1.6,
              }}>
                {currentStep.subtitle}
              </p>
            </div>

            {/* ─── STEP CONTENT ─── */}

            {/* Step 1 — Welcome */}
            {step === 1 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 24,
                }}>
                  {[
                    { icon: "📱", title: "Digital Menu", desc: "Beautiful menu your customers will love" },
                    { icon: "💬", title: "WhatsApp Orders", desc: "Orders sent directly to your phone" },
                    { icon: "📊", title: "Live Analytics", desc: "Track revenue and top items" },
                    { icon: "🤖", title: "AI Writer", desc: "AI generates menu descriptions for you" },
                  ].map(f => (
                    <div key={f.title} style={{
                      background: "rgba(255,255,255,.04)",
                      border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: 14,
                      padding: "14px 12px",
                    }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", lineHeight: 1.5 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
                <div style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "rgba(255,255,255,.3)",
                }}>
                  ⏱️ Setup takes less than 2 minutes
                </div>
              </div>
            )}

            {/* Step 2 — Logo */}
            {step === 2 && (
              <div style={{ animation: "fadeIn 0.5s ease", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                <ImageUploader
                  value={form.logo}
                  onChange={url => setForm(p => ({ ...p, logo: url }))}
                  folder="logos"
                  aspectRatio="logo"
                  hint="Square image, min 200×200px recommended"
                />
                {!form.logo && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textAlign: "center" }}>
                    You can add or change this later in Settings
                  </p>
                )}
              </div>
            )}

            {/* Step 3 — Cover */}
            {step === 3 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <ImageUploader
                  value={form.coverImage}
                  onChange={url => setForm(p => ({ ...p, coverImage: url }))}
                  folder="covers"
                  aspectRatio="banner"
                  hint="Best: 1200×400px — a great food photo works perfectly"
                />
                {!form.coverImage && (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: 12 }}>
                    You can add or change this later in Settings
                  </p>
                )}
              </div>
            )}

            {/* Step 4 — Color */}
            {step === 4 && (
              <div style={{ animation: "fadeIn 0.5s ease" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {COLORS.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setForm(p => ({ ...p, accentColor: c.hex }))}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        border: form.accentColor === c.hex
                          ? `2px solid ${c.hex}`
                          : "2px solid rgba(255,255,255,.06)",
                        background: form.accentColor === c.hex
                          ? `${c.hex}18`
                          : "rgba(255,255,255,.03)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "all .2s",
                        fontFamily: "inherit",
                        boxShadow: form.accentColor === c.hex
                          ? `0 0 20px ${c.hex}30`
                          : "none",
                      }}
                    >
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: c.hex,
                        flexShrink: 0,
                        boxShadow: `0 2px 8px ${c.hex}60`,
                        transition: "box-shadow 0.3s",
                      }} />
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)" }}>{c.label}</div>
                      </div>
                      {form.accentColor === c.hex && (
                        <div style={{
                          marginLeft: "auto",
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: c.hex,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          color: "#000",
                          fontWeight: 900,
                        }}>✓</div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Live preview */}
                <div style={{
                  background: "rgba(0,0,0,.3)",
                  border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 14,
                  padding: "16px",
                  transition: "all .3s",
                }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginBottom: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>
                    Preview — معاينة
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{
                      padding: "8px 20px",
                      background: accentColor,
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#000",
                      transition: "background 0.3s",
                      boxShadow: `0 4px 16px ${accentColor}50`,
                    }}>
                      Order Now 💬
                    </div>
                    <div style={{
                      padding: "8px 20px",
                      background: `${accentColor}18`,
                      border: `1px solid ${accentColor}40`,
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      color: accentColor,
                      transition: "all 0.3s",
                    }}>
                      View Cart
                    </div>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: accentColor,
                      marginLeft: "auto",
                      boxShadow: `0 0 8px ${accentColor}`,
                      transition: "background 0.3s",
                    }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Open</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Done */}
            {step === 5 && (
              <div style={{ animation: "fadeIn 0.5s ease", textAlign: "center" }}>
                {/* Summary row */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  marginBottom: 24,
                }}>
                  {form.logo && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: `2px solid ${accentColor}`,
                        margin: "0 auto 6px",
                        boxShadow: `0 4px 16px ${accentColor}40`,
                      }}>
                        <img src={form.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Logo ✓</div>
                    </div>
                  )}
                  {form.coverImage && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 80,
                        height: 56,
                        borderRadius: 14,
                        overflow: "hidden",
                        border: `2px solid ${accentColor}`,
                        margin: "0 auto 6px",
                        boxShadow: `0 4px 16px ${accentColor}40`,
                      }}>
                        <img src={form.coverImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Cover ✓</div>
                    </div>
                  )}
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: accentColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      border: `2px solid ${accentColor}`,
                      margin: "0 auto 6px",
                      boxShadow: `0 4px 16px ${accentColor}60`,
                      transition: "background 0.3s",
                    }}>🎨</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Color ✓</div>
                  </div>
                </div>

                {/* Next steps */}
                <div style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 14,
                  padding: "16px 20px",
                  textAlign: "left",
                  marginBottom: 8,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.5)", marginBottom: 12, letterSpacing: ".05em", textTransform: "uppercase" }}>
                    Next Steps
                  </div>
                  {[
                    { icon: "➕", text: "Add menu categories", ar: "أضف فئات القائمة" },
                    { icon: "🍔", text: "Add your dishes with AI descriptions", ar: "أضف أطباقك بوصف ذكاء اصطناعي" },
                    { icon: "📱", text: "Share your QR code with customers", ar: "شارك رمز QR مع عملائك" },
                  ].map(item => (
                    <div key={item.text} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 10,
                    }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{item.text}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", direction: "rtl" }}>{item.ar}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── NAVIGATION ─── */}
            <div style={{
              marginTop: 28,
              display: "flex",
              gap: 10,
            }}>
              {/* Back button */}
              {step > 1 && step < 5 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  style={{
                    padding: "13px 20px",
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 12,
                    color: "rgba(255,255,255,.6)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,.06)"}
                >
                  ← Back
                </button>
              )}

              {/* Next / Finish button */}
              {step < 5 ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    border: "none",
                    borderRadius: 12,
                    color: "#000",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .3s",
                    boxShadow: `0 8px 24px ${accentColor}40`,
                    letterSpacing: "-.01em",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 12px 32px ${accentColor}60`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}40`;
                  }}
                >
                  {step === 1 ? "Let's Start 🚀" : step === 4 ? "Looks Great! ✨" : "Continue →"}
                </button>
              ) : (
                <button
                  onClick={saveAndFinish}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    background: saving
                      ? "rgba(255,255,255,.06)"
                      : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    border: "none",
                    borderRadius: 12,
                    color: saving ? "rgba(255,255,255,.3)" : "#000",
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    transition: "all .3s",
                    boxShadow: saving ? "none" : `0 8px 24px ${accentColor}40`,
                    letterSpacing: "-.01em",
                  }}
                >
                  {saving ? "Saving..." : "Go to Dashboard →"}
                </button>
              )}
            </div>

            {/* Step counter */}
            <div style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 11,
              color: "rgba(255,255,255,.2)",
              letterSpacing: ".08em",
            }}>
              STEP {step} OF {STEPS.length}
            </div>
          </div>
        </div>

        {/* OrderFlow branding */}
        <div style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 11,
          color: "rgba(255,255,255,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}>
          <div style={{
            width: 18,
            height: 18,
            background: "#25D366",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
          }}>💬</div>
          OrderFlow — WhatsApp Ordering System
        </div>
      </div>
    </div>
  );
}
