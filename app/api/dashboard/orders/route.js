import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOrderHistoryDays } from "@/lib/planAccess";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "today"; // today | week | month
  const restaurantId = session.user.restaurantId;
  const plan = session.user.plan || "trial";
  const includeRecent = searchParams.get("includeRecent") === "true";

  let dateFilter;
  const now = new Date();
  if (range === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    dateFilter = {createdAt: { gte: startOfDay }};
  }
  else if (range === "7days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    dateFilter = {createdAt: { gte: d }};
  }
  else if (range === "30days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    dateFilter = {createdAt: { gte: d }};
  }

  const maxDays = getOrderHistoryDays(plan);
  const planCutoff = new Date(now);
  planCutoff.setDate(planCutoff.getDate() - maxDays);

  let finalDateFilter = {};
  if( dateFilter.createdAt?.gte || planCutoff ) {
    const userForm = dateFilter.createdAt?.gte || planCutoff;
    const effectiveForm = userForm > planCutoff ? userForm : planCutoff;
    finalDateFilter = { createdAt: { gte: effectiveForm } };
  }

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      ...finalDateFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 500, // safety cap to prevent overload
  });

  return NextResponse.json(orders);
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
