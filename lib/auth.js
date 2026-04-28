// lib/auth.js
// NextAuth configuration for restaurant owner login

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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
          throw new Error("Email and password are required");
        }

        // Find user by email
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

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated");
        }

        if (!user.restaurant?.isActive) {
          throw new Error("This restaurant account is inactive");
        }

        // Check password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Return user data that will be encoded in JWT
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
          restaurantName: user.restaurant.name,
          restaurantSlug: user.restaurant.slug,
          plan: user.restaurant.plan,
        };
      },
    }),
  ],

  callbacks: {
    // Add custom fields to JWT token
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

    // Add custom fields to session
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
