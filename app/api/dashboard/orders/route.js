import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOrderHistoryDays } from "@/lib/planAccess";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "today";
  const restaurantId = session.user.restaurantId;
  const plan = session.user.plan || "trial";

  const now = new Date();

  // ── Plan cutoff ──────────────────────────────────────
  const maxDays = getOrderHistoryDays(plan);
  const planCutoff = new Date(now);
  planCutoff.setDate(planCutoff.getDate() - maxDays);

  // ── Range filter ─────────────────────────────────────
  let rangeFrom = null;

  if (range === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    rangeFrom = startOfDay;
  } else if (range === "7days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    rangeFrom = d;
  } else if (range === "30days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    rangeFrom = d;
  } else if (range === "90days") {
    const d = new Date(now);
    d.setDate(d.getDate() - 90);
    rangeFrom = d;
  }
  // "all" = rangeFrom stays null

  // ── Pick the more restrictive of the two dates ───────
  let effectiveFrom = planCutoff; // always apply plan limit

  if (rangeFrom) {
    // use whichever is MORE recent (more restrictive)
    effectiveFrom = rangeFrom > planCutoff ? rangeFrom : planCutoff;
  }

  // ── Always include active orders regardless of date ──
  // So NEW/CONFIRMED/COOKING/READY always show up
  const activeStatuses = ["NEW", "CONFIRMED", "COOKING", "READY"];

  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      OR: [
        // active orders always included
        { status: { in: activeStatuses } },
        // history orders filtered by date
        {
          status: { notIn: activeStatuses },
          createdAt: { gte: effectiveFrom },
        },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return NextResponse.json({ orders });
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
