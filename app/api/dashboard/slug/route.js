import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { slug } = await request.json();

    if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

    // Validate slug format — only lowercase letters, numbers, hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        error: "Slug can only contain lowercase letters, numbers, and hyphens. No spaces or special characters."
      }, { status: 400 });
    }

    if (slug.length < 3 || slug.length > 40) {
      return NextResponse.json({
        error: "Slug must be between 3 and 40 characters."
      }, { status: 400 });
    }

    // Check not taken by another restaurant
    const existing = await prisma.restaurant.findUnique({ where: { slug } });
    if (existing && existing.id !== session.user.restaurantId) {
      return NextResponse.json({ error: "This URL is already taken. Try another one." }, { status: 409 });
    }

    // Update slug
    await prisma.restaurant.update({
      where: { id: session.user.restaurantId },
      data: { slug },
    });

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Slug update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
