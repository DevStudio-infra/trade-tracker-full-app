import { PrismaClient, User, SubscriptionStatus } from "@prisma/client";

const prisma = new PrismaClient();

export interface NextAuthUser {
  email: string;
  name?: string;
}

export const syncUser = async (authUser: NextAuthUser) => {
  try {
    const user = await prisma.user.upsert({
      where: {
        email: authUser.email,
      },
      update: {
        name: authUser.name,
      },
      create: {
        email: authUser.email,
        name: authUser.name,
      },
    });
    return user;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export class UserService {
  async findUsersBySubscription(status: SubscriptionStatus): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        subscription: {
          status,
        },
      },
      include: {
        subscription: true,
      },
    });
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        subscription: {
          stripeCustomerId,
        },
      },
      include: {
        subscription: true,
      },
    });
  }

  async updateSubscription(
    userId: string,
    data: {
      status: SubscriptionStatus;
      stripeSubscriptionId: string | null;
    }
  ): Promise<void> {
    await prisma.subscription.update({
      where: {
        userId,
      },
      data,
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async updateWelcomeSeen(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { hasSeenWelcome: true },
    });
  }

  async updateTermsAcceptance(userId: string, acceptTerms: boolean, acceptPrivacy: boolean, hasCompletedOnboarding: boolean): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        hasAcceptedToS: acceptTerms,
        hasAcceptedPrivacy: acceptPrivacy,
        hasCompletedOnboarding: hasCompletedOnboarding,
      },
    });
  }

  async updatePrivacyAcceptance(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: {
        hasAcceptedPrivacy: true,
      },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id: userId },
    });
  }
}

export const userService = new UserService();
