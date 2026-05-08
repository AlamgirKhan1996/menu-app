import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // SUPER_ADMIN or any account without a restaurant: treat as paid (no banner)
    if (!session.user?.restaurantId) {
      return NextResponse.json({ status: "PAID", daysLeft: null });
    }

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

    if (!restaurant) {
      return NextResponse.json({ status: "PAID", daysLeft: null });
    }

    const now = new Date();

    if (restaurant.isPaid && restaurant.paidUntil && restaurant.paidUntil > now) {
      return NextResponse.json({ status: "PAID", daysLeft: null });
    }

    if (restaurant.trialEndsAt && restaurant.trialEndsAt > now) {
      const daysLeft = Math.ceil(
        (restaurant.trialEndsAt - now) / (1000 * 60 * 60 * 24)
      );
      return NextResponse.json({ status: "TRIAL", daysLeft });
    }

    return NextResponse.json({ status: "EXPIRED", daysLeft: 0 });
  } catch (err) {
    console.error("[/api/dashboard/trial] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", status: "PAID", daysLeft: null },
      { status: 500 }
    );
  }
}
