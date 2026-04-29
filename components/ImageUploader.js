"use client";

import { useState, useRef } from "react";

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
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }

  async function handleFiles(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      if (multiple) {
        const urls = [];
        for (let i = 0; i < Math.min(files.length, maxImages - currentImages.length); i++) {
          const url = await uploadFile(files[i]);
          urls.push(url);
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        onImagesChange?.([...currentImages, ...urls]);
      } else {
        const url = await uploadFile(files[0]);
        onChange?.(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  const heights = { square: 160, banner: 120, logo: 100 };
  const height = heights[aspectRatio] || 160;

  if (multiple) {
    return (
      <div>
        {label && (
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.6)", display: "block", marginBottom: 8 }}>
            {label}
          </label>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 8 }}>
          {/* Existing images */}
          {currentImages.map((url, i) => (
            <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button
                onClick={() => onImagesChange?.(currentImages.filter((_, idx) => idx !== i))}
                style={{
                  position: "absolute", top: 4, right: 4,
                  width: 24, height: 24,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,.7)",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >✕</button>
            </div>
          ))}

          {/* Add more button */}
          {currentImages.length < maxImages && (
            <div
              onClick={() => inputRef.current?.click()}
              style={{
                aspectRatio: "1",
                borderRadius: 8,
                border: "2px dashed rgba(255,255,255,.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                background: dragOver ? "rgba(37,211,102,.08)" : "rgba(255,255,255,.03)",
                transition: "all .2s",
              }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>⏳</div>
                  <div style={{ fontSize: 10, color: "#25D366" }}>{progress}%</div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📸</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>Add photo</div>
                </div>
              )}
            </div>
          )}
        </div>

        {hint && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{hint}</div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
      </div>
    );
  }

  // Single image upload
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
          border: value ? "2px solid rgba(37,211,102,.3)" : "2px dashed rgba(255,255,255,.15)",
          background: dragOver ? "rgba(37,211,102,.08)" : "rgba(255,255,255,.03)",
          cursor: uploading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          transition: "all .2s",
          width: aspectRatio === "logo" ? height : "100%",
        }}
      >
        {value ? (
          <>
            <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "rgba(0,0,0,.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity .2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>📸</div>
              <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Change Photo</div>
            </div>
          </>
        ) : uploading ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13, color: "#25D366", fontWeight: 700 }}>Uploading {progress}%</div>
            <div style={{
              width: 120, height: 4,
              background: "rgba(255,255,255,.1)",
              borderRadius: 2,
              marginTop: 8,
              overflow: "hidden",
            }}>
              <div style={{
                width: `${progress}%`,
                height: "100%",
                background: "#25D366",
                transition: "width .3s",
              }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>
              Click or drag to upload
            </div>
            {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", marginTop: 4 }}>{hint}</div>}
          </div>
        )}
      </div>

      {value && (
        <button
          onClick={() => onChange?.(null)}
          style={{
            marginTop: 8,
            padding: "4px 12px",
            background: "rgba(239,68,68,.1)",
            border: "1px solid rgba(239,68,68,.2)",
            borderRadius: 6,
            color: "#EF4444",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Remove image
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(Array.from(e.target.files))}
      />
    </div>
  );
}