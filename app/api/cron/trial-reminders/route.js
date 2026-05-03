import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This runs daily via Vercel Cron
export async function GET(request) {
  // Security check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in4Days = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  // Restaurants with 4 days left
  const urgentReminders = await prisma.restaurant.findMany({
    where: {
      isPaid: false,
      isActive: true,
      trialEndsAt: {
        gte: now,
        lte: in4Days,
      },
    },
    include: { users: { select: { email: true } } },
  });

  // Log for now — later send actual WhatsApp via WhatsApp Business API
  console.log(`📱 ${urgentReminders.length} restaurants need reminders`);

  urgentReminders.forEach(r => {
    const daysLeft = Math.ceil((new Date(r.trialEndsAt) - now) / (1000 * 60 * 60 * 24));
    console.log(` → ${r.name} (${r.whatsapp}): ${daysLeft} days left`);
    // TODO Phase 2: Send WhatsApp message via WhatsApp Business API
  });

  return NextResponse.json({
    success: true,
    reminders: urgentReminders.length,
  });
}