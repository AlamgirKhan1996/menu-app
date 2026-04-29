import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    include: { settings: true },
  });

  return NextResponse.json(restaurant);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name, nameAr, whatsapp, city,
    isOpen, logo, coverImage, accentColor,
    tagline, taglineAr,
    greetingMessage, awayMessage,
    openTime, closeTime,
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
}