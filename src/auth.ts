import NextAuth from "next-auth";
import authConfig from "./auth.config";

import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

function discordIdFrom(
  account: { provider?: string; providerAccountId?: string } | null | undefined,
  profile: unknown
) {
  if (account?.provider !== "discord") return null;

  if (
    profile &&
    typeof profile === "object" &&
    "id" in profile &&
    typeof profile.id === "string"
  ) {
    return profile.id;
  }

  return account.providerAccountId ?? null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        if (user.suspended) return null;

        const valid = await bcrypt.compare(
          password,
          user.passwordHash
        );

        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            lastActiveAt: new Date(),
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          role: user.role,
        };
      },
    }),

    ...(process.env.DISCORD_CLIENT_ID &&
    process.env.DISCORD_CLIENT_SECRET
      ? [
          Discord({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      const discordId = discordIdFrom(account, profile);

      if (!discordId)
        return account?.provider !== "discord";

      const user = await prisma.user.findUnique({
        where: { discordId },
      });

      return Boolean(user && !user.suspended);
    },

    async jwt({ token, user, account, profile }) {
      const discordId = discordIdFrom(account, profile);

      if (discordId) {
        const discordUser = await prisma.user.findUnique({
          where: { discordId },
        });

        if (discordUser) {
          token.id = discordUser.id;
          token.role = discordUser.role;
          token.name = discordUser.username;
          token.email = discordUser.email;
          return token;
        }
      }

      if (user) {
        token.id = user.id as string;
        token.role = (user as any).role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.name = token.name;
        session.user.email = token.email ?? "";
      }

      return session;
    },
  },
});