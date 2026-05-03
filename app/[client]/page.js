import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RestaurantPage from "@/sections/RestaurantPage";

export default async function ClientPage({ params }) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: params.client },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      menuItems: {
        where: { isAvailable: true },
        orderBy: { order: "asc" },
        include: { category: true },
      },
      settings: true,
    },
  });

  if (!restaurant) notFound();

  const client = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name || "",
    nameAr: restaurant.nameAr || "",
    tagline: restaurant.tagline || "Order your favorite food instantly",
    taglineAr: restaurant.taglineAr || "",
    description: restaurant.name || "",
    phone: restaurant.whatsapp || "",
    emoji: "🍽️",
    logo: restaurant.logo || null,
    coverImage: restaurant.coverImage || null,
    coverGradient: "linear-gradient(135deg, #0a0a1a, #1a0a2e)",
    accentColor: restaurant.accentColor || "#25D366",
    isOpen: restaurant.isOpen ?? true,
    hours: restaurant.settings?.openTime
      ? `${restaurant.settings.openTime} – ${restaurant.settings.closeTime}`
      : "Open Now",
    rating: "5.0",
    deliveryTime: "20–35 min",
    categories: ["All", ...(restaurant.categories || [])
      .filter(c => c && c.name)
      .map((c) => c.name)],
    menu: (restaurant.menuItems || []).map((item) => ({
      id: item.id,
      name: item.name || "",
      nameAr: item.nameAr || "",
      desc: item.description || "",
      price: item.price || 0,
      category: item.category?.name || "Other",
      emoji: item.image || "🍔",
      image: item.images?.[0] || item.image || null,  // ← single main image
      images: item.images || [],                        // ← full array
      popular: item.isFeatured || false,
      spicy: false,
      new: false,
    })),
  };

  return <RestaurantPage client={client} />;
}