import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { restaurantId: session.user.restaurantId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({
      where: { restaurantId: session.user.restaurantId },
    }),
  ]);

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) });
}