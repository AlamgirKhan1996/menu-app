const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo restaurant...");

  // Clean existing
  const existing = await prisma.restaurant.findUnique({
    where: { slug: "al-baik-express" },
  });
  if (existing) {
    await prisma.restaurant.delete({ where: { slug: "al-baik-express" } });
  }

  const hashedPassword = await bcrypt.hash("demo123456", 12);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Al Baik Express",
      nameAr: "البيك إكسبريس",
      slug: "al-baik-express",
      whatsapp: "966500000000",
      accentColor: "#D4A853",
      tagline: "Riyadh's finest grills & shawarma",
      taglineAr: "أفضل مشاوي وشاورما في الرياض",
      isOpen: true,
      isPaid: true,
      paidUntil: new Date("2030-01-01"),
      trialEndsAt: new Date("2030-01-01"),
      users: {
        create: {
          email: "demo@orderflow.sa",
          password: hashedPassword,
          role: "OWNER",
        },
      },
    },
  });

  // Create settings separately
  await prisma.settings.create({
    data: {
      restaurantId: restaurant.id,
      openTime: "10:00",
      closeTime: "02:00",
      greetingMessage: "مرحباً! شكراً لطلبك من البيك إكسبريس 🍗",
      awayMessage: "نحن مغلقون حالياً",
    },
  });

  // Create categories separately
  const cat1 = await prisma.category.create({
    data: { name: "Shawarma", nameAr: "شاورما", order: 0, restaurantId: restaurant.id },
  });
  const cat2 = await prisma.category.create({
    data: { name: "Grills", nameAr: "مشاوي", order: 1, restaurantId: restaurant.id },
  });
  const cat3 = await prisma.category.create({
    data: { name: "Sides & Drinks", nameAr: "المقبلات والمشروبات", order: 2, restaurantId: restaurant.id },
  });

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      { name: "Chicken Shawarma", nameAr: "شاورما دجاج", description: "Tender marinated chicken slow-roasted on a vertical spit.", descriptionAr: "دجاج طري متبل مشوي على نار هادئة.", price: 18, isFeatured: true, order: 0, isAvailable: true, categoryId: cat1.id, restaurantId: restaurant.id },
      { name: "Meat Shawarma", nameAr: "شاورما لحم", description: "Juicy beef and lamb blend in Arabic spices.", descriptionAr: "خليط من اللحم البقري والضاني بالبهارات العربية.", price: 22, isFeatured: false, order: 1, isAvailable: true, categoryId: cat1.id, restaurantId: restaurant.id },
      { name: "Mixed Grill Platter", nameAr: "مشاوي مشكلة", description: "Chicken, kofta, and lamb chops grilled over charcoal.", descriptionAr: "دجاج وكفتة وضلوع خروف مشوية على الفحم.", price: 89, isFeatured: true, order: 0, isAvailable: true, categoryId: cat2.id, restaurantId: restaurant.id },
      { name: "Grilled Chicken", nameAr: "دجاج مشوي", description: "Whole chicken marinated in herbs and spices.", descriptionAr: "دجاجة كاملة متبلة بالأعشاب والتوابل.", price: 45, isFeatured: false, order: 1, isAvailable: true, categoryId: cat2.id, restaurantId: restaurant.id },
      { name: "Hummus with Bread", nameAr: "حمص مع خبز", description: "Creamy hummus with olive oil and pita bread.", descriptionAr: "حمص كريمي مع زيت الزيتون وخبز البيتا.", price: 15, isFeatured: false, order: 0, isAvailable: true, categoryId: cat3.id, restaurantId: restaurant.id },
      { name: "Fresh Lemon Mint", nameAr: "ليمون بالنعناع", description: "Fresh lemons, mint, and ice.", descriptionAr: "ليمون طازج ونعناع وثلج.", price: 12, isFeatured: false, order: 1, isAvailable: true, categoryId: cat3.id, restaurantId: restaurant.id },
    ],
  });

  console.log("✅ Demo restaurant created!");
  console.log("🔗 Menu URL: /al-baik-express");
  console.log("📧 Login: demo@orderflow.sa");
  console.log("🔑 Password: demo123456");
}

main().catch(console.error).finally(() => prisma.$disconnect());