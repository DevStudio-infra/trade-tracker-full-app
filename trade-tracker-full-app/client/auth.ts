import authConfig from "@/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@/lib/db";
import { getUserById } from "@/lib/user";

// More info: https://authjs.dev/getting-started/typescript#module-augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      hasAcceptedToS: boolean;
      hasAcceptedPrivacy: boolean;
      hasSeenWelcome: boolean;
      hasCompletedOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        const username = user.email.split("@")[0];
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: true },
        });

        if (existingUser) {
          // If user exists but doesn't have an account with this provider
          if (
            !existingUser.accounts.some(
              (acc) => acc.provider === account?.provider,
            )
          ) {
            if (!account) {
              console.error("[AUTH_ERROR] No account data provided");
              return false;
            }

            // Link the new account to the existing user
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            });
          }
          return true;
        }

        // For new users, create with terms acceptance if provided
        if (!account) {
          console.error("[AUTH_ERROR] No account data provided for new user");
          return false;
        }

        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || username,
            image:
              user.image ||
              `https://ui-avatars.com/api/?name=${username}&background=random`,
            hasAcceptedToS: false,
            hasAcceptedPrivacy: false,
            accounts: {
              create: [
                {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              ],
            },
            AICredit: {
              create: {
                balance: 6,
                transactions: {
                  create: {
                    amount: 6,
                    type: "MONTHLY_REFRESH",
                    status: "COMPLETED",
                    metadata: { reason: "Welcome bonus" },
                  },
                },
              },
            },
          },
        });

        return true;
      } catch (error) {
        console.error("[AUTH_ERROR]", error);
        return false;
      }
    },

    async session({ token, session }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.email) {
        session.user.email = token.email;
      }

      if (token.role) {
        session.user.role = token.role;
      }

      if (typeof token.hasAcceptedToS === "boolean") {
        session.user.hasAcceptedToS = token.hasAcceptedToS;
      } else {
        session.user.hasAcceptedToS = false; // Default to false if not set
      }

      if (typeof token.hasAcceptedPrivacy === "boolean") {
        session.user.hasAcceptedPrivacy = token.hasAcceptedPrivacy;
      } else {
        session.user.hasAcceptedPrivacy = false; // Default to false if not set
      }

      if (typeof token.hasCompletedOnboarding === "boolean") {
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding;
      } else {
        session.user.hasCompletedOnboarding = false; // Default to false if not set
      }

      session.user.name = token.name;
      session.user.image = token.picture;

      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (!token.sub) {
        return token;
      }

      try {
        const dbUser = await getUserById(token.sub);

        if (!dbUser) {
          return token;
        }

        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image;
        token.role = dbUser.role;
        token.hasAcceptedToS = dbUser.hasAcceptedToS;
        token.hasAcceptedPrivacy = dbUser.hasAcceptedPrivacy;

        return token;
      } catch (error) {
        return token;
      }
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
});
