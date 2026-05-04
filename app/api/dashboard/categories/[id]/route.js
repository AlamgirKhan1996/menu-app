import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // First verify category belongs to this restaurant
    const category = await prisma.category.findFirst({
      where: { 
        id: params.id, 
        restaurantId: session.user.restaurantId 
      },
    });

    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete by id only
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE CAT ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}