import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize() {
        // Never called in middleware.
        return null;
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
} satisfies NextAuthConfig;