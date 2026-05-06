import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// ─── Configure Cloudinary ─────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 second timeout
});

// ─── Validate Cloudinary config on startup ────────────────────────────────────
function checkCloudinaryConfig() {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) missing.push("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  if (!process.env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!process.env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  return missing;
}

export async function POST(request) {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Config check — gives clear error instead of cryptic Cloudinary failure
  const missingVars = checkCloudinaryConfig();
  if (missingVars.length > 0) {
    console.error("Missing Cloudinary env vars:", missingVars);
    return NextResponse.json({
      error: `Server configuration error. Contact support.`,
      // Don't expose which vars are missing to client
    }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "general";

    // ✅ File validation
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Invalid file type: ${file.type}. Only JPG, PNG, WebP, GIF allowed.`
      }, { status: 400 });
    }

    // Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB allowed.`
      }, { status: 400 });
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // ✅ Upload to Cloudinary with proper error handling
    const slug = session.user?.restaurantSlug || "unknown";
    const result = await cloudinary.uploader.upload(base64, {
      folder: `orderflow/${slug}/${folder}`,
      transformation: [
        { quality: "auto", fetch_format: "auto" },
        { width: 1200, crop: "limit" },
      ],
      timeout: 55000, // slightly less than route timeout
    });

    if (!result?.secure_url) {
      throw new Error("Cloudinary returned no URL");
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });

  } catch (error) {
    console.error("Upload error:", error);

    // ✅ Specific error messages for common failures
    if (error.message?.includes("timeout") || error.code === "ETIMEDOUT") {
      return NextResponse.json({
        error: "Upload timed out. Please try a smaller image or check your connection."
      }, { status: 408 });
    }

    if (error.message?.includes("Invalid API key")) {
      return NextResponse.json({
        error: "Server configuration error. Contact support."
      }, { status: 500 });
    }

    if (error.message?.includes("File size too large")) {
      return NextResponse.json({
        error: "Image too large for Cloudinary. Please use a smaller image."
      }, { status: 400 });
    }

    return NextResponse.json({
      error: error.message || "Upload failed. Please try again."
    }, { status: 500 });
  }
}
