import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const restaurantId = session.user.restaurantId;
  const now = new Date();

  // Time ranges
  const today = new Date(now); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

  // Fetch all orders last 30 days
  const orders = await prisma.order.findMany({
    where: {
      restaurantId,
      createdAt: { gte: monthAgo },
      status: { not: "CANCELLED" },
    },
    include: { items: true },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all customers
  const customers = await prisma.customer.findMany({
    where: { restaurantId },
    orderBy: { totalSpent: "desc" },
    take: 5,
  });

  const totalCustomers = await prisma.customer.count({ where: { restaurantId } });
  const repeatCustomers = await prisma.customer.count({
    where: { restaurantId, orderCount: { gte: 2 } },
  });

  // Revenue calculations
  const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
  const yesterdayOrders = orders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= yesterday && d < today;
  });
  const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
  const monthOrders = orders;

  const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const yesterdayRevenue = yesterdayOrders.reduce((s, o) => s + (o.total || 0), 0);
  const weekRevenue = weekOrders.reduce((s, o) => s + (o.total || 0), 0);
  const monthRevenue = monthOrders.reduce((s, o) => s + (o.total || 0), 0);

  // Revenue trend — last 7 days
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today); dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1);
    const dayOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= dayStart && d < dayEnd;
    });
    const revenue = dayOrders.reduce((s, o) => s + (o.total || 0), 0);
    trend.push({
      day: dayStart.toLocaleDateString("en-GB", { weekday: "short" }),
      date: dayStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue: Math.round(revenue),
      orders: dayOrders.length,
    });
  }

  // Top menu items
  const itemCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Busiest hours (last 30 days)
  const hourCounts = Array(24).fill(0);
  orders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    hourCounts[hour]++;
  });

  // Order status breakdown (last 30 days)
  const allOrders = await prisma.order.findMany({
    where: { restaurantId, createdAt: { gte: monthAgo } },
    select: { status: true },
  });
  const statusBreakdown = allOrders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    revenue: {
      today: Math.round(todayRevenue),
      yesterday: Math.round(yesterdayRevenue),
      week: Math.round(weekRevenue),
      month: Math.round(monthRevenue),
      growth: yesterdayRevenue > 0
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
        : 0,
    },
    orders: {
      today: todayOrders.length,
      week: weekOrders.length,
      month: monthOrders.length,
      avgValue: monthOrders.length > 0
        ? Math.round(monthRevenue / monthOrders.length)
        : 0,
    },
    customers: {
      total: totalCustomers,
      repeat: repeatCustomers,
      repeatRate: totalCustomers > 0
        ? Math.round((repeatCustomers / totalCustomers) * 100)
        : 0,
      top: customers,
    },
    trend,
    topItems,
    hourCounts,
    statusBreakdown,
  });
}