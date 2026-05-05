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

  try {
    const { id, status } = await request.json();
    
    console.log("PATCH called with:", { id, status });
    console.log("Session user:", session.user);

    const existing = await prisma.order.findFirst({
      where: { id, restaurantId: session.user.restaurantId },
    });

    console.log("Found order:", existing);

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH order error FULL:", error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
}