import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { restaurantSlug, items, customerName, customerPhone, note } = body;

    if (!restaurantSlug || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: restaurantSlug },
    });

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Generate order number
    const count = await prisma.order.count({
      where: { restaurantId: restaurant.id },
    });
    const orderNumber = `#${String(count + 1).padStart(4, "0")}`;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order + items in transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "NEW",
        total,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        note: note || null,
        restaurantId: restaurant.id,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            menuItemId: item.id || null,
          })),
        },
      },
      include: { items: true },
    });

    // Upsert customer
    if (customerPhone) {
      await prisma.customer.upsert({
        where: {
          phone_restaurantId: {
            phone: customerPhone,
            restaurantId: restaurant.id,
          },
        },
        update: {
          orderCount: { increment: 1 },
          totalSpent: { increment: total },
          lastOrderAt: new Date(),
          name: customerName || undefined,
        },
        create: {
          phone: customerPhone,
          name: customerName || null,
          orderCount: 1,
          totalSpent: total,
          lastOrderAt: new Date(),
          restaurantId: restaurant.id,
        },
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}