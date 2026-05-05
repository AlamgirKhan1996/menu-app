import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import RestaurantPage from "@/sections/RestaurantPage";

export default async function ClientPage({ params }) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: params.client },
      include: {
        categories: true,
        menuItems: {
          where: { isArchived: true },
          include: { category: true },
          orderBy: { order: "asc" },
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
      tagline: restaurant.tagline || "Order via WhatsApp",
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
      categories: ["All", ...(restaurant.categories || [])
        .filter(c => c && c.name)
        .map(c => c.name)],
      menu: (restaurant.menuItems || []).map((item) => ({
        id: item.id,
        name: item.name || "",
        nameAr: item.nameAr || "",
        desc: item.description || "",
        price: item.price || 0,
        category: item.category?.name || "Other",
        emoji: item.image || "🍔",
        image: item.images?.[0] || item.image || null,
        images: item.images || [],
        popular: item.isFeatured || false,
        spicy: false,
        new: false,
      })),
    };

    return <RestaurantPage client={client} />;

  } catch (error) {
  console.error("❌ Client page error:", error);
  return (
    <div style={{
      minHeight: "100vh",
      background: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      textAlign: "center",
      fontFamily: "-apple-system, sans-serif",
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🍽️</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 8 }}>
        Restaurant not found
      </h1>
      <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 300, lineHeight: 1.6 }}>
        This menu link doesn't exist yet. Please check the URL or contact the restaurant.
      </p>
    </div>
  );
}
}