/**
 * data/clients.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-tenant data store.
 * Each key is the URL slug: /smash-kitchen, /pizza-palace, etc.
 *
 * To add a new client:
 *  1. Copy one of the existing objects below.
 *  2. Change the key (slug) and fill in the restaurant details.
 *  3. Deploy — the new route is immediately live.
 *
 * Schema per client:
 *  id           string   — must match the object key (slug)
 *  name         string   — restaurant display name
 *  tagline      string   — shown under the name in the hero
 *  description  string   — short about blurb
 *  phone        string   — WhatsApp number (no + or spaces)
 *  emoji        string   — used as logo fallback
 *  coverGradient string  — CSS gradient for the hero background
 *  accentColor  string   — primary brand color (buttons, highlights)
 *  categories   string[] — filter categories; first item is always shown selected
 *  hours        string   — operating hours displayed in hero
 *  rating       string   — shown in hero trust badge
 *  deliveryTime string   — estimated delivery shown in hero
 *  menu         MenuItem[]
 *
 * MenuItem schema:
 *  id       number
 *  name     string
 *  desc     string
 *  price    number   (SAR)
 *  category string   — must match one of the categories array
 *  emoji    string   — displayed as the food visual
 *  popular  boolean  — shows a "Popular" badge
 *  spicy    boolean  — shows a 🌶️ badge
 *  new      boolean  — shows a "New" badge
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const clients = {

  /* ── 1. Smash Kitchen ──────────────────────────────────────────────────── */
  "smash-kitchen": {
    id: "smash-kitchen",
    name: "Smash Kitchen",
    tagline: "Order your favorite food instantly",
    description: "Riyadh's finest smash burgers, crafted fresh every single order.",
    phone: "966501111111",
    emoji: "🍔",
    coverGradient: "linear-gradient(135deg, #1a0a00 0%, #3d1500 50%, #1a0a00 100%)",
    accentColor: "#FF6B35",
    hours: "12:00 PM – 2:00 AM",
    rating: "4.9",
    deliveryTime: "25–35 min",
    categories: ["All", "Burgers", "Sides", "Drinks", "Desserts"],
    menu: [
      {
        id: 1, name: "Classic Smash Burger", category: "Burgers", price: 35,
        emoji: "🍔", popular: true, spicy: false, new: false,
        desc: "Double smashed beef patty, American cheese, special sauce, crispy pickles, brioche bun",
      },
      {
        id: 2, name: "Spicy Inferno Burger", category: "Burgers", price: 40,
        emoji: "🌶️", popular: false, spicy: true, new: false,
        desc: "Smashed patty, ghost pepper mayo, jalapeños, crispy onions, pepper jack cheese",
      },
      {
        id: 3, name: "Truffle Mushroom Burger", category: "Burgers", price: 45,
        emoji: "🍄", popular: false, spicy: false, new: true,
        desc: "Double patty, truffle aioli, sautéed mushrooms, gruyère cheese, arugula",
      },
      {
        id: 4, name: "Crispy Chicken Burger", category: "Burgers", price: 38,
        emoji: "🐔", popular: true, spicy: false, new: false,
        desc: "Southern-fried chicken thigh, coleslaw, pickles, honey mustard, brioche bun",
      },
      {
        id: 5, name: "Smash Fries", category: "Sides", price: 18,
        emoji: "🍟", popular: true, spicy: false, new: false,
        desc: "Crispy golden fries tossed in our signature smash seasoning blend",
      },
      {
        id: 6, name: "Loaded Cheese Fries", category: "Sides", price: 25,
        emoji: "🧀", popular: false, spicy: false, new: false,
        desc: "Fries loaded with nacho cheese sauce, jalapeños, sour cream, crispy bacon bits",
      },
      {
        id: 7, name: "Onion Rings", category: "Sides", price: 20,
        emoji: "🧅", popular: false, spicy: false, new: false,
        desc: "Beer-battered thick-cut onion rings, served with chipotle dip",
      },
      {
        id: 8, name: "Classic Milkshake", category: "Drinks", price: 22,
        emoji: "🥤", popular: false, spicy: false, new: false,
        desc: "Thick and creamy — Vanilla, Chocolate, or Strawberry. Your pick.",
      },
      {
        id: 9, name: "Fresh Lemonade", category: "Drinks", price: 15,
        emoji: "🍋", popular: false, spicy: false, new: false,
        desc: "Freshly squeezed lemonade with mint. Still or sparkling.",
      },
      {
        id: 10, name: "Nutella Brownie", category: "Desserts", price: 20,
        emoji: "🍫", popular: false, spicy: false, new: true,
        desc: "Warm gooey brownie with Nutella swirl, served with vanilla ice cream",
      },
    ],
  },

  /* ── 2. Pizza Palace ───────────────────────────────────────────────────── */
  "pizza-palace": {
    id: "pizza-palace",
    name: "Pizza Palace",
    tagline: "Authentic Italian flavors, delivered hot",
    description: "Wood-fired Neapolitan pizza made with imported Italian ingredients.",
    phone: "966502222222",
    emoji: "🍕",
    coverGradient: "linear-gradient(135deg, #0d0500 0%, #2d1000 50%, #0d0500 100%)",
    accentColor: "#E63946",
    hours: "11:00 AM – 1:00 AM",
    rating: "4.8",
    deliveryTime: "30–45 min",
    categories: ["All", "Pizzas", "Pasta", "Salads", "Drinks", "Desserts"],
    menu: [
      {
        id: 1, name: "Pepperoni Inferno", category: "Pizzas", price: 62,
        emoji: "🍕", popular: true, spicy: false, new: false,
        desc: "Classic tomato base, triple pepperoni, mozzarella, fresh basil, olive oil drizzle",
      },
      {
        id: 2, name: "Quattro Formaggi", category: "Pizzas", price: 68,
        emoji: "🧀", popular: false, spicy: false, new: false,
        desc: "Four cheese blend — mozzarella, gorgonzola, parmesan, ricotta, honey drizzle",
      },
      {
        id: 3, name: "Truffle Margherita", category: "Pizzas", price: 75,
        emoji: "🌿", popular: false, spicy: false, new: true,
        desc: "San Marzano tomatoes, buffalo mozzarella, fresh basil, black truffle oil",
      },
      {
        id: 4, name: "Spicy Arrabbiata", category: "Pizzas", price: 65,
        emoji: "🌶️", popular: false, spicy: true, new: false,
        desc: "Spicy arrabbiata sauce, Italian sausage, roasted peppers, chilli flakes",
      },
      {
        id: 5, name: "Spaghetti Carbonara", category: "Pasta", price: 52,
        emoji: "🍝", popular: true, spicy: false, new: false,
        desc: "Authentic Roman carbonara — guanciale, egg yolk, pecorino, black pepper. No cream.",
      },
      {
        id: 6, name: "Penne Arrabbiata", category: "Pasta", price: 45,
        emoji: "🍜", popular: false, spicy: true, new: false,
        desc: "Penne pasta in spicy tomato-garlic sauce, fresh parsley, parmesan",
      },
      {
        id: 7, name: "Caesar Salad", category: "Salads", price: 38,
        emoji: "🥗", popular: false, spicy: false, new: false,
        desc: "Crisp romaine, house Caesar dressing, croutons, shaved parmesan, anchovy (optional)",
      },
      {
        id: 8, name: "San Pellegrino", category: "Drinks", price: 12,
        emoji: "💧", popular: false, spicy: false, new: false,
        desc: "Sparkling Italian mineral water. 750ml.",
      },
      {
        id: 9, name: "Fresh Tiramisu", category: "Desserts", price: 32,
        emoji: "☕", popular: true, spicy: false, new: false,
        desc: "Classic Tiramisu — ladyfingers, mascarpone, espresso, cocoa. Made in-house daily.",
      },
    ],
  },

  /* ── 3. Sushi Sora ─────────────────────────────────────────────────────── */
  "sushi-sora": {
    id: "sushi-sora",
    name: "Sushi Sora",
    tagline: "Japanese craftsmanship, delivered to you",
    description: "Premium Omakase-inspired rolls crafted by Japanese-trained chefs.",
    phone: "966503333333",
    emoji: "🍣",
    coverGradient: "linear-gradient(135deg, #000a0d 0%, #001a24 50%, #000a0d 100%)",
    accentColor: "#06B6D4",
    hours: "12:00 PM – 11:00 PM",
    rating: "5.0",
    deliveryTime: "35–50 min",
    categories: ["All", "Rolls", "Nigiri", "Bowls", "Soups", "Drinks"],
    menu: [
      {
        id: 1, name: "Dragon Roll", category: "Rolls", price: 85,
        emoji: "🐉", popular: true, spicy: false, new: false,
        desc: "Shrimp tempura inside, avocado on top, eel sauce, sesame seeds",
      },
      {
        id: 2, name: "Spicy Tuna Crunch", category: "Rolls", price: 78,
        emoji: "🌊", popular: false, spicy: true, new: false,
        desc: "Spicy tuna, cucumber, crispy tempura flakes, sriracha drizzle",
      },
      {
        id: 3, name: "Salmon Lover Roll", category: "Rolls", price: 92,
        emoji: "🍣", popular: true, spicy: false, new: false,
        desc: "Cream cheese, cucumber inside; torched salmon on top, ponzu sauce",
      },
      {
        id: 4, name: "Rainbow Roll", category: "Rolls", price: 98,
        emoji: "🌈", popular: false, spicy: false, new: true,
        desc: "Crab, avocado inside; topped with rotating assorted sashimi",
      },
      {
        id: 5, name: "Salmon Nigiri (×2)", category: "Nigiri", price: 45,
        emoji: "🐟", popular: false, spicy: false, new: false,
        desc: "Hand-pressed sushi rice topped with premium Atlantic salmon",
      },
      {
        id: 6, name: "Tuna Nigiri (×2)", category: "Nigiri", price: 52,
        emoji: "🎣", popular: false, spicy: false, new: false,
        desc: "Hand-pressed rice with premium bluefin tuna, micro shiso",
      },
      {
        id: 7, name: "Salmon Poke Bowl", category: "Bowls", price: 68,
        emoji: "🍱", popular: true, spicy: false, new: false,
        desc: "Sushi rice, salmon, edamame, mango, cucumber, sesame, ponzu",
      },
      {
        id: 8, name: "Miso Soup", category: "Soups", price: 18,
        emoji: "🫖", popular: false, spicy: false, new: false,
        desc: "Traditional white miso, tofu, wakame seaweed, green onion",
      },
      {
        id: 9, name: "Yuzu Lemonade", category: "Drinks", price: 22,
        emoji: "🍊", popular: false, spicy: false, new: true,
        desc: "Fresh yuzu juice, sparkling water, honey syrup, salted rim",
      },
      {
        id: 10, name: "Matcha Latte", category: "Drinks", price: 20,
        emoji: "🍵", popular: false, spicy: false, new: false,
        desc: "Ceremonial grade matcha, oat milk, light honey. Hot or iced.",
      },
    ],
  },

  /* ── 4. Al-Rashid Kitchen ──────────────────────────────────────────────── */
  "al-rashid": {
    id: "al-rashid",
    name: "Al-Rashid Kitchen",
    tagline: "Traditional Saudi flavors, crafted with love",
    description: "Authentic home-style Saudi cuisine passed down through three generations.",
    phone: "966504444444",
    emoji: "🥘",
    coverGradient: "linear-gradient(135deg, #0a0600 0%, #241200 50%, #0a0600 100%)",
    accentColor: "#D4A853",
    hours: "11:00 AM – 12:00 AM",
    rating: "4.9",
    deliveryTime: "40–55 min",
    categories: ["All", "Mains", "Grills", "Sides", "Drinks", "Sweets"],
    menu: [
      {
        id: 1, name: "Kabsa Djaj", category: "Mains", price: 55,
        emoji: "🍗", popular: true, spicy: false, new: false,
        desc: "Slow-cooked whole chicken over fragrant basmati kabsa rice with raisins and almonds",
      },
      {
        id: 2, name: "Mandi Lahm", category: "Mains", price: 75,
        emoji: "🐑", popular: true, spicy: false, new: false,
        desc: "Tandoor-smoked lamb shank over aromatic mandi rice, served with soup and salad",
      },
      {
        id: 3, name: "Mixed Grill Platter", category: "Grills", price: 120,
        emoji: "🔥", popular: false, spicy: false, new: false,
        desc: "Kofta, chicken tikka, shish tawook, grilled tomatoes, onions, mixed salad for 2–3",
      },
      {
        id: 4, name: "Shish Tawook", category: "Grills", price: 48,
        emoji: "🍢", popular: false, spicy: false, new: false,
        desc: "Marinated chicken skewers grilled over charcoal, garlic paste, pita bread",
      },
      {
        id: 5, name: "Hummus & Bread", category: "Sides", price: 18,
        emoji: "🫓", popular: false, spicy: false, new: false,
        desc: "Creamy house hummus, olive oil, paprika, served with fresh Arabic bread",
      },
      {
        id: 6, name: "Fattoush Salad", category: "Sides", price: 22,
        emoji: "🥗", popular: false, spicy: false, new: false,
        desc: "Fresh vegetables, crispy bread, sumac dressing, pomegranate seeds",
      },
      {
        id: 7, name: "Fresh Mint Lemonade", category: "Drinks", price: 14,
        emoji: "🍋", popular: true, spicy: false, new: false,
        desc: "Hand-squeezed lemonade with fresh mint, served chilled",
      },
      {
        id: 8, name: "Luqaimat", category: "Sweets", price: 20,
        emoji: "🍯", popular: true, spicy: false, new: false,
        desc: "Crispy golden dumplings drizzled with date honey and sesame seeds",
      },
    ],
  },

};

/**
 * getClient(slug) — retrieve a client by URL slug.
 * Returns null if not found (triggers 404).
 */
export function getClient(slug) {
  return clients[slug] ?? null;
}

/**
 * getAllClientSlugs() — returns all slugs for static generation.
 */
export function getAllClientSlugs() {
  return Object.keys(clients);
}
