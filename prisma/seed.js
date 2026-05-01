const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding demo restaurant...");

  // Clean existing demo
  const existing = await prisma.restaurant.findUnique({
    where: { slug: "demo-restaurant" },
  });
  if (existing) {
    await prisma.restaurant.delete({ where: { slug: "demo-restaurant" } });
  }

  const hashedPassword = await bcrypt.hash("demo123456", 12);

  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Al Baik Express",
      nameAr: "البيك إكسبريس",
      slug: "al-baik-express",
      whatsapp: "966500000000",
      accentColor: "#D4A853",
      tagline: "Riyadh's finest grills & shawarma since 1974",
      taglineAr: "أفضل مشاوي وشاورما في الرياض منذ ١٩٧٤",
      city: "Riyadh",
      isOpen: true,
      plan: "PRO",
      users: {
        create: {
          email: "demo@orderflow.sa",
          password: hashedPassword,
          role: "OWNER",
        },
      },
      settings: {
        create: {
          openTime: "10:00",
          closeTime: "02:00",
          greetingMessage: "مرحباً! شكراً لطلبك من البيك إكسبريس 🍗",
          awayMessage: "نحن مغلقون حالياً. أوقات العمل: ١٠ صباحاً - ٢ فجراً",
        },
      },
      categories: {
        create: [
          {
            name: "Shawarma",
            nameAr: "شاورما",
            order: 0,
            menuItems: {
              create: [
                {
                  name: "Chicken Shawarma",
                  nameAr: "شاورما دجاج",
                  description: "Tender marinated chicken slow-roasted on a vertical spit, wrapped in warm Arabic bread with garlic sauce and pickles.",
                  descriptionAr: "دجاج طري متبل مشوي على نار هادئة، ملفوف في خبز عربي دافئ مع صوص الثوم والمخللات.",
                  price: 18,
                  isFeatured: true,
                  order: 0,
                  isAvailable: true,
                },
                {
                  name: "Meat Shawarma",
                  nameAr: "شاورما لحم",
                  description: "Juicy beef and lamb blend, marinated in Arabic spices, served with tahini sauce and fresh vegetables.",
                  descriptionAr: "خليط من اللحم البقري والضاني المتبل بالبهارات العربية، يقدم مع صوص الطحينة.",
                  price: 22,
                  isFeatured: false,
                  order: 1,
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Grills",
            nameAr: "مشاوي",
            order: 1,
            menuItems: {
              create: [
                {
                  name: "Mixed Grill Platter",
                  nameAr: "مشاوي مشكلة",
                  description: "A royal feast of chicken, kofta, and lamb chops grilled over charcoal, served with rice and salad.",
                  descriptionAr: "وليمة ملكية من الدجاج والكفتة وضلوع الخروف المشوية على الفحم، تقدم مع الأرز.",
                  price: 89,
                  isFeatured: true,
                  order: 0,
                  isAvailable: true,
                },
                {
                  name: "Grilled Chicken",
                  nameAr: "دجاج مشوي",
                  description: "Whole chicken marinated in a secret blend of herbs and spices, perfectly grilled to golden perfection.",
                  descriptionAr: "دجاجة كاملة متبلة بخلطة سرية من الأعشاب والتوابل، مشوية حتى الذهبية.",
                  price: 45,
                  isFeatured: false,
                  order: 1,
                  isAvailable: true,
                },
              ],
            },
          },
          {
            name: "Sides & Drinks",
            nameAr: "المقبلات والمشروبات",
            order: 2,
            menuItems: {
              create: [
                {
                  name: "Hummus with Bread",
                  nameAr: "حمص مع خبز",
                  description: "Creamy Lebanese-style hummus drizzled with olive oil and paprika, served with fresh pita bread.",
                  descriptionAr: "حمص كريمي على الطريقة اللبنانية مرشوش بزيت الزيتون والفلفل الأحمر مع خبز البيتا.",
                  price: 15,
                  isFeatured: false,
                  order: 0,
                  isAvailable: true,
                },
                {
                  name: "Fresh Lemon Mint",
                  nameAr: "ليمون بالنعناع",
                  description: "Refreshing blend of fresh lemons, mint, and ice — the perfect companion for any meal.",
                  descriptionAr: "خلطة منعشة من الليمون الطازج والنعناع والثلج — الرفيق المثالي لأي وجبة.",
                  price: 12,
                  isFeatured: false,
                  order: 1,
                  isAvailable: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Demo restaurant created!`);
  console.log(`🔗 Menu URL: /al-baik-express`);
  console.log(`📧 Login: demo@orderflow.sa`);
  console.log(`🔑 Password: demo123456`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());