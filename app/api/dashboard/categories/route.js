import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { order: "asc" },
    include: { _count: { select: { menuItems: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, nameAr } = await request.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const count = await prisma.category.count({
    where: { restaurantId: session.user.restaurantId },
  });

  const category = await prisma.category.create({
    data: {
      name,
      nameAr: nameAr || null,
      order: count,
      restaurantId: session.user.restaurantId,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();

  await prisma.category.delete({
    where: { id, restaurantId: session.user.restaurantId },
  });

  return NextResponse.json({ success: true });
}