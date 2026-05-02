import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: session.user.restaurantId },
    select: {
      isPaid: true,
      paidUntil: true,
      trialEndsAt: true,
      isActive: true,
      plan: true,
    },
  });

  const now = new Date();

  // Paid and active
  if (restaurant?.isPaid && restaurant.paidUntil > now) {
    return NextResponse.json({ status: "PAID", daysLeft: null });
  }

  // On trial
  if (restaurant?.trialEndsAt && restaurant.trialEndsAt > now) {
    const daysLeft = Math.ceil((restaurant.trialEndsAt - now) / (1000 * 60 * 60 * 24));
    return NextResponse.json({ status: "TRIAL", daysLeft });
  }

  // Trial expired
  return NextResponse.json({ status: "EXPIRED", daysLeft: 0 });
}