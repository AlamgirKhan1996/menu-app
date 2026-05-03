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
                slug: true,
                plan: true,
                isActive: true,
              },
            },
          },
        });

        if (!user) throw new Error("No account found");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Incorrect password");

        // Allow SUPER_ADMIN even without restaurant
        if (user.role !== "SUPER_ADMIN") {
          if (!user.restaurant) throw new Error("Restaurant not found");
          if (!user.restaurant.isActive) throw new Error("Restaurant inactive");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,                                    // ← SUPER_ADMIN comes from here
          restaurantId: user.restaurantId || null,
          restaurantName: user.restaurant?.name || "Admin",
          restaurantSlug: user.restaurant?.slug || null,
          plan: user.restaurant?.plan || "FREE",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
        token.restaurantSlug = user.restaurantSlug;
        token.plan = user.plan;
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