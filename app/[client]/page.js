import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RestaurantPage from "@/sections/RestaurantPage";

export default async function ClientPage({ params }) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.client },
    include: {
      categories: { orderBy: { order: "asc" } },
      menuItems: { orderBy: { order: "asc" } },
      settings: true,
    },
  });

  if (!restaurant) notFound();

  return <RestaurantPage client={restaurant} />;
}