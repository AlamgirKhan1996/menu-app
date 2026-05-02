import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Only YOU can call this
async function checkSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await checkSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const restaurants = await prisma.restaurant.findMany({
    include: {
      users: { select: { email: true, role: true } },
      _count: { select: { orders: true, menuItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(restaurants);
}

export async function PATCH(request) {
  const session = await checkSuperAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, isActive, markPaid, months } = await request.json();

  if (markPaid && months) {
    const paidUntil = new Date();
    paidUntil.setMonth(paidUntil.getMonth() + months);

    await prisma.restaurant.update({
      where: { id },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paidUntil,
        isActive: true,
        activatedBy: session.user.id,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (isActive !== undefined) {
    await prisma.restaurant.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}