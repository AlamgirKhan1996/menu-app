import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: {
      restaurantId: session.user.restaurantId,
      status: { not: "DONE" },
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await request.json();

  const order = await prisma.order.update({
    where: { id, restaurantId: session.user.restaurantId },
    data: { status },
    include: { items: true },
  });

  return NextResponse.json(order);
}