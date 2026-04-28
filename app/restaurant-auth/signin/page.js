"use client";

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  const inputStyle = {
    width: "100%",
    background: "#1A1E22",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0C0E",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', sans-serif",
    }}>

      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{
          width: 56, height: 56,
          background: "#25D366",
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          margin: "0 auto 14px",
        }}>💬</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>OrderFlow</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 4 }}>
          Restaurant Dashboard
        </div>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "#111416",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: "32px 28px",
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>
          Sign in to your dashboard
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 28 }}>
          Manage orders, menu, and analytics
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,.1)",
            border: "1px solid rgba(239,68,68,.3)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#EF4444",
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", display: "block", marginBottom: 7 }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@restaurant.com"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", display: "block", marginBottom: 7 }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "rgba(37,211,102,.5)" : "#25D366",
              color: "#000",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          No account yet?{" "}
          <Link href="/restaurant-auth/signup" style={{ color: "#25D366", fontWeight: 600 }}>
            Create restaurant account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div style={{ background: "#0A0C0E", minHeight: "100vh" }} />}>
      <SigninForm />
    </Suspense>
  );
}