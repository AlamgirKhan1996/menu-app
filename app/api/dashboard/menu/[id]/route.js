import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    name, nameAr, description, descriptionAr,
    price, categoryId, image, images,
    isAvailable, isFeatured,
  } = body;

  const item = await prisma.menuItem.update({
    where: { id: params.id, restaurantId: session.user.restaurantId },
    data: {
      name,
      nameAr: nameAr || null,
      description: description || null,
      descriptionAr: descriptionAr || null,
      price: parseFloat(price),
      image: image || null,
      images: images || [],
      isAvailable,
      isFeatured,
      categoryId,
    },
    include: { category: true },
  });

  return NextResponse.json(item);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.menuItem.delete({
    where: { id: params.id, restaurantId: session.user.restaurantId },
  });

  return NextResponse.json({ success: true });
}