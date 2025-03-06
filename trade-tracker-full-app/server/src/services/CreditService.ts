import { PrismaClient, CreditTransaction, User } from "@prisma/client";

const prisma = new PrismaClient();

const FREE_TIER_CREDITS = 6;
const PAID_TIER_CREDITS = 100;

export class CreditService {
  async getBalance(userId: string): Promise<{ balance: number; usedThisMonth: number; totalCredits: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        creditTransactions: {
          where: {
            operation: "USAGE",
            createdAt: {
              gte: new Date(new Date().setDate(1)), // Start of current month
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPro = user.subscription?.status === "ACTIVE";
    const totalCredits = isPro ? PAID_TIER_CREDITS : FREE_TIER_CREDITS;

    const usedThisMonth = user.creditTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      balance: user.credits,
      usedThisMonth,
      totalCredits,
    };
  }

  async getTransactionHistory(userId: string): Promise<CreditTransaction[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return prisma.creditTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async useCredits(userId: string, amount: number, operation: string): Promise<{ balance: number; transaction: CreditTransaction }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    // Update credit balance and create transaction record
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          credits: {
            decrement: amount,
          },
        },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: -amount,
          operation,
        },
      }),
    ]);

    return {
      balance: updatedUser.credits,
      transaction,
    };
  }

  async refreshCredits(): Promise<void> {
    const users = await prisma.user.findMany({
      include: {
        subscription: true,
        creditTransactions: {
          where: {
            operation: "PURCHASE",
          },
        },
      },
    });

    for (const user of users) {
      try {
        const isPaidUser = user.subscription?.status === "ACTIVE";
        const hasPurchaseHistory = user.creditTransactions.length > 0;

        let newBalance = user.credits;
        let transactionAmount = 0;
        let operation = "MONTHLY_REFRESH";

        if (isPaidUser) {
          // Paid users: Add monthly credits to existing balance
          transactionAmount = PAID_TIER_CREDITS;
          newBalance += PAID_TIER_CREDITS;
        } else {
          // Free users
          if (!hasPurchaseHistory) {
            // Reset to FREE_TIER_CREDITS if never purchased
            transactionAmount = FREE_TIER_CREDITS - user.credits;
            newBalance = FREE_TIER_CREDITS;
            operation = "MONTHLY_RESET";
          } else if (user.credits > FREE_TIER_CREDITS) {
            // Do nothing if balance is above FREE_TIER_CREDITS
            continue;
          } else if (user.credits > 0) {
            // Top up to FREE_TIER_CREDITS if balance is between 1-5
            transactionAmount = FREE_TIER_CREDITS - user.credits;
            newBalance = FREE_TIER_CREDITS;
            operation = "MONTHLY_TOPUP";
          } else {
            // Reset to FREE_TIER_CREDITS if balance is 0
            transactionAmount = FREE_TIER_CREDITS;
            newBalance = FREE_TIER_CREDITS;
            operation = "MONTHLY_RESET";
          }
        }

        // Update user's credit balance
        await prisma.user.update({
          where: { id: user.id },
          data: {
            credits: newBalance,
            lastCreditRecharge: new Date(),
          },
        });

        // Record the transaction if any credits were added
        if (transactionAmount !== 0) {
          await prisma.creditTransaction.create({
            data: {
              userId: user.id,
              amount: transactionAmount,
              operation,
            },
          });
        }
      } catch (error) {
        console.error(`Error processing credits for user ${user.id}:`, error);
      }
    }
  }
}

export const creditService = new CreditService();
