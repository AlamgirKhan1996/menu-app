import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 }, {plan: restaurant?.plan || "trial"});
    }

    if (!session.user?.restaurantId) {
      // SUPER_ADMIN or detached account: return safe defaults so the client
      // doesn't crash trying to read fields off null.
      return NextResponse.json({ onboardingComplete: true });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: session.user.restaurantId },
      select: { settings: true, plan: true },
    });

    if (!restaurant) {
      return NextResponse.json({ onboardingComplete: true });
    }

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[/api/dashboard/settings GET] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user?.restaurantId) {
      return NextResponse.json({ error: "No restaurant" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name, nameAr, whatsapp, city,
      isOpen, logo, coverImage, accentColor,
      tagline, taglineAr,
      greetingMessage, awayMessage,
      openTime, closeTime,
      onboardingComplete,
    } = body;

    await prisma.restaurant.update({
      where: { id: session.user.restaurantId },
      data: {
        name: name || undefined,
        nameAr: nameAr || undefined,
        whatsapp: whatsapp || undefined,
        city: city || undefined,
        isOpen: isOpen !== undefined ? isOpen : undefined,
        logo: logo !== undefined ? logo : undefined,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        accentColor: accentColor || undefined,
        tagline: tagline || undefined,
        taglineAr: taglineAr || undefined,
        ...(onboardingComplete !== undefined && { onboardingComplete }),
      },
    });

    await prisma.settings.upsert({
      where: { restaurantId: session.user.restaurantId },
      update: {
        greetingMessage: greetingMessage || null,
        awayMessage: awayMessage || null,
        openTime: openTime || null,
        closeTime: closeTime || null,
      },
      create: {
        restaurantId: session.user.restaurantId,
        greetingMessage: greetingMessage || null,
        awayMessage: awayMessage || null,
        openTime: openTime || null,
        closeTime: closeTime || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/dashboard/settings PATCH] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
