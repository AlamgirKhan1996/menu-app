// app/api/restaurant/signup/route.js
// Creates a new restaurant + owner account in one step

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")        // spaces and underscores → hyphens
    .replace(/[^\w\-]+/g, "")       // remove non-word chars
    .replace(/\-\-+/g, "-")         // multiple hyphens → single
    .replace(/^-+/, "")             // trim leading hyphens
    .replace(/-+$/, "");            // trim trailing hyphens
}

async function generateUniqueSlug(name) {
  let slug = slugify(name);
  let exists = await prisma.restaurant.findUnique({ where: { slug } });
  let counter = 1;
  while (exists) {
    slug = slugify(name) + "-" + counter;
    exists = await prisma.restaurant.findUnique({ where: { slug } });
    counter++;
  }
  return slug;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantName, whatsapp, email, password, city } = body;

    // ── Validation ──────────────────────────────────────────
    if (!restaurantName || !whatsapp || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Clean WhatsApp number - remove spaces, dashes, +
    const cleanWhatsapp = whatsapp.replace(/[\s\-\+]/g, "");

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // ── Create restaurant + owner in one transaction ─────────
    const hashedPassword = await bcrypt.hash(password, 12);
    const slug = await generateUniqueSlug(restaurantName);

    const result = await prisma.$transaction(async (tx) => {
      // Create restaurant
      const restaurant = await tx.restaurant.create({
        data: {
          name: restaurantName,
          slug,
          whatsapp: cleanWhatsapp,
          city: city || "Madinah",
          plan: "FREE",
        },
      });

      // Create owner user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          role: "OWNER",
          restaurantId: restaurant.id,
        },
      });

      // Create default settings
      await tx.settings.create({
        data: {
          restaurantId: restaurant.id,
          greetingMessage:
            "مرحباً! 🎉 وصلنا طلبك بنجاح. سيتم التواصل معك خلال دقيقتين للتأكيد. شكراً لاختيارك مطعمنا ❤️",
          awayMessage:
            "المطعم مغلق حالياً. سنرد عليك فور فتح المطعم ✅",
          openTime: "10:00",
          closeTime: "23:00",
          openDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
          soundAlert: true,
        },
      });

      return { restaurant, user };
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant created successfully",
      slug: result.restaurant.slug,
    });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
