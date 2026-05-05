import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const includeRecent = searchParams.get("includeRecent") === "true";

  // Base filter — always exclude very old DONE/CANCELLED orders from live view
  // If includeRecent = true, include orders from the last 24 hours even if DONE/CANCELLED
  // so the history tab shows today's completed orders
  const where = includeRecent
    ? {
        restaurantId: session.user.restaurantId,
        OR: [
          { status: { notIn: ["DONE", "CANCELLED"] } },
          // Include DONE/CANCELLED from last 24h for history tab
          {
            status: { in: ["DONE", "CANCELLED"] },
            updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        ],
      }
    : {
        restaurantId: session.user.restaurantId,
        status: { not: "DONE" },
      };

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { orderId, status } = await request.json();

    const existing = await prisma.order.findFirst({
      where: { id: orderId, restaurantId: session.user.restaurantId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("PATCH order error:", error);
    return NextResponse.json({ error: error.message, code: error.code }, { status: 500 });
  }
}
