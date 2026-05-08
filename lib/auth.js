import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  pages: {
    signIn: "/restaurant-auth/signin",
    error: "/restaurant-auth/signin",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                slug: true,   // ✅ always fresh from DB at login
                plan: true,
                isActive: true,
              },
            },
          },
        });

        if (!user) throw new Error("No account found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        if (user.role !== "SUPER_ADMIN") {
          if (!user.restaurant) throw new Error("Restaurant not found");
          if (!user.restaurant.isActive) throw new Error("Restaurant inactive");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          restaurantId: user.restaurantId || null,
          restaurantName: user.restaurant?.name || "Admin",
          restaurantSlug: user.restaurant?.slug || null,  // ✅ set at login
          plan: ["trail", "starter", "pro", "enterprise"].includes(user.restaurant?.plan) ? user.restaurant.plan : "trial",
        };
      },
    }),
  ],
  

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
        token.restaurantSlug = user.restaurantSlug;
        token.plan = ["trial", "starter", "pro", "enterprise"].includes(user.plan) ? user.plan : "trial";
      }
      const validPlans = ["trial", "starter", "pro", "enterprise"];

      // ✅ Always refresh slug from DB on each JWT refresh
      // This means if slug changes, next page load gets the new one
      if (token.restaurantId) {
        try {
          const restaurant = await prisma.restaurant.findUnique({
            where: { id: token.restaurantId },
            select: { slug: true, name: true, plan: true },
          });
          if (restaurant) {
            token.restaurantSlug = restaurant.slug;
            token.restaurantName = restaurant.name;
            token.plan = restaurant.plan;
          }
        } catch (e) {
          // silently fail — use cached token values
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.restaurantId = token.restaurantId;
        session.user.restaurantName = token.restaurantName;
        session.user.restaurantSlug = token.restaurantSlug;
        session.user.plan = token.plan;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
