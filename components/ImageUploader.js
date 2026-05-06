"use client";

import { useState, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadWithRetry(file, folder, attempt = 1) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Upload failed (${res.status})`);
    }

    const data = await res.json();
    if (!data.url) throw new Error("No URL returned from upload");
    return data.url;

  } catch (err) {
    // Don't retry if user aborted or file is invalid
    if (err.name === "AbortError") throw new Error("Upload timed out — please try again");
    if (attempt >= MAX_RETRIES) throw err;

    // Retry with exponential backoff
    await sleep(RETRY_DELAY_MS * attempt);
    return uploadWithRetry(file, folder, attempt + 1);
  }
}

function validateFile(file) {
  if (!file) return "No file selected";
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Only JPG, PNG, WebP or GIF allowed. Got: ${file.type || "unknown"}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File too large (${formatFileSize(file.size)}). Max size: ${MAX_FILE_SIZE_MB}MB`;
  }
  return null; // valid
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ImageUploader({
  value,
  onChange,
  folder = "general",
  label = "Upload Image",
  hint = "",
  aspectRatio = "square",
  multiple = false,
  maxImages = 4,
  currentImages = [],
  onImagesChange,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const inputRef = useRef(null);

  // ─── Single file upload ───────────────────────────────────────────────────
  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setError("");
    setUploading(true);
    setProgress(0);
    setRetrying(false);

    try {
      if (multiple) {
        const remaining = maxImages - currentImages.length;
        const toUpload = Array.from(files).slice(0, remaining);
        const urls = [];

        for (let i = 0; i < toUpload.length; i++) {
          const file = toUpload[i];
          const validationError = validateFile(file);
          if (validationError) {
            setError(validationError);
            continue;
          }

          // Show retry indicator on second+ attempts
          const url = await uploadWithRetry(file, folder).catch(async (err) => {
            setRetrying(true);
            await sleep(500);
            setRetrying(false);
            throw err;
          });

          urls.push(url);
          setProgress(Math.round(((i + 1) / toUpload.length) * 100));
        }

        if (urls.length > 0) {
          onImagesChange?.([...currentImages, ...urls]);
        }

      } else {
        const file = files[0];
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          setUploading(false);
          return;
        }

        setProgress(20);
        const url = await uploadWithRetry(file, folder);
        setProgress(100);
        onChange?.(url);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Upload failed — please try again");
    } finally {
      setUploading(false);
      setProgress(0);
      setRetrying(false);
      // Reset input so same file can be re-uploaded
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }

  const heights = { square: 160, banner: 120, logo: 100 };
  const height = heights[aspectRatio] || 160;

  // ─── Error display ────────────────────────────────────────────────────────
  const ErrorBanner = () => error ? (
    <div style={{
      marginTop: 8,
      padding: "8px 12px",
      background: "rgba(239,68,68,.1)",
      border: "1px solid rgba(239,68,68,.25)",
      borderRadius: 8,
      fontSize: 12,
      color: "#EF4444",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    }}>
      <span>⚠️ {error}</span>
      <button
        onClick={() => { setError(""); inputRef.current?.click(); }}
        style={{
          background: "rgba(239,68,68,.15)",
          border: "1px solid rgba(239,68,68,.3)",
          borderRadius: 6,
          color: "#EF4444",
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 8px",
          cursor: "pointer",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Try again
      </button>
    </div>
  ) : null;

  // ─── Upload progress bar ─────────────────────────────────────────────────
  const ProgressBar = () => uploading ? (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
        fontSize: 11,
        color: "rgba(255,255,255,.5)",
      }}>
        <span>{retrying ? "⟳ Retrying..." : "Uploading..."}</span>
        <span>{progress}%</span>
      </div>
      <div style={{
        height: 4,
        background: "rgba(255,255,255,.08)",
        borderRadius: 2,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: retrying ? "100%" : `${Math.max(progress, 10)}%`,
          background: retrying
            ? "linear-gradient(90deg, #F59E0B, #EF4444)"
            : "linear-gradient(90deg, #25D366, #128C7E)",
          borderRadius: 2,
          transition: "width .3s ease",
          animation: retrying ? "pulse-bar 1s ease infinite" : "none",
        }} />
      </div>
      {retrying && (
        <div style={{ fontSize: 11, color: "#F59E0B", marginTop: 4 }}>
          Connection slow — retrying automatically...
        </div>
      )}
      <style>{`
        @keyframes pulse-bar {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  ) : null;

  // ─── MULTIPLE images mode ─────────────────────────────────────────────────
  if (multiple) {
    return (
      <div>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>
            {label}
          </label>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
          {currentImages.map((url, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <button
                onClick={() => onImagesChange?.(currentImages.filter((_, idx) => idx !== i))}
                style={{
                  position: "absolute", top: 4, right: 4,
                  width: 24, height: 24, borderRadius: "50%",
                  background: "rgba(0,0,0,.75)", border: "none",
                  color: "#fff", fontSize: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >✕</button>
            </div>
          ))}

          {currentImages.length < maxImages && (
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                aspectRatio: "1", borderRadius: 8,
                border: `2px dashed ${dragOver ? "rgba(37,211,102,.5)" : "rgba(255,255,255,.15)"}`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                background: dragOver ? "rgba(37,211,102,.08)" : "rgba(255,255,255,.03)",
                transition: "all .2s",
                opacity: uploading ? .6 : 1,
              }}
            >
              {uploading ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>⏳</div>
                  <div style={{ fontSize: 9, color: retrying ? "#F59E0B" : "#25D366", fontWeight: 700 }}>
                    {retrying ? "Retrying..." : `${progress}%`}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>📸</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Add photo</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,.25)", marginTop: 2 }}>Max {MAX_FILE_SIZE_MB}MB</div>
                </div>
              )}
            </div>
          )}
        </div>

        <ErrorBanner />
        <ProgressBar />

        {hint && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{hint}</div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
      </div>
    );
  }

  // ─── SINGLE image mode ────────────────────────────────────────────────────
  return (
    <div>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>
          {label}
        </label>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          height,
          borderRadius: aspectRatio === "logo" ? "50%" : 10,
          border: error
            ? "2px dashed rgba(239,68,68,.4)"
            : value
            ? "2px solid rgba(37,211,102,.3)"
            : `2px dashed ${dragOver ? "rgba(37,211,102,.5)" : "rgba(255,255,255,.15)"}`,
          background: dragOver
            ? "rgba(37,211,102,.08)"
            : error
            ? "rgba(239,68,68,.05)"
            : "rgba(255,255,255,.03)",
          cursor: uploading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", position: "relative", transition: "all .2s",
          width: aspectRatio === "logo" ? height : "100%",
          opacity: uploading ? .85 : 1,
        }}
      >
        {value && !uploading ? (
          <>
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                e.target.style.display = "none";
                setError("Failed to load image — please re-upload");
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,.5)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              opacity: 0, transition: "opacity .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📸</div>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Change Photo</div>
            </div>
          </>
        ) : uploading ? (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              {retrying ? "⟳" : "⏳"}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: retrying ? "#F59E0B" : "#25D366" }}>
              {retrying ? "Retrying..." : `Uploading ${progress}%`}
            </div>
            {retrying && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 4 }}>
                Slow connection — hang tight...
              </div>
            )}
            <div style={{
              width: 120, height: 4,
              background: "rgba(255,255,255,.1)",
              borderRadius: 2, marginTop: 10,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${Math.max(progress, 10)}%`,
                height: "100%",
                background: retrying
                  ? "linear-gradient(90deg, #F59E0B, #EF4444)"
                  : "#25D366",
                borderRadius: 2,
                transition: "width .3s",
              }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
              Click or drag to upload
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>
              JPG, PNG, WebP · Max {MAX_FILE_SIZE_MB}MB
            </div>
            {hint && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", marginTop: 2 }}>{hint}</div>
            )}
          </div>
        )}
      </div>

      <ErrorBanner />
      <ProgressBar />

      {value && !uploading && (
        <button
          onClick={() => { onChange?.(null); setError(""); }}
          style={{
            marginTop: 8,
            padding: "5px 12px",
            background: "rgba(239,68,68,.08)",
            border: "1px solid rgba(239,68,68,.2)",
            borderRadius: 8,
            color: "#EF4444",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🗑 Remove
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(Array.from(e.target.files))}
      />
    </div>
  );
}
