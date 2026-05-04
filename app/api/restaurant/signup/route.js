import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { name, nameAr, email, password, whatsapp, city } = await request.json();

    if (!name || !email || !password || !whatsapp) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    // Check email not already used
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Generate slug from restaurant name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 30) || `restaurant-${Date.now()}`;

    // Make slug unique
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // 🆕 Trial = 7 days from now
    const trialEndsAt = new Date((Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days in ms

    const hashedPassword = await bcrypt.hash(password, 12);

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        nameAr: nameAr || null,
        slug,
        whatsapp,
        city: city || "Riyadh",
        trialEndsAt,          // 🆕
        isPaid: false,         // 🆕
        isActive: true,
        users: {
          create: {
            email,
            password: hashedPassword,
            role: "OWNER",
          },
        },
        settings: {
          create: {},
        },
      },
    });

    return NextResponse.json({
      success: true,
      slug: restaurant.slug,
      trialEndsAt,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}