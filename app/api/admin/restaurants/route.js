import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

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

  const body = await request.json();
  const { id, isActive, markPaid, months, plan, extendTrial } = body;

  // ── 1. Change Plan directly ─────────────────────────────
  if (plan) {
    const validPlans = ["trial", "starter", "pro", "enterprise"];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    await prisma.restaurant.update({
      where: { id },
      data: {
        plan,
        isPaid: plan !== "trial",
        ...(plan !== "trial" && { paidAt: new Date(), activatedBy: session.user.id }),
      },
    });
    return NextResponse.json({ success: true, plan });
  }

  // ── 2. Mark Paid + set expiry ───────────────────────────
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

  // ── 3. Extend Trial ─────────────────────────────────────
  if (extendTrial) {
    const days = parseInt(extendTrial);
    const newTrialEnd = new Date();
    newTrialEnd.setDate(newTrialEnd.getDate() + days);

    await prisma.restaurant.update({
      where: { id },
      data: {
        trialEndsAt: newTrialEnd,
        isTrialExpired: false,
      },
    });
    return NextResponse.json({ success: true });
  }

  // ── 4. Toggle Active ────────────────────────────────────
  if (isActive !== undefined) {
    await prisma.restaurant.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
}