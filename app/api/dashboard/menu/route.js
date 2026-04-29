import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.menuItem.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: { category: true },
    orderBy: { order: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name, nameAr, description, descriptionAr,
    price, categoryId, image, images,
    isAvailable, isFeatured,
  } = body;

  if (!name || !price || !categoryId) {
    return NextResponse.json({ error: "Name, price and category required" }, { status: 400 });
  }

  const count = await prisma.menuItem.count({
    where: { restaurantId: session.user.restaurantId },
  });

  const item = await prisma.menuItem.create({
    data: {
      name,
      nameAr: nameAr || null,
      description: description || null,
      descriptionAr: descriptionAr || null,
      price: parseFloat(price),
      image: image || null,
      images: images || [],
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
      order: count,
      categoryId,
      restaurantId: session.user.restaurantId,
    },
    include: { category: true },
  });

  return NextResponse.json(item);
}