import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const subscriptions = new Map();

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { subscription } = await request.json();
  subscriptions.set(session.user.restaurantId, subscription);
  return NextResponse.json({ success: true });
}

export async function GET() {
    return NextResponse.json({subscriptions: subscriptions.size});
    
}