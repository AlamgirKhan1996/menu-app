"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    restaurantName: "",
    whatsapp: "",
    email: "",
    password: "",
    city: "Madinah",
  });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/restaurant/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created! Please sign in.");
        router.push("/restaurant-auth/signin");
        return;
      }

      router.push("/dashboard");

    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    background: "#1A1E22",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 8,
    padding: "11px 14px",
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
          The WhatsApp ordering system for restaurants
        </div>
      </div>

      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "#111416",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: "32px 28px",
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 6 }}>
          Create your restaurant account
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 28 }}>
          Set up in 2 minutes. Start receiving orders today.
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

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", display: "block", marginBottom: 7 }}>
              Restaurant Name
            </label>
            <input
              type="text"
              name="restaurantName"
              placeholder="e.g. Smash Kitchen"
              value={form.restaurantName}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", display: "block", marginBottom: 7 }}>
              WhatsApp Number
            </label>
            <input
              type="tel"
              name="whatsapp"
              placeholder="966501234567"
              value={form.whatsapp}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.75)", display: "block", marginBottom: 7 }}>
              City
            </label>
            <select
              name="city"
              value={form.city}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              {["Madinah", "Makkah", "Riyadh", "Jeddah", "Dammam", "Other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
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
              placeholder="Minimum 8 characters"
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
            {loading ? "Creating your restaurant..." : "Create Restaurant Account →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(255,255,255,.4)" }}>
          Already have an account?{" "}
          <Link href="/restaurant-auth/signin" style={{ color: "#25D366", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}