# 🍽️ Menu App — Multi-Tenant WhatsApp Ordering System

A premium, mobile-first restaurant ordering page that lets customers browse
the menu and send a pre-formatted order directly via WhatsApp. One codebase,
unlimited restaurant clients.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

The root URL redirects to `/smash-kitchen` (the demo restaurant).
Visit any client slug directly:

| URL | Restaurant |
|---|---|
| `/smash-kitchen` | Smash Kitchen 🍔 |
| `/pizza-palace` | Pizza Palace 🍕 |
| `/sushi-sora` | Sushi Sora 🍣 |
| `/al-rashid` | Al-Rashid Kitchen 🥘 |

---

## 📁 Project Structure

```
menu-app/
├── app/
│   ├── globals.css          ← Design system: tokens, animations, utilities
│   ├── layout.js            ← Root layout
│   ├── page.js              ← Redirects / → /smash-kitchen
│   ├── not-found.js         ← 404 page
│   └── [client]/
│       └── page.js          ← Dynamic route: /smash-kitchen, /pizza-palace …
│
├── components/
│   ├── Navbar.js            ← Sticky top bar with cart button
│   ├── CategoryFilter.js    ← Horizontal scrollable category pills
│   ├── MenuCard.js          ← Product card with qty controls + animations
│   ├── CartDrawer.js        ← Slide-in cart with WhatsApp CTA
│   └── StickyOrderBar.js    ← Floating bottom bar when cart has items
│
├── sections/
│   ├── HeroSection.js       ← Restaurant hero (name, tagline, badges)
│   ├── MenuSection.js       ← Menu grid with search + category filter
│   └── RestaurantPage.js    ← Client component: orchestrates all state
│
├── data/
│   └── clients.js           ← ⭐ All restaurant data lives here
│
├── utils/
│   ├── whatsapp.js          ← Message formatter + wa.me link builder
│   └── cart.js              ← Pure cart state helpers
│
├── .env.local               ← Environment variables
└── next.config.js
```

---

## ➕ Adding a New Restaurant Client

Open `data/clients.js` and add a new entry:

```js
"my-restaurant": {
  id:           "my-restaurant",           // must match the key
  name:         "My Restaurant",
  tagline:      "Order your favorite food instantly",
  description:  "Best food in town.",
  phone:        "966501234567",            // WhatsApp number, no + or spaces
  emoji:        "🍜",
  coverGradient: "linear-gradient(135deg, #0a0a1a, #1a0a2e)",
  accentColor:  "#7C3AED",               // brand color for buttons
  hours:        "11:00 AM – 11:00 PM",
  rating:       "4.8",
  deliveryTime: "30–45 min",
  categories:   ["All", "Mains", "Sides", "Drinks"],
  menu: [
    {
      id: 1, name: "House Special", category: "Mains", price: 55,
      emoji: "🍜", popular: true, spicy: false, new: false,
      desc: "Our signature dish — slow cooked for 6 hours.",
    },
    // ... more items
  ],
},
```

That's it. Visit `/my-restaurant` and it's live. No other files to touch.

---

## 📱 How the WhatsApp Order Works

1. Customer adds items to cart
2. Clicks **"Send Order via WhatsApp"** in the cart drawer
3. WhatsApp opens on their phone with a pre-formatted message:

```
Hi! I'd like to place an order from Smash Kitchen 🍔

🛒 My Order:
• Classic Smash Burger × 2 — SAR 70
• Loaded Cheese Fries × 1 — SAR 25

💰 Total: SAR 95

Please confirm my order. Thank you! 🙏
```

4. Customer taps **Send** — the restaurant receives it instantly.

---

## 🎨 Design Customisation Per Client

Each client has:
- `accentColor` — controls all buttons, active states, highlights
- `coverGradient` — hero background
- `emoji` — logo fallback

The accent color is injected as a CSS custom property at runtime,
so every UI element adapts automatically to the client's brand.

---

## 🌐 Deploying to Vercel

```bash
npx vercel
```

Each restaurant gets its own URL path automatically:
- `yourapp.vercel.app/smash-kitchen`
- `yourapp.vercel.app/pizza-palace`

Or use a **custom domain per client**: configure rewrites in `next.config.js`.

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_DEFAULT_WA_NUMBER` | Fallback WA number | `966500000000` |
| `NEXT_PUBLIC_BASE_URL` | App base URL for metadata | `http://localhost:3000` |
| `NEXT_PUBLIC_SHOW_IMAGES` | Enable real images (future) | `false` |

---

## 📦 Build for Production

```bash
npm run build
npm start
```

---

## 🔗 Part of the OrderFlow System

This is **Part 2** of the OrderFlow SaaS:

| Part | What it is |
|---|---|
| `orderflow/` | The marketing/sales landing page |
| `menu-app/` | ← You are here — the customer ordering experience |

---

MIT License — free to use, sell, and modify.
